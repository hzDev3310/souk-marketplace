<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class OrderItem extends Model {
    use HasUuids;
    protected $fillable = ['order_id', 'product_id', 'variant_id', 'variant_name', 'variant_data', 'quantity', 'price', 'commission', 'status'];

    protected $casts = [
        'variant_data' => 'array',
    ];

    public function order() { return $this->belongsTo(Order::class); }
    public function product() { return $this->belongsTo(Product::class); }
    public function variant() { return $this->belongsTo(ProductVariant::class); }
}