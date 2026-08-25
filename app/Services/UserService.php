<?php

namespace App\Services;

use App\Models\User;
use App\Models\Client;
use App\Models\Influencer;
use App\Models\Store;
use App\Models\Admin;
use App\Models\ShippingCompany;
use App\Models\ShippingEmp;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class UserService
{
    /**
     * =========================
     * CLIENT CRUD OPERATIONS
     * =========================
     */
    
    public function createClient(array $data): User
    {
        return DB::transaction(function () use ($data) {
            $user = $this->createBaseUser($data, 'CLIENT');
            
            Client::create([
                'user_id' => $user->id,
                'address' => $data['address'] ?? null,
                'city' => $data['city'] ?? null,
                'codePostal' => $data['codePostal'] ?? null,
                'lon' => $data['lon'] ?? null,
                'lat' => $data['lat'] ?? null,
            ]);
            
            return $user->load('client');
        });
    }
    
    public function updateClient(string $userId, array $data): User
    {
        return DB::transaction(function () use ($userId, $data) {
            $user = User::where('id', $userId)->where('role', 'CLIENT')->firstOrFail();
            $this->updateBaseUser($user, $data);
            
            if ($user->client) {
                $user->client->update([
                    'address' => $data['address'] ?? $user->client->address,
                    'city' => $data['city'] ?? $user->client->city,
                    'codePostal' => $data['codePostal'] ?? $user->client->codePostal,
                    'lon' => $data['lon'] ?? $user->client->lon,
                    'lat' => $data['lat'] ?? $user->client->lat,
                ]);
            }
            
            return $user->load('client');
        });
    }
    
    public function deleteClient(string $userId): bool
    {
        return DB::transaction(function () use ($userId) {
            $user = User::where('id', $userId)->where('role', 'CLIENT')->firstOrFail();
            
            if ($user->client) {
                $user->client->delete();
            }
            
            return $user->delete();
        });
    }
    
    /**
     * =========================
     * INFLUENCER CRUD OPERATIONS
     * =========================
     */
    
    public function createInfluencer(array $data): User
    {
        return DB::transaction(function () use ($data) {
            $user = $this->createBaseUser($data, 'INFLUENCER');
            
            Influencer::create([
                'user_id' => $user->id,
                'referralCode' => $data['referralCode'] ?? $this->generateReferralCode(),
                'commissionRate' => $data['commissionRate'] ?? 5.0,
                'profilePicture' => $data['profilePicture'] ?? null,
                'phone' => $data['phone'] ?? null,
                'address' => $data['address'] ?? null,
                'city' => $data['city'] ?? null,
                'codePostal' => $data['codePostal'] ?? null,
                'cin' => $data['cin'] ?? null,
                'rib' => $data['rib'] ?? null,
                'd17' => $data['d17'] ?? null,
                'isActive' => $data['isActive'] ?? true,
                'slug' => $data['slug'] ?? Str::slug($user->name . '-' . Str::random(5)),
            ]);
            
            return $user->load('influencer');
        });
    }
    
    public function updateInfluencer(string $userId, array $data): User
    {
        return DB::transaction(function () use ($userId, $data) {
            $user = User::where('id', $userId)->where('role', 'INFLUENCER')->firstOrFail();
            $this->updateBaseUser($user, $data);
            
            if ($user->influencer) {
                $updateData = [];
                $fields = ['referralCode', 'commissionRate', 'profilePicture', 'phone', 
                          'address', 'city', 'codePostal', 'cin', 'rib', 'd17', 'isActive'];
                
                foreach ($fields as $field) {
                    if (isset($data[$field])) {
                        $updateData[$field] = $data[$field];
                    }
                }
                
                if (!empty($updateData)) {
                    $user->influencer->update($updateData);
                }
            }
            
            return $user->load('influencer');
        });
    }
    
    public function deleteInfluencer(string $userId): bool
    {
        return DB::transaction(function () use ($userId) {
            $user = User::where('id', $userId)->where('role', 'INFLUENCER')->firstOrFail();
            
            if ($user->influencer) {
                $user->influencer->delete();
            }
            
            return $user->delete();
        });
    }
    
    /**
     * =========================
     * STORE CRUD OPERATIONS
     * =========================
     */
    
    public function createStore(array $data): User
    {
        return DB::transaction(function () use ($data) {
            $user = $this->createBaseUser($data, 'STORE');
            
            Store::create([
                'user_id' => $user->id,
                'name_fr' => $data['name_fr'] ?? $user->name,
                'name_ar' => $data['name_ar'] ?? ($data['name_fr'] ?? $user->name),
                'name_en' => $data['name_en'] ?? ($data['name_fr'] ?? $user->name),
                'description_fr' => $data['description_fr'] ?? null,
                'description_ar' => $data['description_ar'] ?? null,
                'description_en' => $data['description_en'] ?? null,
                'storePhone' => $data['storePhone'] ?? null,
                'address' => $data['address'] ?? null,
                'responsibleCin' => $data['responsibleCin'] ?? null,
                'matriculeFiscale' => $data['matriculeFiscale'] ?? null,
                'logo' => $data['logo'] ?? null,
                'cover' => $data['cover'] ?? null,
                'rib' => $data['rib'] ?? null,
                'isActive' => $data['isActive'] ?? true,
                'slug' => $data['slug'] ?? Str::slug($user->name . '-' . Str::random(5)),
                'promo' => $data['promo'] ?? 0,
            ]);
            
            return $user->load('store');
        });
    }
    
    public function updateStore(string $userId, array $data): User
    {
        return DB::transaction(function () use ($userId, $data) {
            $user = User::where('id', $userId)->where('role', 'STORE')->firstOrFail();
            $this->updateBaseUser($user, $data);
            
            if ($user->store) {
                $updateData = [];
                $fields = ['name_fr', 'name_ar', 'name_en', 'description_fr', 'description_ar', 
                          'description_en', 'storePhone', 'address', 'responsibleCin', 
                          'matriculeFiscale', 'logo', 'cover', 'rib', 'isActive', 'promo'];
                
                foreach ($fields as $field) {
                    if (isset($data[$field])) {
                        $updateData[$field] = $data[$field];
                    }
                }
                
                if (!empty($updateData)) {
                    $user->store->update($updateData);
                }
            }
            
            return $user->load('store');
        });
    }
    
    public function deleteStore(string $userId): bool
    {
        return DB::transaction(function () use ($userId) {
            $user = User::where('id', $userId)->where('role', 'STORE')->firstOrFail();
            
            if ($user->store) {
                $user->store->delete();
            }
            
            return $user->delete();
        });
    }
    
    /**
     * =========================
     * ADMIN CRUD OPERATIONS
     * =========================
     */
    
    public function createAdmin(array $data): User
    {
        return DB::transaction(function () use ($data) {
            $user = $this->createBaseUser($data, 'ADMIN');
            
            Admin::create([
                'user_id' => $user->id,
                'platformCommissionAdmin' => $data['platformCommissionAdmin'] ?? 10.0,
                'platformCommissionShare' => $data['platformCommissionShare'] ?? 5.0,
            ]);
            
            return $user->load('admin');
        });
    }
    
    public function updateAdmin(string $userId, array $data): User
    {
        return DB::transaction(function () use ($userId, $data) {
            $user = User::where('id', $userId)->where('role', 'ADMIN')->firstOrFail();
            $this->updateBaseUser($user, $data);
            
            if ($user->admin) {
                $updateData = [];
                $fields = ['platformCommissionAdmin', 'platformCommissionShare'];
                
                foreach ($fields as $field) {
                    if (isset($data[$field])) {
                        $updateData[$field] = $data[$field];
                    }
                }
                
                if (!empty($updateData)) {
                    $user->admin->update($updateData);
                }
            }
            
            return $user->load('admin');
        });
    }
    
    public function deleteAdmin(string $userId): bool
    {
        return DB::transaction(function () use ($userId) {
            $user = User::where('id', $userId)->where('role', 'ADMIN')->firstOrFail();
            
            if ($user->admin) {
                $user->admin->delete();
            }
            
            return $user->delete();
        });
    }
    
    /**
     * =========================
     * SHIPPING COMPANY CRUD OPERATIONS
     * =========================
     */
    
    public function createShippingCompany(array $data): User
    {
        return DB::transaction(function () use ($data) {
            $user = $this->createBaseUser($data, 'SHIPPING_COMPANY');
            
            ShippingCompany::create([
                'user_id' => $user->id,
                'name' => $data['company_name'] ?? $user->name,
                'contactInfo' => $data['contactInfo'] ?? null,
                'rib' => $data['rib'] ?? null,
                'responsiblePhone' => $data['responsiblePhone'] ?? null,
                'companyPhone' => $data['companyPhone'] ?? null,
                'address' => $data['address'] ?? null,
                'cin' => $data['cin'] ?? null,
                'matriculeFiscale' => $data['matriculeFiscale'] ?? null,
            ]);
            
            return $user->load('shippingCompany');
        });
    }
    
    public function updateShippingCompany(string $userId, array $data): User
    {
        return DB::transaction(function () use ($userId, $data) {
            $user = User::where('id', $userId)->where('role', 'SHIPPING_COMPANY')->firstOrFail();
            $this->updateBaseUser($user, $data);
            
            if ($user->shippingCompany) {
                $updateData = [];
                $fields = ['name', 'contactInfo', 'rib', 'responsiblePhone', 
                          'companyPhone', 'address', 'cin', 'matriculeFiscale'];
                
                foreach ($fields as $field) {
                    if (isset($data[$field])) {
                        $updateData[$field] = $data[$field];
                    }
                }
                
                if (!empty($updateData)) {
                    $user->shippingCompany->update($updateData);
                }
            }
            
            return $user->load('shippingCompany');
        });
    }
    
    public function deleteShippingCompany(string $userId): bool
    {
        return DB::transaction(function () use ($userId) {
            $user = User::where('id', $userId)->where('role', 'SHIPPING_COMPANY')->firstOrFail();
            
            if ($user->shippingCompany) {
                $user->shippingCompany->delete();
            }
            
            return $user->delete();
        });
    }
    
    /**
     * =========================
     * SHIPPING EMPLOYEE CRUD OPERATIONS
     * =========================
     */
    
    public function createShippingEmp(array $data): User
    {
        return DB::transaction(function () use ($data) {
            $user = $this->createBaseUser($data, 'SHIPPING_EMP');
            
            ShippingEmp::create([
                'user_id' => $user->id,
                'pdp' => $data['pdp'] ?? null,
                'rib' => $data['rib'] ?? null,
                'Phone' => $data['Phone'] ?? null,
                'address' => $data['address'] ?? null,
                'cin' => $data['cin'] ?? null,
            ]);
            
            return $user->load('shippingEmp');
        });
    }
    
    public function updateShippingEmp(string $userId, array $data): User
    {
        return DB::transaction(function () use ($userId, $data) {
            $user = User::where('id', $userId)->where('role', 'SHIPPING_EMP')->firstOrFail();
            $this->updateBaseUser($user, $data);
            
            if ($user->shippingEmp) {
                $updateData = [];
                $fields = ['pdp', 'rib', 'Phone', 'address', 'cin'];
                
                foreach ($fields as $field) {
                    if (isset($data[$field])) {
                        $updateData[$field] = $data[$field];
                    }
                }
                
                if (!empty($updateData)) {
                    $user->shippingEmp->update($updateData);
                }
            }
            
            return $user->load('shippingEmp');
        });
    }
    
    public function deleteShippingEmp(string $userId): bool
    {
        return DB::transaction(function () use ($userId) {
            $user = User::where('id', $userId)->where('role', 'SHIPPING_EMP')->firstOrFail();
            
            if ($user->shippingEmp) {
                $user->shippingEmp->delete();
            }
            
            return $user->delete();
        });
    }
    
    /**
     * =========================
     * ADMIN MANAGEMENT METHODS
     * Admin can manage all user types
     * =========================
     */
    
    public function getAllUsersByRole(string $role): array
    {
        $relation = $this->getRelationName($role);
        $users = User::where('role', $role)->with($relation)->get();
        return $users->toArray();
    }
    
    private function getRelationName(string $role): string
    {
        $map = [
            'CLIENT' => 'client',
            'INFLUENCER' => 'influencer',
            'STORE' => 'store',
            'ADMIN' => 'admin',
            'SHIPPING_COMPANY' => 'shippingCompany',
            'SHIPPING_EMP' => 'shippingEmp',
        ];

        return $map[strtoupper($role)] ?? strtolower($role);
    }
    
    public function getUserById(string $userId): ?User
    {
        return User::with([
            'client', 'influencer', 'store', 'admin', 
            'shippingCompany', 'shippingEmp'
        ])->find($userId);
    }
    
    public function blockUser(string $userId, bool $blocked = true): User
    {
        $user = User::findOrFail($userId);
        $user->update(['isBlocked' => $blocked]);
        return $user;
    }
    
    public function unblockUser(string $userId): User
    {
        return $this->blockUser($userId, false);
    }
    
    public function deleteAnyUser(string $userId): bool
    {
        return DB::transaction(function () use ($userId) {
            $user = User::findOrFail($userId);
            
            // Delete role-specific data
            switch ($user->role) {
                case 'CLIENT':
                    if ($user->client) $user->client->delete();
                    break;
                case 'INFLUENCER':
                    if ($user->influencer) $user->influencer->delete();
                    break;
                case 'STORE':
                    if ($user->store) $user->store->delete();
                    break;
                case 'ADMIN':
                    if ($user->admin) $user->admin->delete();
                    break;
                case 'SHIPPING_COMPANY':
                    if ($user->shippingCompany) $user->shippingCompany->delete();
                    break;
                case 'SHIPPING_EMP':
                    if ($user->shippingEmp) $user->shippingEmp->delete();
                    break;
            }
            
            return $user->delete();
        });
    }
    
    /**
     * =========================
     * HELPER METHODS
     * =========================
     */
    
    private function createBaseUser(array $data, string $role): User
    {
        return User::create([
            'name' => $data['name'],
            'family_name' => $data['family_name'] ?? null,
            'email' => $data['email'],
            'password' => Hash::make($data['password'] ?? 'password123'),
            'role' => $role,
            'isBlocked' => $data['isBlocked'] ?? false,
        ]);
    }
    
    private function updateBaseUser(User $user, array $data): void
    {
        $updateData = [];
        
        if (isset($data['name'])) $updateData['name'] = $data['name'];
        if (isset($data['family_name'])) $updateData['family_name'] = $data['family_name'];
        if (isset($data['email'])) $updateData['email'] = $data['email'];
        if (isset($data['password'])) $updateData['password'] = Hash::make($data['password']);
        if (isset($data['isBlocked'])) $updateData['isBlocked'] = $data['isBlocked'];
        
        if (!empty($updateData)) {
            $user->update($updateData);
        }
    }
    
    private function generateReferralCode(): string
    {
        return 'REF-' . strtoupper(Str::random(8));
    }
}
