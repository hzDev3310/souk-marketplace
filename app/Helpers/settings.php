<?php

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

if (!function_exists('setting')) {
    function setting($key, $default = null)
    {
        return Cache::rememberForever("setting.{$key}", function () use ($key, $default) {
            $row = DB::table('settings')->where('key', $key)->value('value');
            return $row ?? $default;
        });
    }
}

if (!function_exists('settings_group')) {
    function settings_group($group, $defaults = [])
    {
        return Cache::rememberForever("settings.group.{$group}", function () use ($group, $defaults) {
            $rows = DB::table('settings')->where('group', $group)->pluck('value', 'key')->toArray();
            return array_merge($defaults, $rows);
        });
    }
}
