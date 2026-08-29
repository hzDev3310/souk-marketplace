<?php

namespace App\Http\Controllers\Shared;

use App\Http\Controllers\Concerns\HandlesFileUploads;
use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductAlbum;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    use HandlesFileUploads;

    protected function getBaseQuery(Request $request)
    {
        $user = $request->user();
        if ($user->role === 'ADMIN') {
            return Product::query()
                ->with(['store', 'albums', 'categoryLinks'])
                ->withCount(['orderItems as orders_count']);
        }

        $store = $user->store;
        if (!$store) {
            throw new \Illuminate\Http\Exceptions\HttpResponseException(
                response()->json(['message' => 'No store associated with this account'], 404)
            );
        }

        return Product::where('store_id', $store->id)
            ->with('albums')
            ->withCount(['orderItems as orders_count']);
    }

    public function index(Request $request)
    {
        $products = $this->getBaseQuery($request)->latest()->get();
        return response()->json($products);
    }

    public function show(Request $request, Product $product)
    {
        $user = $request->user();
        if ($user->role !== 'ADMIN' && $product->store_id !== optional($user->store)->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        return response()->json($product->load(['store', 'albums'])->loadCount(['orderItems as orders_count']));
    }

    public function store(Request $request)
    {
        $user = $request->user();
        $isStore = $user->role === 'STORE';
        $store = $isStore ? $user->store : null;

        if ($isStore && !$store) {
            return response()->json(['message' => 'No store associated with this account'], 404);
        }

        $rules = [
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
        ];

        if (!$isStore) {
            $rules['store_id'] = 'required|exists:stores,id';
        }

        $validated = $request->validate($rules);
        $storeId = $isStore ? $store->id : $validated['store_id'];

        $slug = Str::slug($validated['name_en'] ?? $validated['name_fr'] ?? 'product') . '-' . uniqid();

        $product = Product::create([
            'store_id' => $storeId,
            'name_fr' => $validated['name_fr'],
            'name_ar' => $validated['name_ar'],
            'name_en' => $validated['name_en'],
            'description_fr' => $validated['description_fr'] ?? null,
            'description_ar' => $validated['description_ar'] ?? null,
            'description_en' => $validated['description_en'] ?? null,
            'price' => $validated['price'],
            'stock' => $validated['stock'],
            'promo' => $validated['promo'] ?? 0,
            'slug' => $slug,
            'categories' => json_decode($validated['categories'] ?? '[]', true),
        ]);

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $this->storeUploadedFile($image, 'product_images', 'product', $product->name_en ?? 'product');
                ProductAlbum::create(['product_id' => $product->id, 'file' => $path]);
            }
        }

        return response()->json($product->load(['store', 'albums'])->loadCount(['orderItems as orders_count']), 201);
    }

    public function update(Request $request, Product $product)
    {
        $user = $request->user();
        if ($user->role !== 'ADMIN' && $product->store_id !== optional($user->store)->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'store_id' => 'sometimes|exists:stores,id',
            'name_fr' => 'sometimes|required|string|max:255',
            'name_ar' => 'sometimes|required|string|max:255',
            'name_en' => 'sometimes|required|string|max:255',
            'description_fr' => 'sometimes|nullable|string',
            'description_ar' => 'sometimes|nullable|string',
            'description_en' => 'sometimes|nullable|string',
            'price' => 'sometimes|required|numeric|min:0',
            'stock' => 'sometimes|required|integer|min:0',
            'promo' => 'nullable|numeric|min:0|max:100',
            'categories' => 'nullable|json',
            'images' => 'nullable|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'keep_images' => 'nullable|json',
        ]);

        $data = collect($validated)->except(['images', 'keep_images'])->all();
        if ($user->role !== 'ADMIN') {
            unset($data['store_id']);
        }

        if (array_key_exists('categories', $data)) {
            $data['categories'] = json_decode($data['categories'] ?? '[]', true);
        }

        if (($data['name_en'] ?? $product->name_en) !== $product->name_en || ($data['name_fr'] ?? $product->name_fr) !== $product->name_fr) {
            $data['slug'] = Str::slug($data['name_en'] ?? $data['name_fr'] ?? $product->name_en) . '-' . uniqid();
        }

        $product->update($data);

        if ($request->has('keep_images')) {
            $keepImages = json_decode($request->input('keep_images', '[]'), true) ?: [];
            foreach ($product->albums as $album) {
                if (!in_array($album->id, $keepImages)) {
                    Storage::disk('public')->delete($album->file);
                    $album->delete();
                }
            }
        }

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $this->storeUploadedFile($image, 'product_images', 'product', $product->name_en ?? 'product');
                ProductAlbum::create(['product_id' => $product->id, 'file' => $path]);
            }
        }

        return response()->json($product->fresh()->load(['store', 'albums'])->loadCount(['orderItems as orders_count']));
    }

    public function toggleActive(Request $request, Product $product)
    {
        $user = $request->user();
        if ($user->role !== 'ADMIN' && $product->store_id !== optional($user->store)->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $product->update(['isActive' => !$product->isActive]);

        return response()->json($product->fresh()->load(['store', 'albums'])->loadCount(['orderItems as orders_count']));
    }

    public function destroy(Request $request, Product $product)
    {
        $user = $request->user();
        if ($user->role !== 'ADMIN' && $product->store_id !== optional($user->store)->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $ordersCount = $product->orderItems()->count();
        if ($ordersCount > 0) {
            return response()->json([
                'message' => 'This product cannot be deleted because it is included in existing orders.',
                'orders_count' => $ordersCount,
            ], 422);
        }

        foreach ($product->albums as $album) {
            Storage::disk('public')->delete($album->file);
            $album->delete();
        }
        $product->delete();
        return response()->noContent();
    }
}
