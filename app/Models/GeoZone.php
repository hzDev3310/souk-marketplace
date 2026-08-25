<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class GeoZone extends Model
{
    protected $table = 'geo_zones';
    public $timestamps = false;

    /**
     * Return a map of governorate => GeoZone instance.
     * If the table doesn't exist or an error occurs, return an empty array.
     */
    public static function zoneMap(): array
    {
        try {
            $rows = DB::table((new static)->getTable())->get();
            $map = [];
            foreach ($rows as $r) {
                $zone = new static((array) $r);
                // Expecting a `governorate` key on the row; skip if missing
                if (isset($r->governorate)) {
                    $map[$r->governorate] = $zone;
                }
            }
            return $map;
        } catch (\Throwable $e) {
            return [];
        }
    }

    public function getName(): string
    {
        return $this->name ?? ($this->label ?? '');
    }
}
