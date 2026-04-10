<?php

namespace App\Models;

use Laravel\Sanctum\HasApiTokens; // 👈 IMPORTANTE
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable; // 👈 AQUI TAMBÉM

    protected $fillable = [
        'name',
        'email',
        'password',
        'gitlab_id',
        'avatar',
    ];
}