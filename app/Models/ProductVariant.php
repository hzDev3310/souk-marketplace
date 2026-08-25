<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProductVariant extends Model
{
    // Minimal scaffold to satisfy references elsewhere in the codebase.
    protected $guarded = [];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'parent_variant_id');
    }
}
