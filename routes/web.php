<?php

use App\Http\Controllers\TranslationsController;
use App\Http\Controllers\PublicController;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Session;

Route::get('/translations/{locale}', [TranslationsController::class, 'index']);

Route::get('/lang/{locale}', function ($locale) {
    if (in_array($locale, ['en', 'fr', 'ar'])) {
        Session::put('locale', $locale);
        App::setLocale($locale);
    }
    return redirect()->back();
})->name('lang.switch');

Route::middleware(['web'])->group(function () {
    // Public Pages (SEO Optimized)
    Route::get('/', [PublicController::class, 'index'])->name('home');
    Route::get('/p/{slug}', [PublicController::class, 'product'])->name('public.product');
    Route::get('/store/{slug}', [PublicController::class, 'store'])->name('public.store');
    Route::get('/c/{slug}', [PublicController::class, 'category'])->name('public.category');
    Route::get('/search', [PublicController::class, 'search'])->name('public.search');
    
    // New navigation pages
    Route::get('/products', [PublicController::class, 'allProducts'])->name('public.all-products');
    Route::get('/categories', [PublicController::class, 'allCategories'])->name('public.all-categories');
    Route::get('/stores', [PublicController::class, 'allStores'])->name('public.all-stores');
    Route::get('/about', [PublicController::class, 'about'])->name('public.about');
    Route::get('/terms', [PublicController::class, 'terms'])->name('public.terms');
    Route::get('/contact', [PublicController::class, 'contact'])->name('public.contact');

    // Cart & Favorites
    Route::get('/cart', [PublicController::class, 'cart'])->name('public.cart');
    Route::post('/cart/add', [PublicController::class, 'addToCart'])->name('public.cart.add');
    Route::post('/cart/remove', [PublicController::class, 'removeFromCart'])->name('public.cart.remove');
    Route::post('/cart/update', [PublicController::class, 'updateCart'])->name('public.cart.update');

    Route::get('/favorites', [PublicController::class, 'favorites'])->name('public.favorites');
    Route::post('/favorites/toggle', [PublicController::class, 'toggleFavorite'])->name('public.favorites.toggle');

    Route::get('/checkout', [PublicController::class, 'checkout'])->name('public.checkout');
    Route::post('/checkout', [PublicController::class, 'processCheckout'])->name('public.checkout.process');

    Route::middleware('auth')->group(function() {
        Route::get('/profile', [PublicController::class, 'profile'])->name('public.profile');
        Route::post('/profile', [PublicController::class, 'updateProfile'])->name('public.profile.update');
        Route::get('/orders', [PublicController::class, 'orders'])->name('public.orders');
    });

    // Auth Pages (Public Storefront)
    Route::get('/login', [PublicController::class, 'showLogin'])->name('login');
    Route::post('/login', [PublicController::class, 'login'])->name('public.login.submit');
    Route::get('/register', [PublicController::class, 'showRegister'])->name('register');
    Route::post('/register', [PublicController::class, 'register'])->name('public.register.submit');
    Route::post('/logout', [PublicController::class, 'logout'])->name('logout');
});

// SPA Dashboard (React) — catch-all, React handles auth client-side via /api/* routes
Route::get('/dashboard/{any?}', function () {
    return view('welcome');
})->where('any', '.*')->name('dashboard');
