<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Throwable;

class SearchQueryNormalizer
{
    public function normalize(string $query): string
    {
        $fallback = $this->localNormalize($query);

        if (!filled(config('services.groq.api_key'))) {
            return $fallback;
        }

        try {
            $response = Http::timeout(8)
                ->withToken(config('services.groq.api_key'))
                ->post(config('services.groq.base_url'), [
                    'model' => config('services.groq.model'),
                    'messages' => [[
                        'role' => 'system',
                        'content' => 'Normalize an e-commerce product search in English, French, or Arabic. Correct obvious spelling mistakes, remove conversational filler and keep product/category/brand/color/size terms. Return only JSON: {"query":"up to 12 useful words"}. Never invent a product.',
                    ], [
                        'role' => 'user',
                        'content' => $query,
                    ]],
                    'temperature' => 0,
                    'max_tokens' => 80,
                    'response_format' => ['type' => 'json_object'],
                ])
                ->throw()
                ->json();

            $normalized = json_decode($response['choices'][0]['message']['content'] ?? '', true)['query'] ?? null;

            return is_string($normalized) && filled($normalized) && mb_strlen($normalized) <= 160
                ? trim($normalized)
                : $fallback;
        } catch (Throwable) {
            return $fallback;
        }
    }

    private function localNormalize(string $query): string
    {
        $query = Str::of($query)->squish()->lower()->value();
        $query = str_replace(['t shirt', 'tshirt', 'tee shirt'], 't-shirt', $query);

        $stopWords = [
            'best', 'find', 'show', 'me', 'i want', 'looking for', 'under', 'below',
            'meilleur', 'meilleure', 'cherche', 'je veux', 'moins de', 'sous',
            'افضل', 'أفضل', 'اريد', 'أريد', 'ابحث', 'أبحث', 'تحت', 'اقل من', 'أقل من',
        ];

        return trim(str_ireplace($stopWords, ' ', $query));
    }
}
