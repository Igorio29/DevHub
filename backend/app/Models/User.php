<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'avatar',
        'custom_name',
        'custom_avatar',
        'gitlab_token',
        'gitlab_id',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'gitlab_token',
    ];

    public function commitComments(): HasMany
    {
        return $this->hasMany(CommitComment::class);
    }
}
