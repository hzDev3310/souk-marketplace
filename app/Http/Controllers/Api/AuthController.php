<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Client;
use App\Models\Influencer;
use App\Models\Store;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    /**
     * Register a new user
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'family_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', Password::defaults()],
            'role' => ['required', Rule::in(['CLIENT', 'INFLUENCER', 'STORE'])],
            // Client fields
            'address' => ['required_if:role,CLIENT', 'nullable', 'string'],
            'city' => ['required_if:role,CLIENT', 'nullable', 'string'],
            'code_postal' => ['required_if:role,CLIENT', 'nullable', 'string'],
            // Influencer fields
            'referral_code' => ['required_if:role,INFLUENCER', 'nullable', 'string', 'unique:influencers,referralCode'],
            'phone' => ['required_if:role,INFLUENCER', 'nullable', 'string'],
            'cin' => ['required_if:role,INFLUENCER', 'nullable', 'string'],
        ]);

        // Create user
        $user = User::create([
            'id' => (string) Str::uuid(),
            'name' => $validated['name'],
            'family_name' => $validated['family_name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'isBlocked' => false,
        ]);

        // Create role-specific profile
        switch ($validated['role']) {
            case 'CLIENT':
                Client::create([
                    'id' => (string) Str::uuid(),
                    'user_id' => $user->id,
                    'address' => $validated['address'] ?? null,
                    'city' => $validated['city'] ?? null,
                    'codePostal' => $validated['code_postal'] ?? null,
                ]);
                break;

            case 'INFLUENCER':
                Influencer::create([
                    'id' => (string) Str::uuid(),
                    'user_id' => $user->id,
                    'referralCode' => $validated['referral_code'] ?? Str::random(8),
                    'commissionRate' => 5.0,
                    'phone' => $validated['phone'] ?? null,
                    'cin' => $validated['cin'] ?? null,
                    'isActive' => false, // Requires admin approval
                    'slug' => Str::slug($validated['name'] . '-' . Str::random(4)),
                ]);
                break;

            case 'STORE':
                // The store profile is completed later by the boutique after signup.
                break;
        }

        // Create token
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'user' => $user->load(strtolower($user->role)),
            'token' => $token,
            'message' => 'User registered successfully',
        ], 201);
    }

    /**
     * Login user (cookie-based)
     */
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'message' => 'Invalid credentials',
            ], 401);
        }

        // Only admin, store, and influencer can log in via the dashboard
        if (in_array(strtoupper($user->role), ['CLIENT'])) {
            return response()->json([
                'message' => 'Client accounts must log in via the storefront.',
            ], 403);
        }

        if ($user->isBlocked) {
            return response()->json([
                'message' => 'Account is blocked. Please contact support.',
            ], 403);
        }

        // Check role-specific activation
        if (in_array($user->role, ['INFLUENCER', 'STORE'])) {
            $profile = $user->{strtolower($user->role)};
            if ($profile && !$profile->isActive) {
                return response()->json([
                    'message' => 'Account pending admin approval.',
                    'user' => $user->load(strtolower($user->role)),
                    'pending_approval' => true,
                ], 403);
            }
        }

        // Cookie-based login using the dedicated dashboard (`react_app`) guard so the
        // public storefront session and the dashboard session never collide.
        Auth::guard('react_app')->login($user);
        $request->session()->regenerate();

        return response()->json([
            'user' => $user->load(strtolower($user->role)),
            'message' => 'Login successful',
        ]);
    }

    /**
     * Logout user (cookie-based)
     */
    public function logout(Request $request)
    {
        Auth::guard('react_app')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }

    /**
     * Get current user
     */
    public function me(Request $request)
    {
        $user = $request->user()->load(strtolower($request->user()->role));
        return response()->json($user);
    }

    /**
     * Update the authenticated user's profile details.
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'family_name' => ['nullable', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
        ]);

        $user->fill([
            'name' => $validated['name'],
            'family_name' => $validated['family_name'] ?? $user->family_name,
            'email' => $validated['email'],
        ]);

        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'user' => $user->fresh()->load(strtolower($user->role)),
        ]);
    }

    /**
     * Check auth status
     */
    public function check(Request $request)
    {
        $auth = Auth::guard('react_app');
        if ($auth->check()) {
            $user = $auth->user();
            $role = strtolower($user->role);
            
            // Handle relationship name mapping
            $relationMap = [
                'shipping_company' => 'shippingCompany',
                'shipping_emp' => 'shippingEmp',
            ];
            
            $relation = $relationMap[$role] ?? $role;
            
            try {
                $user->load($relation);
            } catch (\Exception $e) {
                // Ignore if relation doesn't exist
            }

            return response()->json([
                'authenticated' => true,
                'user' => $user,
            ]);
        }

        return response()->json([
            'authenticated' => false,
        ], 401);
    }
}
