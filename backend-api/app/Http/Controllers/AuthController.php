<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = [
            'email' => $request->email,
            'password' => $request->password
        ];

        $login = Auth::attempt($credentials);
        if ($login) {
            return $this->respondWithToken($login);
        }
        return response()->json([
            "success" => false,
            "msg" => "Failed to login",
            "status" => 401,
        ]);
    }

    public function register(Request $request)
    {
        $data = $request->all();
        $validator = Validator::make($data, [
            'name' => 'required',
            'email' => 'required|unique:users',
            'password' => 'required',
        ]);
        if ($validator->failed()) {
            return response()->json([
                "success" => false,
                "msg" => "Register failed",
                "error" => $validator->errors(),
                "status" => 400,
            ]);
        }
        $valid_data = [
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
        ];
        User::register($valid_data);
        return response()->json([
            "success" => true,
            "msg" => "Register successful",
            "status" => 200,
        ]);
    }

    public function logout()
    {
        Auth::logout();

        return response()->json([
            "success" => true,
            "status" => 200,
            "msg" => 'Successfully logged out'
        ]);
    }

    public function refresh()
    {
        return $this->respondWithToken(Auth::refresh());
    }

    protected function respondWithToken($token)
    {
        return response()->json([
            "success" => true,
            "msg" => "Login successful",
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => Auth::factory()->getTTL() * 60,
            "status" => 200,
        ]);
    }
}
