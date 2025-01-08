<?php

namespace App\Http\Controllers;

use App\Models\AccessToken;
use App\Models\AccessTokenAdmin;
use App\Models\AccessTokenGroup;
use App\Models\Admin;
use App\Models\AdminBroadcaster;
use App\Models\AdminSetting;
use App\Models\Group;
use DateTime;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminController extends Controller
{
    public function setCredentials(Request $request)
    {
        $credentials = [
            "email" => $request->email,
            "password" => bcrypt($request->password),
        ];

        if (!$credentials) {
            return response()->json([
                "success" => false,
                "msg" => "One or more column of credentials is empty.",
                "status" => 400,
            ], 400);
        }

        $admin_id = Str::random(16);
        $admin_broadcaster_id = Str::random(16);
        $admin_settings_id = Str::random(16);

        $admin_data = [
            'id' => $admin_id,
            'admin_user_id' => $request->userId,
            'group_list' => $request->groupList,
            'login_email' => $credentials["email"],
            'login_password' => $credentials["password"]
        ];

        $admin_broadcaster_data = [
            'id' => $admin_broadcaster_id,
            'admin_id' => $admin_id,
            'pfpslide_enabled' => false,
        ];

        $admin_settings_data = [
            'id' => $admin_settings_id,
            'admin_id' => $admin_id,
            'bot_delay_enabled' => false,
        ];

        Admin::query()->delete();
        AdminBroadcaster::query()->delete();
        AdminSetting::query()->delete();
        AccessTokenAdmin::query()->delete();

        Admin::create($admin_data);
        AdminBroadcaster::create($admin_broadcaster_data);
        AdminSetting::create($admin_settings_data);

        $callback_data = [
            "admin_id" => $admin_id,
            "admin_broadcaster_id" => $admin_broadcaster_id,
            "admin_settings_id" => $admin_settings_id,
        ];

        return response()->json([
            "success" => true,
            "msg" => "Data created " . $admin_id,
            "callback" => $callback_data,
            "status" => 200,
        ], 200);
    }

    public function updateAdminBroadcaster(Request $request)
    {

        $admin = Admin::first();

        $broadcaster = AdminBroadcaster::where("admin_id", $admin->id)->first();
        if (!$broadcaster) {
            $broadcaster_id = Str::random(16);
            $broadcaster_data = [
                'id' => $broadcaster_id,
                'admin_id' => $admin->id,
                'pfpslide_enabled' => false,
            ];
            AdminBroadcaster::create($broadcaster_data);
            return response()->json([
                "success" => false,
                "msg" => "Unknown error, broadcast data not found. Recreating broadcast data, please try again",
                "status" => 400
            ], 400);
        }

        $broadcaster_data = [
            'pfpslide_enabled' => $request->pfpslideEnabled,
            'pfpslide_interval' => $request->pfpSlideInterval,
        ];

        $broadcaster->update($broadcaster_data);
        if ($request->hasFile("pfpSlide")) {
            if ($broadcaster->pfpslide) {
                AdminBroadcaster::deleteById($broadcaster->id);
            }

            AdminBroadcaster::uploadImage($request->file("pfpSlide"), $broadcaster->id);
        }

        return response()->json([
            "success" => true,
            "msg" => "Data updated " . $admin->id,
            "status" => 200,
        ], 200);
    }

    public function updateSettings(Request $request)
    {
        $admin = Admin::first();

        $admin_setting = AdminSetting::where("admin_id", $admin->id)->first();
        if (!$admin_setting) {
            $admin_setting_id = Str::random(16);
            $admin_setting_data = [
                'id' => $admin_setting_id,
                'admin_id' => $admin->id,
                'lock_mention_everyone' => false,
                'schedule_piket' => false,
            ];
            AdminSetting::create($admin_setting_data);
            return response()->json([
                "success" => false,
                "msg" => "Unknown error, setting data not found. Recreating setting data, please try again",
                "status" => 500
            ], 500);
        }

        $admin_setting_data = [
            'bot_delay_enabled' => $request->botDelayEnabled,
            'bot_delay' => $request->botDelay,
        ];

        $admin_setting->update($admin_setting_data);

        return response()->json([
            "success" => true,
            "msg" => "Data updated " . $admin->id,
            "status" => 200,
        ], 200);
    }

    public function clearPfpSlide()
    {
        $admin = Admin::first();

        $broadcaster = AdminBroadcaster::where("admin_id", $admin->id)->first();

        if ($broadcaster->pfpslide) {
            AdminBroadcaster::deleteById($broadcaster->id);
        }

        return response()->json([
            "success" => true,
            "msg" => "Data cleared " . $admin->id,
            "status" => 200,
        ], 200);
    }

    public function getGroups()
    {
        $groups = Group::all();

        return response()->json([
            "success" => true,
            "msg" => "Data retrieved",
            "groups" => $groups,
            "status" => 200,
        ], 200);
    }

    public function shufflePfpSlideShow()
    {
        $admin = AdminBroadcaster::first();

        $pfpSlides = json_decode($admin->pfpslide, true);

        shuffle($pfpSlides);

        return response()->json([
            "success" => true,
            "msg" => "Image received",
            "status" => 200,
            "image" => isset($pfpSlides[0]) ? "/storage/" . $pfpSlides[0] : null
        ], 200);
    }

    public function login(Request $request)
    {
        if (!$request->email || !$request->password) {
            return response()->json([
                "success" => false,
                "msg" => "Admin password or email is empty.",
                "status" => 401,
            ], 401);
        }

        $credentials = [
            "email" => $request->email,
            "password" => $request->password
        ];

        $admin = Admin::where("login_email", $credentials["email"])->first();

        if ($admin && Hash::check($credentials['password'], $admin->login_password)) {
            $bearer = $request->bearerToken();
            $user_token = AccessToken::where("access_token", $bearer)->first();
            $access_token_admin_id = Str::random(16);

            if (!$user_token) {
                $access_token_id = Str::random(16);
                $access_token = Str::random(128);
                $expire_date = (new DateTime())->modify('+2 hours')->format('Y-m-d H:i:s');

                AccessToken::create([
                    'id' => $access_token_id,
                    'access_token' => $access_token,
                    'expire_date' => $expire_date,
                ]);

                AccessTokenAdmin::create([
                    'id' => $access_token_admin_id,
                    'access_token_id' => $access_token_id,
                ]);

                return response()->json([
                    "success" => true,
                    "msg" => "Access token created",
                    "access_token" => $access_token,
                    "status" => 200,
                ], 200);
            }

            $old_admin_admin_token = AccessTokenAdmin::where("access_token_id", $user_token->id);
            if ($old_admin_admin_token) {
                $old_admin_admin_token->delete();
            }

            AccessTokenAdmin::create([
                'id' => $access_token_admin_id,
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
            "msg" => "Invalid group id or password.",
            "status" => 401,
        ], 401);
    }

    public function getAdminDetails()
    {
        $group = Admin::with(['adminBroadcaster', 'adminSettings'])->first();
        if ($group) {
            return response()->json([
                "success" => true,
                "msg" => "Admin retrieved",
                "group" => $group,
                "status" => 200
            ], 200);
        }

        return response()->json([
            "success" => false,
            "msg" => "Admin not found",
            "status" => 404
        ], 404);
    }
}
