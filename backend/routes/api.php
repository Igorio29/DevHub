<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProjectController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);
Route::get('/auth/gitlab/redirect', [AuthController::class, 'redirectAuthGitlab']);
Route::get('/auth/gitlab/callback', [AuthController::class, 'handleGitlabCallback']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'show']);
    Route::put('/user', [AuthController::class, 'update']);
    Route::get('/projects', [ProjectController::class, 'index']);
    Route::get('/projects/{id}/commits', [ProjectController::class, 'getCommits']);
    Route::get('/projects/{id}/merge-requests', [ProjectController::class, 'getMergeRequests']);
    Route::get('/projects/{id}/branches', [ProjectController::class, 'getBranches']);
});
