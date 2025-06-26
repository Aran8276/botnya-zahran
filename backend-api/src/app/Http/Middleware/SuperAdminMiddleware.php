<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SuperAdminMiddleware
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

        $superadmin_bearer = env("SUPERADMIN_BEARER_TOKEN");
        if ($bearer == $superadmin_bearer) {
            return $next($request);
        }

        // Lebih prefer 401 Unauthorized seperti token salah dibandingkan 403 forbidden.
        // Karena kalau 403, artinya hacker paham bahwa route nya benar, tinggal cara dobrak nya gmn.
        // Utk belajar, gpp pakai ini saja.
        return response()->json([
            "success" => false,
            "msg" => "You do not have permissions to access this page.",
            "status" => 403,
        ], 403);
    }
}
