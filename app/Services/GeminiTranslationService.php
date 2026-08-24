<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class GeminiTranslationService
{
    private function apiKey(): ?string
    {
        return setting('gemini_api_key') ?: config('services.gemini.api_key');
    }

    private function baseUrl(): string
    {
        return setting('gemini_base_url') ?: config('services.gemini.base_url', 'https://generativelanguage.googleapis.com/v1beta');
    }

    private function model(): string
    {
        // For text generation, flash is fast and cheap.
        return 'models/gemini-1.5-flash';
    }

    public function isEnabled(): bool
    {
        return filled($this->apiKey());
    }

    /**
     * Takes an associative array of fields and their values (some empty) 
     * and uses Gemini to fill in the missing translations.
     */
    public function fillMissingTranslations(array $data): array
    {
        if (!$this->isEnabled()) {
            throw new RuntimeException('Gemini API key is not configured.');
        }

        $baseUrl = rtrim($this->baseUrl(), '/');
        $model = $this->model();

        $prompt = "You are a professional translator and copywriter. Detect which fields are already filled and which are empty. If a text is already provided in one language, rewrite and translate it into the missing language fields while keeping the same meaning, natural tone, and marketing quality. If only one language is present, generate natural text for the other languages. Preserve the exact JSON keys from the input. Return ONLY valid JSON, no markdown, no explanations.\n\nInput JSON:\n" . json_encode($data, JSON_UNESCAPED_UNICODE);

        try {
            $response = Http::timeout(45)
                ->withQueryParameters([
                    'key' => $this->apiKey(),
                ])
                ->post("{$baseUrl}/{$model}:generateContent", [
                    'contents' => [
                        [
                            'parts' => [
                                ['text' => $prompt]
                            ]
                        ]
                    ],
                    'generationConfig' => [
                        'temperature' => 0.1,
                        'responseMimeType' => 'application/json',
                    ]
                ])
                ->throw()
                ->json();

            $responseText = $response['candidates'][0]['content']['parts'][0]['text'] ?? '';
            
            // Clean up potential markdown formatting if Gemini ignored the prompt instruction
            $responseText = trim($responseText);
            if (str_starts_with($responseText, '```json')) {
                $responseText = substr($responseText, 7);
            }
            if (str_starts_with($responseText, '```')) {
                $responseText = substr($responseText, 3);
            }
            if (str_ends_with($responseText, '```')) {
                $responseText = substr($responseText, 0, -3);
            }
            
            $translatedData = json_decode(trim($responseText), true);

            if (json_last_error() === JSON_ERROR_NONE && is_array($translatedData)) {
                return array_merge($data, $translatedData); // Ensure original keys remain
            }

            Log::error('Gemini translation returned invalid JSON', ['response' => $responseText]);
            return $data; // Return original if parsing fails
        } catch (\Exception $e) {
            Log::error('Gemini translation failed', ['error' => $e->getMessage()]);
            throw new RuntimeException('Failed to auto-translate: ' . $e->getMessage());
        }
    }
}
