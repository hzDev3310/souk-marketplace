<?php

use Illuminate\Support\Facades\Cache;

if (!function_exists('setting')) {
    function setting($key, $default = null)
    {
        return Cache::rememberForever("setting.{$key}", function () use ($key, $default) {
            if (class_exists(\App\Models\Setting::class)) {
                $setting = \App\Models\Setting::where('key', $key)->first();
                return $setting ? $setting->value : $default;
            }

            // Fallback: return a small set of safe defaults or the provided default
            $staticDefaults = [
                'website_name' => 'Souk AI',
            ];

            return $staticDefaults[$key] ?? $default;
        });
    }
}

if (!function_exists('settings_group')) {
    function settings_group($group, $defaults = [])
    {
        return Cache::rememberForever("settings.group.{$group}", function () use ($group, $defaults) {
            if (class_exists(\App\Models\Setting::class)) {
                $settings = \App\Models\Setting::where('group', $group)->get();
                $result = $defaults;
                foreach ($settings as $setting) {
                    $result[$setting->key] = $setting->value;
                }
                return $result;
            }

            // If model doesn't exist, return provided defaults
            return $defaults;
        });
    }
}
