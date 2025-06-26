<?php

use App\Http\Controllers\AccessTokenController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\OTPController;
use App\Http\Controllers\ResponseController;
use App\Http\Middleware\AdminMiddleware;
use App\Http\Middleware\GroupMiddleware;
use App\Http\Middleware\ManageMiddleware;
use App\Http\Middleware\SuperAdminMiddleware;
use App\Models\AccessToken;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Route::middleware('auth')->group(function () {
//     Route::get('/user', function (Request $request) {
//         return $request->user();
//     });
// });

// Sistem JWT Lama.
// Route::group([
//     'middleware' => 'api',
//     'prefix' => 'auth'
// ], function () {
//     Route::post('login', [AuthController::class, 'login']);
//     Route::get('logout', [AuthController::class, 'logout']);
//     // Route::post('refresh', [AuthController::class, 'refresh']);
// });

Route::middleware(SuperAdminMiddleware::class)->group(function () {
    Route::get('/get-otp', [OTPController::class, 'getOTP']);

    Route::prefix('/group')->group(function () {
        Route::post('/register', [GroupController::class, 'register']);
        Route::post('/set-group/{group_id}', [GroupController::class, 'fetchGroupData']);
        Route::get('/get-group/{group_id}', [GroupController::class, 'getById']);
        Route::get('/get-groups', [GroupController::class, 'getAll']);
    });

    Route::prefix('/admin')->group(function () {
        Route::post('/set-credentials', [AdminController::class, 'setCredentials']);
        Route::get('/get-detail', [AdminController::class, 'getAdminDetails']);
    });
});

Route::post('/verify-otp', [OTPController::class, 'verifyOTP']);
Route::get('/test-bearer', [AccessTokenController::class, 'testBearer']);
Route::delete('/destroy-token', [AccessTokenController::class, 'destroyToken']);
Route::get('/periodical-refresh', [AccessTokenController::class, 'refresh']);

Route::prefix('/responses')->group(function () {
    Route::get('/public-responses', [ResponseController::class, 'getResponses']);
    Route::get('/public-responses/case', [ResponseController::class, 'getByCase']);

    Route::middleware(AdminMiddleware::class)->group(function () {
        Route::post('/import', [ResponseController::class, 'importResponses']);
    });

    Route::middleware(ManageMiddleware::class)->group(function () {
        Route::controller(ResponseController::class)->group(function () {
            Route::get('/index', 'getResponses');
            Route::get('/search', 'searchResponses');
            Route::post('/create', 'createResponse');
            Route::get('/response/{id}', 'getResponse');
            // Post karena put bermasalah untuk upload file
            Route::post('/response/{id}', 'updateResponse');
            Route::delete('/response/{id}', 'deleteResponse');
            Route::delete('/response/{id}/images', 'deleteImages');
        });
    });
});

Route::prefix('/group')->group(function () {
    Route::get('/check-registered/{group_id}', [GroupController::class, 'checkIsRegistered']);
    Route::post('/check-password/check', [GroupController::class, 'checkHasPassword']);
    Route::post('/login', [GroupController::class, 'login']);
    Route::post('/login-passwordless', [GroupController::class, 'loginWithoutPassword']);
    Route::get('/broadcast/pfp-slide/{group_id}', [GroupController::class, 'shufflePfpSlideShow']);
    Route::get('/check-permissions', [AccessTokenController::class, 'getGroupPermissions']);

    Route::middleware(GroupMiddleware::class)->group(function () {
        Route::post('/broadcast/{group_id}', [GroupController::class, 'updateBroadcaster']);
        Route::delete('/broadcast/pfp-slide/{group_id}', [GroupController::class, 'clearPfpSlide']);

        Route::post('/settings/{group_id}', [GroupController::class, 'updateSettings']);
        Route::get('/{group_id}', [GroupController::class, 'getById']);

        Route::delete('/{group_id}', [GroupController::class, 'deleteRegistration']);
    });
});

Route::prefix('/admin')->group(function () {
    Route::post('/login', [AdminController::class, 'login']);
    Route::get('/broadcast/pfp-slide', [AdminController::class, 'shufflePfpSlideShow']);

    Route::middleware(AdminMiddleware::class)->group(function () {
        Route::post('/broadcast', [AdminController::class, 'updateAdminBroadcaster']);
        Route::delete('/broadcast/pfp-slide', [AdminController::class, 'clearPfpSlide']);

        Route::post('/settings', [AdminController::class, 'updateSettings']);
        Route::get('/groups', [AdminController::class, 'getGroups']);

        Route::get('/', [AdminController::class, 'getAdminDetails']);
    });
});
