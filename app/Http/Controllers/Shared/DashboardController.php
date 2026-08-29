<?php

namespace App\Http\Controllers\Shared;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\Order;
use App\Models\Product;
use App\Models\Store;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $productQuery = Product::query()->with('albums')->withCount(['orderItems as orders_count']);
        $orderQuery = Order::query()->with(['client.user', 'items.product.albums']);

        $payload = [
            'client_count' => 0,
            'store_count' => 0,
        ];

        if ($user->role === 'STORE') {
            $store = $user->store;
            if (!$store) {
                return response()->json(['message' => 'No store associated with this account'], 404);
            }

            $productQuery->where('store_id', $store->id);
            $orderQuery->whereHas('items.product', fn ($query) => $query->where('store_id', $store->id))
                ->with(['items' => fn ($query) => $query->whereHas('product', fn ($productQuery) => $productQuery->where('store_id', $store->id))->with('product.albums')]);
        } else {
            $payload['client_count'] = Client::count();
            $payload['store_count'] = Store::count();
        }

        return response()->json($payload + [
            'orders' => $orderQuery->latest()->get(),
            'products' => $productQuery->latest()->get(),
        ]);
    }
}
