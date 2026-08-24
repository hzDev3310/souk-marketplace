<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\GrokTranslationService;
use Illuminate\Http\Request;

class TranslationController extends Controller
{
    public function autoFill(Request $request, GrokTranslationService $translationService)
    {
        $request->validate([
            'fields' => 'required|array',
        ]);

        $fields = $request->input('fields', []);
        $fields = array_filter(
            $fields,
            fn ($value, $key) => is_string($key)
                && (str_starts_with($key, 'name_') || str_starts_with($key, 'description_'))
                && is_string($value)
                && trim($value) !== '',
            ARRAY_FILTER_USE_BOTH
        );

        $filledFields = $fields;

        if (empty($filledFields)) {
            return response()->json([
                'success' => false,
                'error' => 'Add at least one name or description before using AI enhancement.'
            ], 422);
        }

        if (!$translationService->isEnabled()) {
            return response()->json(['error' => 'Translation service is not configured.'], 503);
        }

        try {
            $translatedData = $translationService->fillMissingTranslations($fields);
            return response()->json([
                'success' => true,
                'data' => $translatedData
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
