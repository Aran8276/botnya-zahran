<?php

namespace App\Http\Controllers;

use App\Models\AccessToken;
use App\Models\AccessTokenAdmin;
use App\Models\AccessTokenGroup;
use App\Models\AccessTokenManage;
use App\Models\Group;
use App\Models\Otp;
use Carbon\Carbon;
use Illuminate\Http\Request;

class AccessTokenController extends Controller
{
    public function testBearer(Request $request)
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

            return response()->json([
                "success" => true,
                "msg" => "SUPER ADMIN ENABLED",
                "status" => 200,
            ], 200);
        }

        $db_token = AccessToken::with(['adminAcToken', 'groupAcToken', 'manageAcToken'])
            ->where("access_token", $bearer)
            ->first();

        if ($db_token) {
            $expire_date = $db_token->expire_date;
            $parsed_date = Carbon::parse($expire_date);
            $current_date = Carbon::now();
            if ($current_date->greaterThan($parsed_date)) {
                $db_token->delete();
                return response()->json([
                    "success" => false,
                    "msg" => "Access Token is invalid or expired",
                    "status" => 401,
                ], 401);
            }

            return response()->json([
                "success" => true,
                "msg" => "Access Token is valid",
                "access_permissions" => $db_token,
                "status" => 200,
            ], 200);

            return $db_token;
        }


        return response()->json([
            "success" => false,
            "msg" => "Access Token is invalid or expired",
            "status" => 401,
        ], 401);
    }

    // used for log out
    public function destroyToken(Request $request)
    {
        $bearer = $request->bearerToken();
        if (!$bearer) {
            return response()->json([
                "success" => false,
                "msg" => "Bearer is empty",
                "status" => 400,
            ], 400);
        }

        $db_token = AccessToken::where("access_token", $bearer)->first();
        if ($db_token) {
            $db_token->delete();
        }

        return response()->json([
            "success" => true,
            "msg" => "Access token successfully destroyed",
            "status" => 200,
        ], 200);
    }

    // used to delete access tokens that are expired
    public function refresh()
    {
        $tokens = AccessToken::all();
        $otps = Otp::all();

        foreach ($tokens as $datas) {
            $expire_date = $datas->expire_date;
            $parsed_date = Carbon::parse($expire_date);
            $current_date = Carbon::now();
            if ($current_date->greaterThan($parsed_date)) {
                $datas->delete();
            }
        }

        foreach ($otps as $datas) {
            $expire_date = $datas->expire_date;
            $parsed_date = Carbon::parse($expire_date);
            $current_date = Carbon::now();
            if ($current_date->greaterThan($parsed_date)) {
                $datas->delete();
            }
        }

        return response()->json([
            "success" => true,
            "msg" => "Success",
            "status" => 200,
        ], 200);
    }

    public function getGroupPermissions(Request $request)
    {
        $bearer = $request->bearerToken();
        if (!$bearer) {
            return response()->json([
                "success" => false,
                "msg" => "Bearer is empty",
                "status" => 400,
            ], 400);
        }

        $db_token = AccessToken::with(["groupAcToken"])->where("access_token", $bearer)->first();
        if (!$db_token) {
            return response()->json([
                "success" => false,
                "msg" => "Bearer is invalid",
                "status" => 401,
            ], 401);
        }

        if (!$db_token->groupAcToken) {
            return response()->json([
                "success" => false,
                "msg" => "Forbidden",
                "status" => 403,
            ], 401);
        }

        $authorized_group_id = Group::find($db_token->groupAcToken->group_id);
        return response()->json([
            "success" => true,
            "msg" => "ID Retrieved",
            "groupid" => $authorized_group_id->group_user_id,
            "status" => 200,
        ], 200);
    }
}
