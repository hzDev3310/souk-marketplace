<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Product extends Model {
    use HasUuids;

    /**
     * Platform commission percentage charged on top of the store's base price.
     * Customer display price = base price x (1 + COMMISSION_RATE / 100).
     */
    public const COMMISSION_RATE = 10;

    protected $fillable = ['store_id', 'name_fr', 'name_ar', 'name_en', 'description_fr', 'description_ar', 'description_en', 'price', 'stock', 'slug', 'promo', 'categories', 'isActive'];
    protected $casts = ['categories' => 'array', 'isActive' => 'boolean'];

    public function store() { return $this->belongsTo(Store::class); }
    public function albums() { return $this->hasMany(ProductAlbum::class); }
    public function orderItems() { return $this->hasMany(OrderItem::class); }
    public function categoryLinks() { return $this->belongsToMany(Category::class); } 
    public function searchEmbedding() { return $this->hasOne(ProductSearchEmbedding::class); }

    /**
     * Price customers see before promo discounts (base price + commission).
     */
    public function getDisplayPriceAttribute(): float
    {
        return round((float) $this->price * (1 + self::COMMISSION_RATE / 100), 2);
    }

    /**
     * Final price the customer pays per unit (display price after promo).
     */
    public function customerPrice(): float
    {
        $display = $this->display_price;
        return $this->promo > 0 ? round($display * (1 - $this->promo / 100), 2) : $display;
    }

    /**
     * Amount the store earns per unit (base price after promo, no commission).
     */
    public function storePrice(): float
    {
        $base = (float) $this->price;
        return $this->promo > 0 ? round($base * (1 - $this->promo / 100), 2) : $base;
    }

    /**
     * Platform commission per unit (what the admin keeps).
     */
    public function commissionAmount(): float
    {
        return round($this->customerPrice() - $this->storePrice(), 2);
    }
}
