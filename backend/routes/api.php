<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;

// Cria automaticamente as rotas: GET, POST, PUT, DELETE para /users
Route::apiResource('users', UserController::class);
