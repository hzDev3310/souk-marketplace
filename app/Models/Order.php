<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Order extends Model {
    use HasUuids;
    protected $fillable = ['order_number', 'client_id', 'status', 'totalAmount'];

    public const ORDER_STATUSES = [
        'en_attente',
        'confirme',
        'imported_to_depot',
        'en_livraison',
        'livree',
        'retournee',
    ];

    public static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->order_number)) {
                $model->order_number = 'ORD-' . strtoupper(bin2hex(random_bytes(4)));
            }
        });
    }

    public function client() { return $this->belongsTo(Client::class); }
    public function items() { return $this->hasMany(OrderItem::class); }

    public static function normalizeStatus(?string $status): ?string
    {
        if ($status === null) {
            return null;
        }

        $status = strtolower(trim($status));

        $map = [
            'pending' => 'en_attente',
            'en_cours' => 'en_attente',
            'confirmed' => 'confirme',
            'confirme' => 'confirme',
            'imported' => 'imported_to_depot',
            'imported_from_store' => 'imported_to_depot',
            'imported_to_depot' => 'imported_to_depot',
            'in_shipping' => 'en_livraison',
            'en_shipping' => 'en_livraison',
            'shipping_company' => 'en_livraison',
            'shipped' => 'livree',
            'livree' => 'livree',
            'delivered' => 'livree',
            'returned' => 'retournee',
            'retournee' => 'retournee',
            'annule' => 'retournee',
        ];

        return $map[$status] ?? $status;
    }

    public function evaluateStatus()
    {
        $status = self::normalizeStatus($this->status);
        if ($status && !in_array($status, self::ORDER_STATUSES, true)) {
            $this->status = 'en_attente';
            $this->saveQuietly();
        }
    }
}