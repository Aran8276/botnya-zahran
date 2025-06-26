<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        "success" => true,
        "msg" => "API is well and online.",
        "status" => 200,
    ], 200);
    // return view('welcome');
});
