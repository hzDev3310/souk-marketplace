<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable {
    use HasUuids, HasApiTokens;

    protected $fillable = ['name', 'family_name', 'email', 'password', 'role', 'isBlocked'];
    protected $hidden = ['password'];
    protected $casts = ['isBlocked' => 'boolean'];

    public function client() { return $this->hasOne(Client::class); }
    public function store() { return $this->hasOne(Store::class); }
    public function admin() { return $this->hasOne(Admin::class); }
    public function logs() { return $this->hasMany(Log::class); }
    public function comments() { return $this->hasMany(Comment::class); }
    public function ratings() { return $this->hasMany(Rating::class); }
}