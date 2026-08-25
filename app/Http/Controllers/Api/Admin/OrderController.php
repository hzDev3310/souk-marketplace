<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $orders = Order::with(["client.user", "influencer.user"])
            ->withCount('items')
            ->withCount(['items as confirmed_items_count' => function ($query) {
                $query->where('status', 'confirme');
            }])
            ->orderBy("created_at", "desc")
            ->paginate(15);
            
        return response()->json($orders);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $order = Order::with(["client.user", "influencer.user", "items.product.store", "factures", "driver.user"])
            ->findOrFail($id);
            
        return response()->json($order);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $order = Order::findOrFail($id);

        $validated = $request->validate([
            "status" => "required|string|in:en_attente,confirme,imported_to_depot,en_livraison,livree,retournee",
            "driver_id" => "nullable|exists:shipping_emps,id"
        ]);

        $order->update([
            'status' => Order::normalizeStatus($validated['status']) ?? $validated['status'],
            'driver_id' => $validated['driver_id'] ?? $order->driver_id,
        ]);

        return response()->json([
            "message" => "Order updated successfully",
            "order" => $order->fresh(['client.user', 'driver.user', 'items.product'])
        ]);
    }

    /**
     * Update status of an individual order item
     */
    public function updateItemStatus(Request $request, $orderId, $itemId)
    {
        return response()->json([
            'message' => 'Only the order status can be changed by admin. Item-level status is read-only.'
        ], 403);
    }

    /**
     * Admin can remove order item and confirm manually
     */
    public function removeItem(Request $request, $orderId, $itemId)
    {
        $order = Order::findOrFail($orderId);
        $item = $order->items()->findOrFail($itemId);
        
        $item->delete();
        
        return response()->json([
            "message" => "Item removed",
            "order_status" => $order->fresh()->status
        ]);
    }
    
    /**
     * Manually confirm the order (as per requirement 4: admin can confirm manually)
     */
    public function confirmManually($id)
    {
        $order = Order::findOrFail($id);
        $order->update(['status' => 'confirme']);
        
        return response()->json([
            "message" => "Order confirmed manually",
            "order" => $order->fresh(['items'])
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $order = Order::findOrFail($id);
        $order->delete();
        
        return response()->json(["message" => "Order deleted successfully"]);
    }

    /**
     * Get orders by client ID
     */
    public function getByClient($clientId)
    {
        $orders = Order::where('client_id', $clientId)
            ->with(['items.product.albums', 'influencer.user', 'factures'])
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json([
            'success' => true,
            'data' => $orders
        ]);
    }
}
