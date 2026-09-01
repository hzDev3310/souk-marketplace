<?php

namespace Tests\Feature;

use App\Mail\GuestAccountCreated;
use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Tests\TestCase;

class GuestCheckoutSendsWelcomeEmailTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_checkout_creates_account_and_sends_temporary_password_email(): void
    {
        Mail::fake();

        $store = Store::create([
            'user_id' => User::factory()->create()->id,
            'name_en' => 'Demo Store',
            'slug' => 'demo-store',
            'isActive' => true,
        ]);

        $product = Product::create([
            'store_id' => $store->id,
            'name_en' => 'Test Product',
            'slug' => 'test-product',
            'price' => 100,
            'stock' => 10,
            'promo' => 0,
            'categories' => [],
            'isActive' => true,
        ]);

        $response = $this->withSession(['cart' => [$product->id => ['quantity' => 1]]])
            ->post('/checkout', [
                'first_name' => 'Guest',
                'last_name' => 'User',
                'email' => 'guest@example.com',
                'address' => '12 Main Street',
                'city' => 'Tunis',
                'postal_code' => '1000',
                'lat' => 36.8,
                'lon' => 10.18,
            ]);

        $response->assertOk();
        $this->assertDatabaseHas('users', ['email' => 'guest@example.com', 'role' => 'CLIENT']);
        $this->assertNotNull(session('guest_temp_password'));

        Mail::assertSent(GuestAccountCreated::class, function (GuestAccountCreated $mail) {
            return $mail->hasTo('guest@example.com')
                && $mail->user->email === 'guest@example.com'
                && Str::length($mail->password) === 8;
        });
    }
}
