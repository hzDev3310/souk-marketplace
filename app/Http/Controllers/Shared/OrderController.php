<?php

namespace App\Http\Controllers\Shared;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    protected function getBaseQuery(Request $request)
    {
        $user = $request->user();
        if ($user->role === 'ADMIN') {
            return Order::query()->with(["client.user"]);
        }
        
        $store = $user->store;
        if (!$store) {
            throw new \Illuminate\Http\Exceptions\HttpResponseException(
                response()->json(['success' => false, 'message' => 'No store associated with this account'], 404)
            );
        }

        return Order::whereHas('items', function ($query) use ($store) {
            $query->whereHas('product', function ($q) use ($store) {
                $q->where('store_id', $store->id);
            });
        })->with(['client.user']);
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $query = $this->getBaseQuery($request);

        if ($user->role === 'STORE') {
            $store = $user->store;
            if (!$store) {
                return response()->json([
                    'success' => false,
                    'message' => 'No store associated with this account'
                ], 404);
            }
            $query->with(['items' => function ($q) use ($store) {
                $q->whereHas('product', function ($sq) use ($store) {
                    $sq->where('store_id', $store->id);
                })->with('product.albums');
            }]);
            
            $orders = $query->orderBy('created_at', 'desc')->paginate(15);
            
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
        } else {
            $query->withCount('items')->withCount(['items as confirmed_items_count' => function ($q) {
                $q->where('status', 'confirme');
            }]);
            $orders = $query->orderBy('created_at', 'desc')->paginate(15);
            return response()->json($orders);
        }
    }

    public function show(Request $request, $id)
    {
        $user = $request->user();
        $order = Order::findOrFail($id);

        if ($user->role !== 'ADMIN') {
            $store = $user->store;
            if (!$store) {
                return response()->json([
                    'success' => false,
                    'message' => 'No store associated with this account'
                ], 404);
            }
            $hasStoreProducts = OrderItem::where('order_id', $order->id)
                ->whereHas('product', function ($q) use ($store) {
                    $q->where('store_id', $store->id);
                })->exists();

            if (!$hasStoreProducts) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }
            
            $order->load(['items' => function ($q) use ($store) {
                $q->whereHas('product', function ($sq) use ($store) {
                    $sq->where('store_id', $store->id);
                })->with(['product.albums', 'product.store']);
            }, 'client.user', 'items.product.albums']);

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
        } else {
            $order->load(["client.user", "items.product.albums", "items.product.store"]);
            return response()->json($order);
        }
    }

    public function showByNumber(Request $request, $orderNumber)
    {
        $order = Order::where('order_number', $orderNumber)->firstOrFail();
        return $this->show($request, $order->id);
    }

    public function update(Request $request, $id)
    {
        if ($request->user()->role !== 'ADMIN') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $order = Order::findOrFail($id);
        $validated = $request->validate([
            "status" => "required|string|in:en_attente,confirme,imported_to_depot,en_livraison,livree,retournee,annule"
        ]);

        $order->update([
            'status' => Order::normalizeStatus($validated['status']) ?? $validated['status'],
        ]);

        return response()->json([
            "message" => "Order updated successfully",
            "order" => $order->fresh(['client.user', 'items.product'])
        ]);
    }

    public function updateItemStatus(Request $request, $orderId, $itemId)
    {
        return response()->json([
            'success' => false,
            'message' => 'Only admin can change the order status. Stores can view status only.'
        ], 403);
    }

    public function updateStatus(Request $request, Order $order)
    {
        return response()->json([
            'success' => false,
            'message' => 'Only admin can change the order status. Stores can view status only.'
        ], 403);
    }

    public function removeItem(Request $request, $orderId, $itemId)
    {
        if ($request->user()->role !== 'ADMIN') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $order = Order::findOrFail($orderId);
        $item = $order->items()->findOrFail($itemId);
        
        $item->delete();
        
        return response()->json([
            "message" => "Item removed",
            "order_status" => $order->fresh()->status
        ]);
    }
    
    public function confirmManually(Request $request, $id)
    {
        if ($request->user()->role !== 'ADMIN') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $order = Order::findOrFail($id);
        $order->update(['status' => 'confirme']);
        
        return response()->json([
            "message" => "Order confirmed manually",
            "order" => $order->fresh(['items'])
        ]);
    }

    public function verify(Request $request, $id)
    {
        return $this->confirmManually($request, $id);
    }

    public function destroy(Request $request, $id)
    {
        if ($request->user()->role !== 'ADMIN') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $order = Order::findOrFail($id);
        $order->delete();
        
        return response()->json(["message" => "Order deleted successfully"]);
    }

    public function getByClient(Request $request, $clientId)
    {
        if ($request->user()->role !== 'ADMIN') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $orders = Order::where('client_id', $clientId)
            ->with(['items.product.albums', 'items.product.store', 'factures', 'client.user'])
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json([
            'success' => true,
            'data' => $orders
        ]);
    }
}
