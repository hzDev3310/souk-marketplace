<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Admin;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            SettingSeeder::class,
        ]);

        $adminUser = User::create([
            'name' => 'Admin',
            'family_name' => 'Admin',
            'email' => 'admin@souk.tn',
            'password' => Hash::make('password'),
            'role' => 'ADMIN',
            'email_verified_at' => now(),
        ]);

        Admin::create([
            'user_id' => $adminUser->id,
            'platformCommissionAdmin' => 10,
            'platformCommissionShare' => 5,
        ]);
    }
}
