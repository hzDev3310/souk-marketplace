<?php

namespace App\Http\Controllers\Api\Store;

use App\Http\Controllers\Concerns\HandlesFileUploads;
use App\Http\Controllers\Controller;
use App\Models\Store;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class StoreProfileController extends Controller
{
    use HandlesFileUploads;
    /**
     * Get the current authenticated store's profile
     */
    public function profile(Request $request)
    {
        $store = $request->user()->store;

        if (!$store) {
            return response()->json([
                'success' => true,
                'data' => null,
                'message' => 'No store profile created yet.'
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => $store
        ]);
    }

    /**
     * Update the store profile
     */
    public function updateProfile(Request $request)
    {
        $store = $request->user()->store;

        if (!$store) {
            $store = new Store();
            $store->user_id = $request->user()->id;
            $store->isActive = false;
            $store->promo = 0;
            $store->slug = Str::slug(($request->name_en ?: $request->name_fr ?: $request->name_ar ?: $request->user()->name) . '-' . Str::random(6));
        }

        // Validate input
        $validator = Validator::make($request->all(), [
            'name_fr' => 'nullable|string|max:255',
            'name_ar' => 'nullable|string|max:255',
            'name_en' => 'nullable|string|max:255',
            'description_fr' => 'nullable|string',
            'description_ar' => 'nullable|string',
            'description_en' => 'nullable|string',
            'storePhone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'responsibleCin' => 'nullable|string|max:50',
            'rib' => 'nullable|string|max:100',
            'promo' => 'nullable|numeric|min:0|max:100',
            'logo' => 'nullable|file|max:4096',
            'cover' => 'nullable|file|max:4096',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->except(['logo', 'cover']);

        // Handle logo upload
        if ($request->hasFile('logo')) {
            // Delete old logo if exists
            if ($store->logo && Storage::exists('public/' . $store->logo)) {
                Storage::delete('public/' . $store->logo);
            }
            try {
                $logoPath = $this->storeUploadedFile($request->file('logo'), 'store_logos', 'store', $store->name_en ?? $store->name_fr ?? $store->name_ar ?? 'store');
                $data['logo'] = $logoPath;
            } catch (\Throwable $e) {
                return $this->fileUploadErrorResponse();
            }
        }

        // Handle cover upload
        if ($request->hasFile('cover')) {
            // Delete old cover if exists
            if ($store->cover && Storage::exists('public/' . $store->cover)) {
                Storage::delete('public/' . $store->cover);
            }
            try {
                $coverPath = $this->storeUploadedFile($request->file('cover'), 'store_covers', 'store', $store->name_en ?? $store->name_fr ?? $store->name_ar ?? 'store');
                $data['cover'] = $coverPath;
            } catch (\Throwable $e) {
                return $this->fileUploadErrorResponse();
            }
        }

        // Update or create store
        $store->fill($data);
        $store->save();

        return response()->json([
            'success' => true,
            'message' => 'Store profile updated successfully',
            'data' => $store->fresh()
        ]);
    }
}
