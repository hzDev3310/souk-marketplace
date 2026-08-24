<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TranslationAutofillTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_accepts_valid_name_and_description_fields_for_translation(): void
    {
        $user = User::factory()->create([
            'name' => 'Hamza',
            'email' => 'hamza@example.com',
            'role' => 'store',
        ]);

        $this->app->instance(\App\Services\GrokTranslationService::class, new class
        {
            public function isEnabled(): bool
            {
                return true;
            }

            public function fillMissingTranslations(array $data): array
            {
                return [
                    'name_en' => $data['name_en'],
                    'name_fr' => 'magasin hamza',
                    'description_en' => $data['description_en'],
                    'description_fr' => 'magasin de vêtements et mode',
                ];
            }
        });

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/translate/autofill', [
            'fields' => [
                'name_en' => 'hamza store',
                'description_en' => 'store of clothing and fashing',
            ],
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name_fr', 'magasin hamza')
            ->assertJsonPath('data.description_fr', 'magasin de vêtements et mode');
    }
}
