<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Concerns\HandlesFileUploads;
use App\Models\Store;
use App\Mail\StoreAccountCreated;
use App\Services\UserService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class UserManagementController extends Controller
{
    use HandlesFileUploads;

    protected $userService;
    
    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }
    
    /**
     * =========================
     * CLIENT MANAGEMENT
     * =========================
     */
    
    public function getClients()
    {
        $clients = $this->userService->getAllUsersByRole('CLIENT');
        return response()->json(['data' => $clients]);
    }
    
    public function createClient(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'family_name' => 'nullable|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'address' => 'nullable|string',
            'city' => 'nullable|string',
            'codePostal' => 'nullable|string',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        $user = $this->userService->createClient($request->all());
        return response()->json(['message' => 'Client created successfully', 'data' => $user], 201);
    }
    
    public function updateClient(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'nullable|string|max:255',
            'family_name' => 'nullable|string|max:255',
            'email' => 'nullable|email|unique:users,email,' . $id,
            'password' => 'nullable|string|min:6',
            'address' => 'nullable|string',
            'city' => 'nullable|string',
            'codePostal' => 'nullable|string',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        $user = $this->userService->updateClient($id, $request->all());
        return response()->json(['message' => 'Client updated successfully', 'data' => $user]);
    }
    
    public function deleteClient($id)
    {
        $this->userService->deleteClient($id);
        return response()->json(['message' => 'Client deleted successfully']);
    }
    
    /**
     * =========================
     * INFLUENCER MANAGEMENT
     * =========================
     */
    
    public function getInfluencers()
    {
        $influencers = $this->userService->getAllUsersByRole('INFLUENCER');
        return response()->json(['data' => $influencers]);
    }
    
    public function createInfluencer(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'family_name' => 'nullable|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'phone' => 'nullable|string',
            'address' => 'nullable|string',
            'city' => 'nullable|string',
            'cin' => 'nullable|string',
            'rib' => 'nullable|string',
            'commissionRate' => 'nullable|numeric',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        $user = $this->userService->createInfluencer($request->all());
        return response()->json(['message' => 'Influencer created successfully', 'data' => $user], 201);
    }
    
    public function updateInfluencer(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'nullable|string|max:255',
            'family_name' => 'nullable|string|max:255',
            'email' => 'nullable|email|unique:users,email,' . $id,
            'password' => 'nullable|string|min:6',
            'phone' => 'nullable|string',
            'address' => 'nullable|string',
            'city' => 'nullable|string',
            'cin' => 'nullable|string',
            'rib' => 'nullable|string',
            'commissionRate' => 'nullable|numeric',
            'isActive' => 'nullable|boolean',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        $user = $this->userService->updateInfluencer($id, $request->all());
        return response()->json(['message' => 'Influencer updated successfully', 'data' => $user]);
    }
    
    public function deleteInfluencer($id)
    {
        $this->userService->deleteInfluencer($id);
        return response()->json(['message' => 'Influencer deleted successfully']);
    }
    
    /**
     * =========================
     * STORE MANAGEMENT
     * =========================
     */
    
    public function getStores()
    {
        $stores = $this->userService->getAllUsersByRole('STORE');

        $productCounts = \App\Models\Product::query()
            ->selectRaw('store_id, COUNT(*) as products_count')
            ->groupBy('store_id')
            ->pluck('products_count', 'store_id');

        $orderStats = \Illuminate\Support\Facades\DB::table('order_items')
            ->join('products', 'products.id', '=', 'order_items.product_id')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->selectRaw("products.store_id as store_id,
                COUNT(DISTINCT orders.id) as total_orders,
                COUNT(DISTINCT CASE WHEN orders.status = 'livree' THEN orders.id END) as delivered_orders,
                COUNT(DISTINCT CASE WHEN orders.status = 'retournee' THEN orders.id END) as returned_orders,
                COUNT(DISTINCT CASE WHEN orders.status = 'annule' THEN orders.id END) as cancelled_orders,
                COALESCE(SUM(order_items.price * order_items.quantity), 0) as revenue")
            ->groupBy('products.store_id')
            ->get()
            ->keyBy('store_id');

        foreach ($stores as &$store) {
            $storeId = $store['store']['id'] ?? null;
            $store['products_count'] = $storeId ? (int) ($productCounts[$storeId] ?? 0) : 0;

            $stats = $storeId ? ($orderStats[$storeId] ?? null) : null;
            $store['total_orders'] = $stats ? (int) $stats->total_orders : 0;
            $store['delivered_orders'] = $stats ? (int) $stats->delivered_orders : 0;
            $store['returned_orders'] = $stats ? (int) $stats->returned_orders : 0;
            $store['cancelled_orders'] = $stats ? (int) $stats->cancelled_orders : 0;
            $store['revenue'] = $stats ? (float) $stats->revenue : 0.0;
        }
        unset($store);

        return response()->json(['data' => $stores]);
    }

    public function getStoreList()
    {
        $stores = \App\Models\Store::select('id', 'name_fr', 'name_ar', 'name_en', 'isActive')->get();
        return response()->json(['data' => $stores]);
    }
    
    public function createStore(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'family_name' => 'nullable|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'name_fr' => 'nullable|string',
            'name_ar' => 'nullable|string',
            'name_en' => 'nullable|string',
            'description_fr' => 'nullable|string',
            'description_ar' => 'nullable|string',
            'description_en' => 'nullable|string',
            'storePhone' => 'nullable|string',
            'address' => 'nullable|string',
            'matriculeFiscale' => 'nullable|string',
            'rib' => 'nullable|string',
            'logo' => 'nullable|file|image|max:4096',
            'cover' => 'nullable|file|image|max:4096',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        $data = $request->except(['logo', 'cover']);
        $data = $this->persistStoreImages($data, $request);
        
        $user = $this->userService->createStore($data);
        $emailSent = true;

        try {
            Mail::to($user->email)->send(new StoreAccountCreated($user, $request->string('password')->toString()));
        } catch (\Throwable $exception) {
            $emailSent = false;
            Log::warning('Store account email could not be sent.', [
                'store_user_id' => $user->id,
                'recipient' => $user->email,
                'exception' => $exception->getMessage(),
            ]);
        }

        return response()->json([
            'message' => 'Store created successfully',
            'data' => $user,
            'email_sent' => $emailSent,
        ], 201);
    }
    
    public function updateStore(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'nullable|string|max:255',
            'family_name' => 'nullable|string|max:255',
            'email' => 'nullable|email|unique:users,email,' . $id,
            'password' => 'nullable|string|min:6',
            'name_fr' => 'nullable|string',
            'name_ar' => 'nullable|string',
            'name_en' => 'nullable|string',
            'description_fr' => 'nullable|string',
            'description_ar' => 'nullable|string',
            'description_en' => 'nullable|string',
            'storePhone' => 'nullable|string',
            'address' => 'nullable|string',
            'matriculeFiscale' => 'nullable|string',
            'rib' => 'nullable|string',
            'isActive' => 'nullable|boolean',
            'logo' => 'nullable|file|image|max:4096',
            'cover' => 'nullable|file|image|max:4096',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        $data = $request->except(['logo', 'cover']);
        
        if ($request->hasFile('logo') || $request->hasFile('cover')) {
            $data = $this->persistStoreImages($data, $request, $id);
        }
        
        $user = $this->userService->updateStore($id, $data);
        return response()->json(['message' => 'Store updated successfully', 'data' => $user]);
    }
    
    /**
     * Store uploaded logo/cover files and return their public paths.
     * When updating ($id given), old files are removed from disk first.
     */
    private function persistStoreImages(array $data, Request $request, ?string $userId = null): array
    {
        $store = null;
        if ($userId && $request->hasFile('logo') || $userId && $request->hasFile('cover')) {
            $user = \App\Models\User::where('id', $userId)->with('store')->first();
            $store = $user?->store;
        }

        $storeName = $store?->name_en ?: $store?->name_fr ?: $store?->name_ar ?: ($data['name_en'] ?? $data['name_fr'] ?? $data['name_ar'] ?? 'store');

        if ($request->hasFile('logo')) {
            if ($store?->logo && Storage::exists('public/' . $store->logo)) {
                Storage::delete('public/' . $store->logo);
            }
            try {
                $data['logo'] = $this->storeUploadedFile($request->file('logo'), 'store_logos', 'store', $storeName);
            } catch (\Throwable $e) {
                return $this->fileUploadErrorResponse();
            }
        }

        if ($request->hasFile('cover')) {
            if ($store?->cover && Storage::exists('public/' . $store->cover)) {
                Storage::delete('public/' . $store->cover);
            }
            try {
                $data['cover'] = $this->storeUploadedFile($request->file('cover'), 'store_covers', 'store', $storeName);
            } catch (\Throwable $e) {
                return $this->fileUploadErrorResponse();
            }
        }

        return $data;
    }
    
    public function deleteStore($id)
    {
        $this->userService->deleteStore($id);
        return response()->json(['message' => 'Store deleted successfully']);
    }
    
    /**
     * =========================
     * ADMIN MANAGEMENT
     * =========================
     */
    
    public function getAdmins()
    {
        $admins = $this->userService->getAllUsersByRole('ADMIN');
        return response()->json(['data' => $admins]);
    }
    
    public function createAdmin(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'family_name' => 'nullable|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'platformCommissionAdmin' => 'nullable|numeric',
            'platformCommissionShare' => 'nullable|numeric',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        $user = $this->userService->createAdmin($request->all());
        return response()->json(['message' => 'Admin created successfully', 'data' => $user], 201);
    }
    
    public function updateAdmin(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'nullable|string|max:255',
            'family_name' => 'nullable|string|max:255',
            'email' => 'nullable|email|unique:users,email,' . $id,
            'password' => 'nullable|string|min:6',
            'platformCommissionAdmin' => 'nullable|numeric',
            'platformCommissionShare' => 'nullable|numeric',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        $user = $this->userService->updateAdmin($id, $request->all());
        return response()->json(['message' => 'Admin updated successfully', 'data' => $user]);
    }
    
    public function deleteAdmin($id)
    {
        $this->userService->deleteAdmin($id);
        return response()->json(['message' => 'Admin deleted successfully']);
    }
    
    /**
     * =========================
     * SHIPPING COMPANY MANAGEMENT
     * =========================
     */
    
    public function getShippingCompanies()
    {
        $companies = $this->userService->getAllUsersByRole('SHIPPING_COMPANY');
        return response()->json(['data' => $companies]);
    }
    
    public function createShippingCompany(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'family_name' => 'nullable|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'company_name' => 'nullable|string',
            'companyPhone' => 'nullable|string',
            'address' => 'nullable|string',
            'matriculeFiscale' => 'nullable|string',
            'rib' => 'nullable|string',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        $user = $this->userService->createShippingCompany($request->all());
        return response()->json(['message' => 'Shipping company created successfully', 'data' => $user], 201);
    }
    
    public function updateShippingCompany(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'nullable|string|max:255',
            'family_name' => 'nullable|string|max:255',
            'email' => 'nullable|email|unique:users,email,' . $id,
            'password' => 'nullable|string|min:6',
            'company_name' => 'nullable|string',
            'companyPhone' => 'nullable|string',
            'address' => 'nullable|string',
            'matriculeFiscale' => 'nullable|string',
            'rib' => 'nullable|string',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        $user = $this->userService->updateShippingCompany($id, $request->all());
        return response()->json(['message' => 'Shipping company updated successfully', 'data' => $user]);
    }
    
    public function deleteShippingCompany($id)
    {
        $this->userService->deleteShippingCompany($id);
        return response()->json(['message' => 'Shipping company deleted successfully']);
    }
    
    /**
     * =========================
     * SHIPPING EMPLOYEE MANAGEMENT
     * =========================
     */
    
    public function getShippingEmps()
    {
        $emps = $this->userService->getAllUsersByRole('SHIPPING_EMP');
        return response()->json(['data' => $emps]);
    }
    
    public function createShippingEmp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'family_name' => 'nullable|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'Phone' => 'nullable|string',
            'address' => 'nullable|string',
            'cin' => 'nullable|string',
            'rib' => 'nullable|string',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        $user = $this->userService->createShippingEmp($request->all());
        return response()->json(['message' => 'Shipping employee created successfully', 'data' => $user], 201);
    }
    
    public function updateShippingEmp(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'nullable|string|max:255',
            'family_name' => 'nullable|string|max:255',
            'email' => 'nullable|email|unique:users,email,' . $id,
            'password' => 'nullable|string|min:6',
            'Phone' => 'nullable|string',
            'address' => 'nullable|string',
            'cin' => 'nullable|string',
            'rib' => 'nullable|string',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        $user = $this->userService->updateShippingEmp($id, $request->all());
        return response()->json(['message' => 'Shipping employee updated successfully', 'data' => $user]);
    }
    
    public function deleteShippingEmp($id)
    {
        $this->userService->deleteShippingEmp($id);
        return response()->json(['message' => 'Shipping employee deleted successfully']);
    }
    
    /**
     * =========================
     * GENERAL USER MANAGEMENT
     * =========================
     */
    
    public function getUser($id)
    {
        $user = $this->userService->getUserById($id);
        
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }
        
        return response()->json(['data' => $user]);
    }
    
    public function blockUser($id)
    {
        $user = $this->userService->blockUser($id, true);
        return response()->json(['message' => 'User blocked successfully', 'data' => $user]);
    }
    
    public function unblockUser($id)
    {
        $user = $this->userService->unblockUser($id);
        return response()->json(['message' => 'User unblocked successfully', 'data' => $user]);
    }
    
    public function deleteAnyUser($id)
    {
        $this->userService->deleteAnyUser($id);
        return response()->json(['message' => 'User deleted successfully']);
    }
}
