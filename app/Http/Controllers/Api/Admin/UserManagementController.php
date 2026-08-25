<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\UserService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class UserManagementController extends Controller
{
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
            'storePhone' => 'nullable|string',
            'address' => 'nullable|string',
            'matriculeFiscale' => 'nullable|string',
            'rib' => 'nullable|string',
            'governorate' => 'nullable|string|max:50',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        $user = $this->userService->createStore($request->all());
        return response()->json(['message' => 'Store created successfully', 'data' => $user], 201);
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
            'storePhone' => 'nullable|string',
            'address' => 'nullable|string',
            'matriculeFiscale' => 'nullable|string',
            'rib' => 'nullable|string',
            'governorate' => 'nullable|string|max:50',
            'isActive' => 'nullable|boolean',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        $user = $this->userService->updateStore($id, $request->all());
        return response()->json(['message' => 'Store updated successfully', 'data' => $user]);
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
