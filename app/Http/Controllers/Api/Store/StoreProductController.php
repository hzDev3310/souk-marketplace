<?php

namespace App\Http\Controllers\Api\Store;

use App\Http\Controllers\Concerns\HandlesFileUploads;
use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductAlbum;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class StoreProductController extends Controller
{
    use HandlesFileUploads;
    /**
     * Get all products for the authenticated store
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

        $products = Product::where('store_id', $store->id)
            ->with('albums')
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $products
        ]);
    }

    /**
     * Create a new product for the store
     */
    public function store(Request $request)
    {
        $store = $request->user()->store;

        if (!$store) {
            return response()->json([
                'success' => false,
                'message' => 'No store associated with this account'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name_fr' => 'required|string|max:255',
            'name_ar' => 'required|string|max:255',
            'name_en' => 'required|string|max:255',
            'description_fr' => 'nullable|string',
            'description_ar' => 'nullable|string',
            'description_en' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'promo' => 'nullable|numeric|min:0|max:100',
            'categories' => 'nullable|json',
            'images' => 'nullable|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $slug = Str::slug($request->name_en ?? $request->name_fr ?? 'product') . '-' . uniqid();

        $product = Product::create([
            'store_id' => $store->id,
            'name_fr' => $request->name_fr,
            'name_ar' => $request->name_ar,
            'name_en' => $request->name_en,
            'description_fr' => $request->description_fr,
            'description_ar' => $request->description_ar,
            'description_en' => $request->description_en,
            'price' => $request->price,
            'stock' => $request->stock,
            'promo' => $request->promo ?? 0,
            'slug' => $slug,
            'categories' => $request->categories ? json_decode($request->categories, true) : [],
        ]);

        // Handle image uploads
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                try {
                    $path = $this->storeUploadedFile($image, 'product_images', 'product', $product->name_en ?? $product->name_fr ?? 'product');
                } catch (\Throwable $e) {
                    return $this->fileUploadErrorResponse();
                }

                ProductAlbum::create([
                    'product_id' => $product->id,
                    'file' => $path
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Product created successfully',
            'data' => $product->load('albums')
        ], 201);
    }

    /**
     * Get a specific product
     */
    public function show(Request $request, Product $product)
    {
        $store = $request->user()->store;

        if (!$store || $product->store_id !== $store->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $product->load('albums')
        ]);
    }

    /**
     * Update a product
     */
    public function update(Request $request, Product $product)
    {
        $store = $request->user()->store;

        if (!$store || $product->store_id !== $store->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name_fr' => 'required|string|max:255',
            'name_ar' => 'required|string|max:255',
            'name_en' => 'required|string|max:255',
            'description_fr' => 'nullable|string',
            'description_ar' => 'nullable|string',
            'description_en' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'promo' => 'nullable|numeric|min:0|max:100',
            'categories' => 'nullable|json',
            'images' => 'nullable|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'keep_images' => 'nullable|json',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->except(['images', 'store_id']);
        $data['store_id'] = $store->id;

        if (($data['name_en'] ?? null) || ($data['name_fr'] ?? null)) {
            $data['slug'] = Str::slug($data['name_en'] ?? $data['name_fr'] ?? $product->name_en ?? $product->name_fr) . '-' . uniqid();
        }

        $product->update($data);

        // Delete albums not in keep_images
        $keepImages = json_decode($request->input('keep_images', '[]'), true);
        foreach ($product->albums as $album) {
            if (!in_array($album->id, $keepImages)) {
                Storage::disk('public')->delete($album->file);
                $album->delete();
            }
        }

        // Handle new image uploads
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                try {
                    $path = $this->storeUploadedFile($image, 'product_images', 'product', $product->name_en ?? $product->name_fr ?? 'product');
                } catch (\Throwable $e) {
                    return $this->fileUploadErrorResponse();
                }

                ProductAlbum::create([
                    'product_id' => $product->id,
                    'file' => $path
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Product updated successfully',
            'data' => $product->fresh()->load('albums')
        ]);
    }

    /**
     * Delete a product
     */
    public function destroy(Request $request, Product $product)
    {
        $store = $request->user()->store;

        if (!$store || $product->store_id !== $store->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        // Delete associated images
        foreach ($product->albums as $album) {
            if (Storage::exists('public/' . $album->file)) {
                Storage::delete('public/' . $album->file);
            }
            $album->delete();
        }

        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Product deleted successfully'
        ]);
    }
}
