<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class GrokTranslationService
{
    private function apiKey(): ?string
    {
        return env('GROQ_API_KEY') ?: setting('groq_api_key') ?: setting('grok_api_key') ?: config('services.groq.api_key');
    }

    private function baseUrl(): string
    {
        return env('GROQ_BASE_URL') ?: setting('groq_base_url') ?: setting('grok_base_url') ?: config('services.groq.base_url', 'https://api.groq.com/openai/v1/chat/completions');
    }

    private function model(): string
    {
        $candidate = env('GROQ_MODEL') ?: setting('groq_model') ?: setting('grok_model') ?: config('services.groq.model', 'openai/gpt-oss-20b');

        $deprecatedModels = [
            'llama-3.1-8b-instant',
            'llama-3.3-70b-versatile',
            'llama-3.1-70b-versatile',
            'gemma2-9b-it',
            'mixtral-8x7b-32768',
        ];

        return in_array($candidate, $deprecatedModels, true) ? 'openai/gpt-oss-20b' : $candidate;
    }

    private function visionModel(): string
    {
        $candidate = env('GROQ_VISION_MODEL') ?: setting('groq_vision_model') ?: setting('grok_vision_model') ?: config('services.groq.vision_model', 'openai/gpt-oss-20b');

        return in_array($candidate, ['llama-3.1-8b-instant', 'llama-3.3-70b-versatile', 'llama-3.1-70b-versatile', 'gemma2-9b-it', 'mixtral-8x7b-32768'], true)
            ? 'openai/gpt-oss-20b'
            : $candidate;
    }

    public function isEnabled(): bool
    {
        return filled($this->apiKey());
    }

    public function fillMissingTranslations(array $data): array
    {
        if (!$this->isEnabled()) {
            throw new RuntimeException('Grok API key is not configured.');
        }

        $filtered = [];
        foreach ($data as $key => $value) {
            if ((str_starts_with($key, 'name_') || str_starts_with($key, 'description_')) && is_string($value)) {
                $filtered[$key] = $value;
            }
        }

        if (empty($filtered)) {
            return [];
        }

        $baseUrl = rtrim($this->baseUrl(), '/');
        $model = $this->model();

        $prompt = "You are a professional translator and copywriter. I will provide you with a JSON object containing store or product names and descriptions in one or more languages (English, French, or Arabic).

Your task:
1. Correct any spelling or grammar issues in the provided text to make it professional.
2. For every field group (name or description), you MUST provide versions in ALL three languages: English (_en), French (_fr), and Arabic (_ar).
3. If you receive 'name_en', you must return 'name_en', 'name_fr', and 'name_ar'. Same for 'description'.
4. Maintain a professional, natural, and marketing-friendly tone for an e-commerce platform.
5. Ensure the Arabic translation is natural and culturally appropriate.

Return ONLY a valid JSON object containing all these keys. No markdown, no explanations.

Input JSON:
" . json_encode($filtered, JSON_UNESCAPED_UNICODE);

        try {
            $response = Http::timeout(45)
                ->withToken($this->apiKey())
                ->post($baseUrl, [
                    'model' => $model,
                    'messages' => [
                        [
                            'role' => 'user',
                            'content' => $prompt,
                        ],
                    ],
                    'temperature' => 0.1,
                    'response_format' => [
                        'type' => 'json_object',
                    ],
                ])
                ->throw()
                ->json();

            $responseText = $response['choices'][0]['message']['content'] ?? '';

            // Clean up potential markdown formatting if the model ignored the prompt instruction
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
                $cleanTranslated = [];
                // Initialize all expected keys to ensure they exist, even if empty
                $expectedKeys = ['name_en', 'name_fr', 'name_ar', 'description_en', 'description_fr', 'description_ar'];
                foreach ($expectedKeys as $key) {
                    $cleanTranslated[$key] = '';
                }

                foreach ($translatedData as $key => $value) {
                    $fieldKey = (string) $key;

                    if (str_ends_with($fieldKey, '_es')) {
                        $fieldKey = preg_replace('/_es$/', '_ar', $fieldKey);
                    }

                    if ((str_starts_with($fieldKey, 'name_') || str_starts_with($fieldKey, 'description_'))
                        && preg_match('/^(name|description)_(en|fr|ar)$/', $fieldKey)
                        && is_string($value)
                    ) {
                        $cleanTranslated[$fieldKey] = $value;
                    }
                }

                return $cleanTranslated;
            }

            Log::error('Grok translation returned invalid JSON', ['response' => $responseText]);
            return $filtered;
        } catch (\Exception $e) {
            Log::error('Grok translation failed', ['error' => $e->getMessage()]);
            throw new RuntimeException('Failed to auto-translate: ' . $e->getMessage());
        }
    }

    public function reformatDescription(string $description, array $images): string
    {
        if (!$this->isEnabled()) {
            throw new RuntimeException('Grok API key is not configured.');
        }

        if (empty($images)) {
            throw new RuntimeException('At least one product image is required.');
        }

        $baseUrl = rtrim($this->baseUrl(), '/');
        $model = $this->visionModel();

        $systemPrompt = 'You are a professional copywriter for an e-commerce marketplace. Your task is to correct grammar and spelling errors, reformulate, and improve the given product description based on the product images provided. Make the description compelling, accurate, and well-structured. Return ONLY the corrected and reformulated description text in the same language as the input, without any additional commentary or formatting.';

        $content = [
            [
                'type' => 'text',
                'text' => "Product description to correct and reformulate:\n\n{$description}",
            ],
        ];

        foreach ($images as $imageData) {
            $content[] = [
                'type' => 'image_url',
                'image_url' => [
                    'url' => "data:image/jpeg;base64,{$imageData}",
                ],
            ];
        }

        try {
            $response = Http::timeout(60)
                ->withToken($this->apiKey())
                ->post($baseUrl, [
                    'model' => $model,
                    'messages' => [
                        [
                            'role' => 'system',
                            'content' => $systemPrompt,
                        ],
                        [
                            'role' => 'user',
                            'content' => $content,
                        ],
                    ],
                    'temperature' => 0.2,
                    'max_tokens' => 1024,
                ])
                ->throw()
                ->json();

            $responseText = $response['choices'][0]['message']['content'] ?? '';

            return trim($responseText);
        } catch (\Exception $e) {
            Log::error('Grok description reformat failed', ['error' => $e->getMessage()]);
            throw new RuntimeException('Failed to reformat description: ' . $e->getMessage());
        }
    }
}
