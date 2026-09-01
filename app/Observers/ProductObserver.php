<?php

namespace App\Observers;

use App\Jobs\GenerateProductEmbedding;
use App\Models\Product;

class ProductObserver
{
    public function saved(Product $product): void
    {
        if ($product->wasRecentlyCreated || $product->wasChanged([
            'store_id', 'name_en', 'name_fr', 'name_ar',
            'description_en', 'description_fr', 'description_ar',
            'price', 'promo', 'categories', 'isActive',
        ])) {
            GenerateProductEmbedding::dispatch($product->id)->afterCommit();
        }
    }

    public function deleted(Product $product): void
    {
        $product->searchEmbedding()?->delete();
    }
}
