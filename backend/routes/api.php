<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\AuthController;

// Rota Publica
Route::post('/login', [AuthController::class, 'login']);

// Rotas Protegidas
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profiles', [ProfileController::class, 'index']);

    // Rotas de Usuários(CRUD)
    Route::apiResource('users', UserController::class);

});
