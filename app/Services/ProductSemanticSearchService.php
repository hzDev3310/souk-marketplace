<?php

namespace App\Services;

use App\Jobs\GenerateProductEmbedding;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductSearchEmbedding;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use Throwable;

class ProductSemanticSearchService
{
    public function __construct(private GeminiEmbeddingService $embeddingService) {}

    public function isEnabled(): bool
    {
        return $this->embeddingService->isEnabled();
    }

    public function search(string $query, Builder $baseQuery): Collection
    {
        return $this->debugSearch($query, $baseQuery)->pluck('product')->values();
    }

    /** A Gemini outage never prevents keyword/fuzzy results from being returned. */
    public function debugSearch(string $query, Builder $baseQuery): Collection
    {
        $query = trim($query);
        if ($query === '') return collect();

        $products = $baseQuery->with('store')->get();
        if ($products->isEmpty()) return collect();

        $categoryMap = $this->buildCategoryMap($products);
        $tokens = $this->tokens($query);
        $embeddings = ProductSearchEmbedding::whereIn('product_id', $products->pluck('id'))->get()->keyBy('product_id');
        $this->queueMissingEmbeddings($products, $categoryMap, $embeddings);

        $queryEmbedding = [];
        if ($this->isEnabled()) {
            try {
                $queryEmbedding = $this->embeddingService->embedQuery($query);
            } catch (Throwable $exception) {
                $this->safeReport($exception);
            }
        }

        $priceCeiling = max((float) $products->max(fn (Product $product) => $product->customerPrice()), 1.0);
        $budgetIntent = $this->hasBudgetIntent($query);

        return $products->map(function (Product $product) use ($embeddings, $queryEmbedding, $tokens, $categoryMap, $priceCeiling, $budgetIntent) {
            $document = $this->buildSearchDocument($product, $categoryMap);
            $keywordScore = $this->keywordScore($tokens, $document);
            $embedding = $embeddings->get($product->id)?->embedding ?? [];
            $semanticScore = $queryEmbedding && $embedding
                ? max(0.0, $this->cosineSimilarity($queryEmbedding, $embedding))
                : 0.0;

            $relevance = $queryEmbedding
                ? ($semanticScore * 0.82) + ($keywordScore * 0.18)
                : $keywordScore;
            $promoBoost = min(((float) $product->promo / 100) * 0.20, 0.20);
            $pricePenalty = ($product->customerPrice() / $priceCeiling) * ($budgetIntent ? 0.30 : 0.08);

            return [
                'product' => $product,
                'score' => $relevance + $promoBoost - $pricePenalty,
                'semantic_score' => $semanticScore,
                'keyword_score' => $keywordScore,
                'promo_boost' => $promoBoost,
                'price_penalty' => $pricePenalty,
                'source' => $queryEmbedding ? 'hybrid' : 'keyword_fallback',
            ];
        })
            ->filter(fn (array $row) => $row['semantic_score'] > 0.12 || $row['keyword_score'] > 0.15)
            ->sortByDesc('score')
            ->values();
    }

    /** Generate or refresh one document from product metadata in the background job. */
    public function syncEmbedding(Product $product): void
    {
        if (!$this->isEnabled()) return;

        $product->loadMissing('store');
        $categoryMap = $this->buildCategoryMap(collect([$product]));
        $document = $this->buildSearchDocument($product, $categoryMap);
        $hash = sha1($document);
        $current = $product->searchEmbedding;

        if ($current?->content_hash === $hash && $current->model === $this->modelName()) return;

        $vector = $this->embeddingService->embedDocuments([$document])[0] ?? [];
        if (!$vector) throw new \RuntimeException('Gemini returned an empty product embedding.');

        ProductSearchEmbedding::updateOrCreate(
            ['product_id' => $product->id],
            ['content_hash' => $hash, 'model' => $this->modelName(), 'dimensions' => count($vector), 'embedding' => $vector],
        );
    }

    private function queueMissingEmbeddings(Collection $products, Collection $categoryMap, Collection $embeddings): void
    {
        foreach ($products as $product) {
            $current = $embeddings->get($product->id);
            $hash = sha1($this->buildSearchDocument($product, $categoryMap));
            if (!$current || $current->content_hash !== $hash || $current->model !== $this->modelName()) {
                GenerateProductEmbedding::dispatch($product->id);
            }
        }
    }

