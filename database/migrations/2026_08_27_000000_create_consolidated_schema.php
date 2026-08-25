<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // 1. Core Authentication & Session
        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('family_name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->enum('role', ['CLIENT', 'INFLUENCER', 'STORE', 'ADMIN', 'SHIPPING_COMPANY', 'SHIPPING_EMP']);
            $table->boolean('isBlocked')->default(false);
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignUuid('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });

        Schema::create('dashboard_sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignUuid('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });

        Schema::create('personal_access_tokens', function (Blueprint $table) {
            $table->id();
            $table->uuidMorphs('tokenable');
            $table->string('name');
            $table->string('token', 64)->unique();
            $table->text('abilities')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });

        // 2. Settings & System
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('type')->default('text');
            $table->string('group')->default('general');
            $table->timestamps();
        });

        Schema::create('cache', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->mediumText('value');
            $table->integer('expiration')->index();
        });

        Schema::create('cache_locks', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->string('owner');
            $table->integer('expiration')->index();
        });

        Schema::create('jobs', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('queue')->index();
            $table->longText('payload');
            $table->unsignedTinyInteger('attempts');
            $table->unsignedInteger('reserved_at')->nullable();
            $table->unsignedInteger('available_at');
            $table->unsignedInteger('created_at');
        });

        // 3. Profiles
        Schema::create('clients', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->string('address')->nullable();
            $table->string('city')->nullable();
            $table->string('codePostal')->nullable();
            $table->float('lon')->nullable();
            $table->string('lat')->nullable();
            $table->timestamps();
        });

        Schema::create('stores', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->string('name_fr');
            $table->string('name_ar');
            $table->string('name_en');
            $table->text('description_fr')->nullable();
            $table->text('description_ar')->nullable();
            $table->text('description_en')->nullable();
            $table->string('storePhone')->nullable();
            $table->string('address')->nullable();
            $table->string('responsibleCin')->nullable();
            $table->string('matriculeFiscale')->nullable();
            $table->string('logo')->nullable();
            $table->string('cover')->nullable();
            $table->string('rib')->nullable();
            $table->boolean('isActive')->default(true);
            $table->json('categories')->nullable();
            $table->decimal('promo', 5, 2)->default(0);
            $table->string('slug')->unique();
            $table->timestamps();
        });

        Schema::create('admins', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->float('platformCommissionAdmin')->default(10);
            $table->float('platformCommissionShare')->default(5);
            $table->timestamps();
        });

        // 4. Catalog
        Schema::create('categories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('parent_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->string('name_fr');
            $table->string('name_ar');
            $table->string('name_en');
            $table->string('slug')->unique();
            $table->string('icon')->nullable();
            $table->string('cover')->nullable();
            $table->boolean('isActive')->default(true);
            $table->timestamps();
        });

        Schema::create('products', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('store_id')->constrained('stores')->cascadeOnDelete();
            $table->string('name_fr');
            $table->string('name_ar');
            $table->string('name_en');
            $table->text('description_fr')->nullable();
            $table->text('description_ar')->nullable();
            $table->text('description_en')->nullable();
            $table->decimal('price', 10, 2);
            $table->integer('stock')->default(0);
            $table->string('slug')->unique();
            $table->decimal('promo', 5, 2)->default(0);
            $table->boolean('isActive')->default(true);
            $table->json('categories')->nullable();
            $table->timestamps();
        });

        Schema::create('category_product', function (Blueprint $table) {
            $table->foreignUuid('category_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('product_id')->constrained()->cascadeOnDelete();
            $table->primary(['category_id', 'product_id']);
        });

        Schema::create('product_albums', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('product_id')->constrained('products')->cascadeOnDelete();
            $table->string('imageUrl');
            $table->boolean('isPrimary')->default(false);
            $table->timestamps();
        });

        Schema::create('product_search_embeddings', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('product_id')->unique()->constrained('products')->cascadeOnDelete();
            $table->string('content_hash', 64);
            $table->string('model');
            $table->unsignedInteger('dimensions')->nullable();
            $table->longText('embedding');
            $table->timestamps();
        });

        // 5. Orders & Finances
        Schema::create('orders', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('order_number')->unique()->nullable()->index();
            $table->foreignUuid('client_id')->constrained('clients');
            $table->string('status')->default('PENDING');
            $table->decimal('totalAmount', 10, 2);
            $table->timestamps();
        });

        Schema::create('order_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('order_id')->constrained('orders')->cascadeOnDelete();
            $table->foreignUuid('product_id')->constrained('products');
            $table->integer('quantity');
            $table->decimal('price', 10, 2);
            $table->decimal('commission', 10, 2)->default(0);
            $table->string('status')->default('PENDING');
            $table->timestamps();
        });

        Schema::create('factures', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('order_id')->constrained('orders')->cascadeOnDelete();
            $table->string('factureNumber')->unique();
            $table->enum('type', ['STORE', 'ADMIN']);
            $table->decimal('amount', 10, 2);
            $table->enum('status', ['UNPAID', 'PENDING', 'PAID'])->default('UNPAID');
            $table->timestamps();
        });

        // 6. CMS & Support
        Schema::create('pages', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('title_en')->nullable();
            $table->string('title_fr')->nullable();
            $table->string('title_ar')->nullable();
            $table->string('subtitle_en')->nullable();
            $table->string('subtitle_fr')->nullable();
            $table->string('subtitle_ar')->nullable();
            $table->text('content_en')->nullable();
            $table->text('content_fr')->nullable();
            $table->text('content_ar')->nullable();
            $table->timestamps();
        });

        Schema::create('contact_settings', function (Blueprint $table) {
            $table->id();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('address_en')->nullable();
            $table->string('address_fr')->nullable();
            $table->string('address_ar')->nullable();
            $table->text('map_embed_url')->nullable();
            $table->timestamps();
        });

        Schema::create('page_images', function (Blueprint $table) {
            $table->id();
            $table->string('imageable_type');
            $table->unsignedBigInteger('imageable_id');
            $table->string('image_path');
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            $table->index(['imageable_type', 'imageable_id']);
        });

        Schema::create('logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->enum('userRole', ['CLIENT', 'INFLUENCER', 'STORE', 'ADMIN', 'SHIPPING_COMPANY', 'SHIPPING_EMP']);
            $table->string('title');
            $table->text('description')->nullable();
            $table->boolean('status')->default(true);
            $table->timestamps();
        });

        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->enum('targetType', ['CLIENT', 'INFLUENCER', 'STORE', 'SHIPPING_COMPANY', 'SHIPPING_EMP', 'USER']);
            $table->uuid('targetId');
            $table->string('title');
            $table->text('message');
            $table->boolean('isSeen')->default(false);
            $table->timestamps();
        });

        Schema::create('reports', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('reporterId');
            $table->uuid('reportedTargetId');
            $table->enum('reportedTargetRole', ['CLIENT', 'INFLUENCER', 'STORE', 'ADMIN', 'SHIPPING_COMPANY', 'SHIPPING_EMP']);
            $table->text('description');
            $table->string('status')->default('PENDING');
            $table->timestamps();
        });

        Schema::create('block_lists', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('reporterId');
            $table->uuid('reportedTargetId');
            $table->enum('reportedTargetRole', ['CLIENT', 'INFLUENCER', 'STORE', 'ADMIN', 'SHIPPING_COMPANY', 'SHIPPING_EMP']);
            $table->timestamps();
        });

        Schema::create('comments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->enum('targetRole', ['CLIENT', 'INFLUENCER', 'STORE', 'ADMIN', 'SHIPPING_COMPANY', 'SHIPPING_EMP', 'PRODUCT']);
            $table->uuid('targetId');
            $table->text('content');
            $table->timestamps();
        });

        Schema::create('ratings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->enum('targetRole', ['CLIENT', 'INFLUENCER', 'STORE', 'ADMIN', 'SHIPPING_COMPANY', 'SHIPPING_EMP', 'PRODUCT']);
            $table->uuid('targetId');
            $table->tinyInteger('rating');
            $table->timestamps();
        });


    }

    public function down(): void
    {
        Schema::dropIfExists('ratings');
        Schema::dropIfExists('comments');
        Schema::dropIfExists('block_lists');
        Schema::dropIfExists('reports');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('logs');
        Schema::dropIfExists('factures');
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('product_search_embeddings');
        Schema::dropIfExists('product_albums');
        Schema::dropIfExists('category_product');
        Schema::dropIfExists('products');
        Schema::dropIfExists('categories');
        Schema::dropIfExists('shipping_emps');
        Schema::dropIfExists('shipping_companies');
        Schema::dropIfExists('admins');
        Schema::dropIfExists('stores');
        Schema::dropIfExists('influencers');
        Schema::dropIfExists('clients');
        Schema::dropIfExists('page_images');
        Schema::dropIfExists('contact_settings');
        Schema::dropIfExists('pages');
        Schema::dropIfExists('settings');
        Schema::dropIfExists('personal_access_tokens');
        Schema::dropIfExists('dashboard_sessions');
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('users');
        Schema::dropIfExists('jobs');
        Schema::dropIfExists('cache_locks');
        Schema::dropIfExists('cache');
    }
};
