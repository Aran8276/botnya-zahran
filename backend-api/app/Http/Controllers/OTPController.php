<?php

namespace App\Http\Controllers;

use App\Models\AccessToken;
use App\Models\AccessTokenManage;
use App\Models\Otp;
use Carbon\Carbon;
use DateTime;
use Illuminate\Support\Str;
use Illuminate\Http\Request;

class OTPController extends Controller
{
    public function getOTP()
    {
        $id = Str::random(16);
        $otp = mt_rand(100000, 999999);
        $expire_date = (new DateTime())->modify('+15 minutes')->format('Y-m-d H:i:s');

        Otp::create([
            'id' => $id,
            'otp_code' => $otp,
            'expire_date' => $expire_date
        ]);

        return response()->json([
            "success" => true,
            "msg" => "OTP created",
            "otp" => $otp,
            "status" => 200,
        ]);
    }

    public function verifyOTP(Request $request)
    {
        $otp_request = $request->otp;
        if (!$otp_request) {
            return response()->json([
                "success" => false,
                "msg" => "OTP is empty",
                "status" => 400,
            ], 400);
        }

        $db_otp = Otp::where("otp_code", $otp_request)->first();
        if (!$db_otp) {
            return response()->json([
                "success" => false,
                "msg" => "OTP salah atau kedaluwarsa.",
                "status" => 400,
            ], 400);
        }

        $parsed_date = Carbon::parse($db_otp->expire_date);
        $current_date = Carbon::now();

        if ($current_date->greaterThan($parsed_date)) {
            $db_otp->delete();
            return response()->json([
                "success" => false,
                "msg" => "OTP salah atau kedaluwarsa.",
                "status" => 401,
            ], 401);
        }

        if ($db_otp) {
            $bearer = $request->bearerToken();
            $user_token = AccessToken::where("access_token", $bearer)->first();
            $access_token_manage_id = Str::random(16);

            if (!$user_token) {
                $access_token_id = Str::random(16);
                $access_token = Str::random(128);
                $expire_date = (new DateTime())->modify('+2 hours')->format('Y-m-d H:i:s');

                AccessToken::create([
                    'id' => $access_token_id,
                    'access_token' => $access_token,
                    'expire_date' => $expire_date,
                ]);

                AccessTokenManage::create([
                    'id' => $access_token_manage_id,
                    'access_token_id' => $access_token_id
                ]);

                $db_otp->delete();

                return response()->json([
                    "success" => true,
                    "msg" => "OTP verified",
                    "access_token" => $access_token,
                    "status" => 200,
                ], 200);
            }

            $old_manage_access_token = AccessTokenManage::where("access_token_id", $user_token->id);
            if ($old_manage_access_token) {
                $old_manage_access_token->delete();
            }

            AccessTokenManage::create([
                'id' => $access_token_manage_id,
                'access_token_id' => $user_token->id,
            ]);

            return response()->json([
                "success" => true,
                "msg" => "Access token permissions updated",
                "status" => 200,
            ], 200);
        }

        return response()->json([
            "success" => false,
            "msg" => "Something went wrong!",
            "status" => 500,
        ], 500);
    }
}