    private function modelName(): string
    {
        return setting('gemini_embedding_model') ?: config('services.gemini.embedding_model', 'models/gemini-embedding-001');
    }

    private function buildCategoryMap(Collection $products): Collection
    {
        $categoryIds = $products->pluck('categories')->flatten(1)->filter()->unique()->values();
        return $categoryIds->isEmpty() ? collect() : Category::whereIn('id', $categoryIds)->get()->keyBy('id');
    }

    /** [Category] - [Store] - [Product Name]: [Description]. Price: [Price]. Promo: [Discount %] */
    private function buildSearchDocument(Product $product, Collection $categoryMap): string
    {
        $categories = collect($product->categories ?? [])
            ->map(fn ($id) => $categoryMap->get($id))
            ->filter()
            ->flatMap(fn (Category $category) => [$category->name_en, $category->name_fr, $category->name_ar])
            ->filter()->unique()->implode(', ');
        $store = collect([$product->store?->name_en, $product->store?->name_fr, $product->store?->name_ar])->filter()->unique()->implode(' / ');
        $name = collect([$product->name_en, $product->name_fr, $product->name_ar])->filter()->unique()->implode(' / ');
        $description = collect([$product->description_en, $product->description_fr, $product->description_ar])->filter()->unique()->implode(' / ');

        return "[{$categories}] - [{$store}] - [{$name}]: {$description}. Price: {$product->customerPrice()}. Promo: {$product->promo}%";
    }

    private function hasBudgetIntent(string $query): bool
    {
        return Str::contains($this->normalizeText($query), [
            'cheap', 'budget', 'affordable', 'low price', 'deal', 'discount', 'sale',
            'pas cher', 'bon marché', 'economique', 'économique', 'promo', 'offre',
            'رخيص', 'رخيصة', 'اقتصادي', 'عرض', 'تخفيض',
        ]);
    }

    private function normalizeText(string $text): string
    {
        return trim(Str::of($text)->squish()->lower()->value());
    }

    private function tokens(string $text): array
    {
        return collect([$this->normalizeText($text), $this->normalizeText(Str::ascii($text))])
            ->filter()->unique()
            ->flatMap(fn (string $value) => preg_split('/[^\p{L}\p{N}]+/u', $value) ?: [])
            ->filter(fn (string $token) => mb_strlen($token) >= 2)
            ->unique()->values()->all();
    }

    private function keywordScore(array $tokens, string $document): float
    {
        if (!$tokens) return 0.0;
        $normalizedDocument = $this->normalizeText($document);
        $documentTokens = $this->tokens($document);
        return collect($tokens)->map(fn (string $token) => $this->tokenMatchScore($token, $normalizedDocument, $documentTokens))->avg() ?? 0.0;
    }

    private function tokenMatchScore(string $token, string $document, array $documentTokens): float
    {
        if (str_contains($document, $token)) return 1.0;
        if (!preg_match('/^[\x20-\x7E]+$/', $token)) return 0.0;

        return collect($documentTokens)
            ->filter(fn (string $candidate) => preg_match('/^[\x20-\x7E]+$/', $candidate))
            ->map(function (string $candidate) use ($token) {
                $length = max(strlen($token), strlen($candidate));
                if ($length < 3 || abs(strlen($token) - strlen($candidate)) > 2) return 0.0;
                $similarity = 1 - (levenshtein($token, $candidate) / $length);
                return $similarity >= 0.72 ? $similarity : 0.0;
            })->max() ?? 0.0;
    }

    private function cosineSimilarity(array $a, array $b): float
    {
        $dot = 0.0; $normA = 0.0; $normB = 0.0;
        foreach (array_keys($a) as $index) {
            if (!isset($b[$index])) continue;
            $dot += $a[$index] * $b[$index];
            $normA += $a[$index] ** 2;
            $normB += $b[$index] ** 2;
        }
        return $normA === 0.0 || $normB === 0.0 ? 0.0 : $dot / (sqrt($normA) * sqrt($normB));
    }

    private function safeReport(Throwable $exception): void
    {
        try { report($exception); } catch (Throwable) { /* fallback search remains available */ }
    }
}
