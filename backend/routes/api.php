<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProjectController;
use Illuminate\Support\Facades\Route;

Route::pattern('id', '[0-9]+');
Route::pattern('sha', '[A-Fa-f0-9]+');

Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');
Route::middleware('web')->group(function () {
    Route::get('/auth/gitlab/redirect', [AuthController::class, 'redirectAuthGitlab']);
    Route::get('/auth/gitlab/callback', [AuthController::class, 'handleGitlabCallback']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'show']);
    Route::put('/user', [AuthController::class, 'update']);
    Route::get('/projects', [ProjectController::class, 'index']);
    Route::get('/projects/{id}', [ProjectController::class, 'getProjectById']);
    Route::get('/projects/{id}/commits', [ProjectController::class, 'getCommits']);
    Route::get('/projects/{id}/merge-requests', [ProjectController::class, 'getMergeRequests']);
    Route::get('/projects/{id}/branches', [ProjectController::class, 'getBranches']);
    Route::get('/projects/{id}/members', [ProjectController::class, 'members']);
    Route::get('/projects/{id}/files', [ProjectController::class, 'getFiles']);
    Route::get('/projects/{id}/file', [ProjectController::class, 'getFileContent']);
    Route::get('/last-commits', [ProjectController::class, 'getLastCommitAllProject']);
    Route::get('/projects/{id}/commits/{sha}/diff', [ProjectController::class, 'getCommitDiff']);
    Route::get('/projects/{id}/commits/{sha}', [ProjectController::class, 'getCommit']);
});
