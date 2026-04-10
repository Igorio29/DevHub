<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);
Route::get('/auth/gitlab/redirect', [AuthController::class, 'redirectAuthGitlab']);
Route::get('/auth/gitlab/callback', [AuthController::class, 'handleGitlabCallback']);