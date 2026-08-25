<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration {
    public function up(): void
    {
        $now = now();

        // ── Categories (parent) ──
        $parentCategories = [
            ['T-Shirts & Tops', 't-shirts-tops', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400'],
            ['Hoodies & Sweatshirts', 'hoodies-sweatshirts', 'https://images.unsplash.com/photo-1556821840-3a63f77226dd?w=400'],
            ['Jackets & Outerwear', 'jackets-outerwear', 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400'],
            ['Pants & Lounge', 'pants-lounge', 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=400'],
            ['Hats & Headwear', 'hats-headwear', 'https://images.unsplash.com/photo-1588850561407-ed78c334e67a?w=400'],
            ['Footwear & Socks', 'footwear-socks', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'],
            ['Bags & Laptop Storage', 'bags-laptop-storage', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400'],
            ['Tech Accessories & Gear', 'tech-accessories-gear', 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=400'],
        ];

        $parentIds = [];
        foreach ($parentCategories as [$name, $slug, $cover]) {
            $id = Str::uuid();
            DB::table('categories')->insert([
                'id'         => $id,
                'name_fr'    => $name,
                'name_ar'    => $name,
                'name_en'    => $name,
                'slug'       => $slug,
                'parent_id'  => null,
                'cover'      => $cover,
                'isActive'   => true,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
            $parentIds[$slug] = $id;
        }

        // ── Subcategories ──
        $subcategories = [
            't-shirts-tops' => ['Developer Graphic Tees', 'Code / Syntax Polos', 'Tech Conference Tees'],
            'hoodies-sweatshirts' => ['Zip-Up Tech Hoodies', 'Cybersecurity Pullovers', 'Terminal / ASCII Sweatshirts'],
            'jackets-outerwear' => ['Hackathon Windbreakers', 'Fleece Server Room Jackets'],
            'pants-lounge' => ['Late-Night Coding Joggers', 'Techwear Cargo Pants'],
            'hats-headwear' => ['Binary / Code Caps', 'Developer Beanies'],
            'footwear-socks' => ['Algorithmic Pattern Socks', 'Ergonomic Office Sneakers'],
            'bags-laptop-storage' => ['Anti-Theft Tech Backpacks', 'Padded Laptop Sleeves'],
            'tech-accessories-gear' => ['Developer Enamel Pins', 'Custom Keyboard Wrist Rests'],
        ];

        $subIds = [];
        foreach ($subcategories as $parentSlug => $subs) {
            foreach ($subs as $subName) {
                $id = Str::uuid();
                DB::table('categories')->insert([
                    'id'         => $id,
                    'name_fr'    => $subName,
                    'name_ar'    => $subName,
                    'name_en'    => $subName,
                    'slug'       => Str::slug($subName),
                    'parent_id'  => $parentIds[$parentSlug],
                    'isActive'   => true,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
                $subIds[$subName] = $id;
            }
        }

        // ── Store users + stores ──
        $storeData = [
            1 => [
                'name' => 'Carthage Tech Apparel', 'address' => 'Lac 2, Tunis',
                'logo' => 'https://images.unsplash.com/photo-1599305445671-ac291c95aba9?w=200',
                'cover' => 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200',
            ],
            2 => [
                'name' => 'El Ghazala Dev Wear', 'address' => 'Technopole El Ghazala, Ariana',
                'logo' => 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200',
                'cover' => 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200',
            ],
            3 => [
                'name' => 'Sousse Code Collective', 'address' => 'Centre Urbain Nord, Sousse',
                'logo' => 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=200',
                'cover' => 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1200',
            ],
            4 => [
                'name' => 'Sahara Hackers Den', 'address' => 'Avenue Habib Bourguiba, Sfax',
                'logo' => 'https://images.unsplash.com/photo-1563986768609-322da13575f2?w=200',
                'cover' => 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200',
            ],
        ];

        $storeIds = [];
        foreach ($storeData as $storeId => $data) {
            $userId = Str::uuid();
            DB::table('users')->insert([
                'id'         => $userId,
                'name'       => $data['name'],
                'family_name'=> 'Store',
                'email'      => Str::slug($data['name']) . '@souk.tn',
                'password'   => bcrypt('password'),
                'role'       => 'STORE',
                'isBlocked'  => false,
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            $realStoreId = Str::uuid();
            DB::table('stores')->insert([
                'id'          => $realStoreId,
                'user_id'     => $userId,
                'name_fr'     => $data['name'],
                'name_ar'     => $data['name'],
                'name_en'     => $data['name'],
                'address'     => $data['address'],
                'logo'        => $data['logo'] ?? null,
                'cover'       => $data['cover'] ?? null,
                'isActive'    => true,
                'slug'        => Str::slug($data['name']),
                'created_at'  => $now,
                'updated_at'  => $now,
            ]);
            $storeIds[$storeId] = $realStoreId;
        }

        // ── Products ──
        $products = [
            [
                'store_id'    => 1,
                'name'        => 'Laravel Artisan Oversized Tee',
                'category'    => 'Developer Graphic Tees',
                'price'       => 45.00,
                'description' => 'Heavyweight cotton oversized t-shirt featuring the php artisan serve print.',
                'image'       => 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600',
            ],
            [
                'store_id'    => 1,
                'name'        => 'Full-Stack Heavy Zip Hoodie',
                'category'    => 'Zip-Up Tech Hoodies',
                'price'       => 95.00,
                'description' => 'Fleece-lined hoodie built for cold server rooms and long debug sessions.',
                'image'       => 'https://images.unsplash.com/photo-1556821840-3a63f77226dd?w=600',
            ],
            [
                'store_id'    => 2,
                'name'        => 'Root Access Cyber Pullover',
                'category'    => 'Cybersecurity Pullovers',
                'price'       => 85.00,
                'description' => 'Minimalist black pullover with custom terminal font detailing.',
                'image'       => 'https://images.unsplash.com/photo-1434389677669-e08b4cda3a49?w=600',
            ],
            [
                'store_id'    => 3,
                'name'        => 'Git Commit Cargo Joggers',
                'category'    => 'Late-Night Coding Joggers',
                'price'       => 65.00,
                'description' => 'Relaxed-fit joggers with embroidered git branch diagram on the pocket.',
                'image'       => 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600',
            ],
            [
                'store_id'    => 3,
                'name'        => 'Deploy Day Dad Cap',
                'category'    => 'Binary / Code Caps',
                'price'       => 30.00,
                'description' => 'Vintage-wash cotton cap with embroidered binary "01000100 01000101 01010000 01001100 01001111 01011001".',
                'image'       => 'https://images.unsplash.com/photo-1588850561407-ed78c334e67a?w=600',
            ],
            [
                'store_id'    => 4,
                'name'        => 'Terminal ASCII Windbreaker',
                'category'    => 'Hackathon Windbreakers',
                'price'       => 110.00,
                'description' => 'Lightweight water-resistant windbreaker with full ASCII art sleeve print.',
                'image'       => 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600',
            ],
            [
                'store_id'    => 4,
                'name'        => 'Kernel Panic Beanie',
                'category'    => 'Developer Beanies',
                'price'       => 25.00,
                'description' => 'Ribbed knit beanie with "KERNEL PANIC" embroidered in monospace font.',
                'image'       => 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=600',
            ],
            [
                'store_id'    => 1,
                'name'        => 'Refactor This Enamel Pin Set',
                'category'    => 'Developer Enamel Pins',
                'price'       => 18.00,
                'description' => 'Set of 4 hard enamel pins: coffee cup, bug, rocket, and "refactor this" badge.',
                'image'       => 'https://images.unsplash.com/photo-1590874103328-eac38ef6f88a?w=600',
            ],
        ];

        foreach ($products as $p) {
            $categoryId = $subIds[$p['category']] ?? null;
            $productCategories = $categoryId ? [$categoryId] : [];
            $productId = Str::uuid();

            DB::table('products')->insert([
                'id'              => $productId,
                'store_id'        => $storeIds[$p['store_id']],
                'name_fr'         => $p['name'],
                'name_ar'         => $p['name'],
                'name_en'         => $p['name'],
                'description_fr'  => $p['description'],
                'description_ar'  => $p['description'],
                'description_en'  => $p['description'],
                'price'           => $p['price'],
                'stock'           => 50,
                'slug'            => Str::slug($p['name']),
                'promo'           => 0,
                'isActive'        => true,
                'categories'      => json_encode($productCategories),
                'created_at'      => $now,
                'updated_at'      => $now,
            ]);

            if (!empty($p['image'])) {
                DB::table('product_albums')->insert([
                    'id'         => Str::uuid(),
                    'product_id' => $productId,
                    'imageUrl'   => $p['image'],
                    'isPrimary'  => true,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        }
    }

    public function down(): void
    {
        DB::table('product_albums')->whereIn('product_id', function ($q) {
            $q->select('id')->from('products')->whereIn('slug', [
                'laravel-artisan-oversized-tee',
                'full-stack-heavy-zip-hoodie',
                'root-access-cyber-pullover',
                'git-commit-cargo-joggers',
                'deploy-day-dad-cap',
                'terminal-ascii-windbreaker',
                'kernel-panic-beanie',
                'refactor-this-enamel-pin-set',
            ]);
        })->delete();

        DB::table('products')->whereIn('slug', [
            'laravel-artisan-oversized-tee',
            'full-stack-heavy-zip-hoodie',
            'root-access-cyber-pullover',
            'git-commit-cargo-joggers',
            'deploy-day-dad-cap',
            'terminal-ascii-windbreaker',
            'kernel-panic-beanie',
            'refactor-this-enamel-pin-set',
        ])->delete();

        DB::table('stores')->whereIn('slug', [
            'carthage-tech-apparel',
            'el-ghazala-dev-wear',
            'sousse-code-collective',
            'sahara-hackers-den',
        ])->delete();

        DB::table('users')->whereIn('email', [
            'carthage-tech-apparel@souk.tn',
            'el-ghazala-dev-wear@souk.tn',
            'sousse-code-collective@souk.tn',
            'sahara-hackers-den@souk.tn',
        ])->delete();

        DB::table('categories')->whereNull('parent_id')
            ->whereIn('slug', [
                't-shirts-tops', 'hoodies-sweatshirts', 'jackets-outerwear',
                'pants-lounge', 'hats-headwear', 'footwear-socks',
                'bags-laptop-storage', 'tech-accessories-gear',
            ])->delete();
    }
};
