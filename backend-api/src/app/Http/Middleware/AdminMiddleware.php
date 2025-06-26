<?php

namespace App\Http\Middleware;

use App\Models\AccessToken;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $bearer = $request->bearerToken();
        if (!$bearer) {
            return response()->json([
                "success" => false,
                "msg" => "Bearer is empty",
                "status" => 401,
            ], 401);
        }

        $access_token = AccessToken::with(['adminAcToken'])->where("access_token", $bearer)->first();

        if (!$access_token) {
            return response()->json([
                "success" => false,
                "msg" => "Access Token is invalid or expired",
                "status" => 401,
            ], 401);
        }

        $date_is_valid = $access_token->tokenDateValid($bearer);
        if (!$date_is_valid) {
            return response()->json([
                "success" => false,
                "msg" => "Access Token is invalid or expired",
                "status" => 401,
            ], 401);
        }

        $admin_ac_token = $access_token->adminAcToken;

        if ($admin_ac_token) {
            return $next($request);
        }

        return response()->json([
            "success" => false,
            "msg" => "You do not have permissions to access this page.",
            "status" => 403,
        ], 403);
    }
}
