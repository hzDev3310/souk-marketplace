<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use App\Jobs\GenerateProductEmbedding;
use App\Models\Product;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('search:queue-embeddings', function () {
    $query = Product::query()->where('isActive', true);

    $query->select('id')->orderBy('id')->each(function (Product $product) {
        GenerateProductEmbedding::dispatch($product->id);
    });

    $this->info('Queued embeddings for active products.');
})->purpose('Queue Gemini embeddings for the product search index');
