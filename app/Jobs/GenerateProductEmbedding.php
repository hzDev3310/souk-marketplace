<?php

namespace App\Jobs;

use App\Models\Product;
use App\Services\ProductSemanticSearchService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class GenerateProductEmbedding implements ShouldQueue, ShouldBeUnique
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $uniqueFor = 300;

    public function __construct(public string $productId)
    {
    }

    public function uniqueId(): string
    {
        return $this->productId;
    }

    public function handle(ProductSemanticSearchService $search): void
    {
        $product = Product::with('store')->find($this->productId);

        if ($product && $product->isActive) {
            $search->syncEmbedding($product);
        }
    }
}
