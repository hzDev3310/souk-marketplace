<?php

namespace App\Http\Controllers\Api\Store;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;

class StoreOrderController extends Controller
{
    /**
     * Get all orders containing products from the authenticated store
     */
    public function index(Request $request)
    {
        $store = $request->user()->store;

        if (!$store) {
            return response()->json([
                'success' => false,
                'message' => 'No store associated with this account'
            ], 404);
        }

        // Get orders that have items from this store
        $orders = Order::whereHas('items', function ($query) use ($store) {
            $query->whereHas('product', function ($q) use ($store) {
                $q->where('store_id', $store->id);
            });
        })
        ->with(['items' => function ($query) use ($store) {
            $query->whereHas('product', function ($q) use ($store) {
                $q->where('store_id', $store->id);
            })->with('product');
        }, 'client'])
        ->paginate(15);

        // Append store_id to each item for easier filtering on frontend
        $orders->getCollection()->transform(function ($order) use ($store) {
            if ($order->items) {
                $order->items->each(function ($item) use ($store) {
                    $item->store_id = $store->id;
                });
            }
            return $order;
        });

        return response()->json([
            'success' => true,
            'data' => $orders
        ]);
    }

    /**
     * Get a specific order with store's products
     */
    public function show(Request $request, Order $order)
    {
        $store = $request->user()->store;

        if (!$store) {
            return response()->json([
                'success' => false,
                'message' => 'No store associated with this account'
            ], 404);
        }

        // Check if order contains products from this store
        $hasStoreProducts = OrderItem::where('order_id', $order->id)
            ->whereHas('product', function ($query) use ($store) {
                $query->where('store_id', $store->id);
            })
            ->exists();

        if (!$hasStoreProducts) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        // Get only items from this store
        $order->load(['items' => function ($query) use ($store) {
            $query->whereHas('product', function ($q) use ($store) {
                $q->where('store_id', $store->id);
            })->with('product.albums');
        }, 'client']);

        // Append store_id to each item for easier filtering on frontend
        if ($order->items) {
            $order->items->each(function ($item) use ($store) {
                $item->store_id = $store->id;
            });
        }

        return response()->json([
            'success' => true,
            'data' => $order
        ]);
    }

    /**
     * Update order status for store's products
     */
    public function updateStatus(Request $request, Order $order)
    {
        $store = $request->user()->store;

        if (!$store) {
            return response()->json([
                'success' => false,
                'message' => 'No store associated with this account'
            ], 404);
        }

        return response()->json([
            'success' => false,
            'message' => 'Only admin can change the order status. Stores can view status only.'
        ], 403);
    }

    /**
     * Update status of an individual order item (store-specific)
     * Also handles automatic order status logic
     */
    public function updateItemStatus(Request $request, Order $order, $itemId)
    {
        return response()->json([
            'success' => false,
            'message' => 'Only admin can change the order status. Stores can view status only.'
        ], 403);
    }

    /**
     * Helper method to get human-readable status labels
     */
    private function getStatusLabel($status)
    {
        $labels = [
            'en_cours' => 'Pending',
            'confirme' => 'Confirmed',
            'annule' => 'Cancelled',
            'en_shipping' => 'In Shipping',
            'shipping_company' => 'At Shipping Company',
            'shipped' => 'Shipped'
        ];

        return $labels[$status] ?? $status;
    }
}
