<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ResponseController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::prefix('responses')->group(function () {
        Route::controller(ResponseController::class)->group(function () {
            Route::get('/responses', 'getResponses');
            Route::post('/create', 'createResponse');
            Route::get('/response/{id}', 'getResponse');
            Route::put('/response/{id}', 'updateResponse');
            Route::delete('/response/{id}', 'deleteResponse');
        });
    });
});


Route::group([
    'middleware' => 'api',
    'prefix' => 'auth'
], function () {
    Route::post('login', [AuthController::class, 'login']);
    Route::get('logout', [AuthController::class, 'logout']);
    // Route::post('refresh', [AuthController::class, 'refresh']);
});
