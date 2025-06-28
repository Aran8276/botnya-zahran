<?php

namespace App\Http\Controllers;

use App\Models\AccessToken;
use App\Models\AccessTokenGroup;
use App\Models\Broadcaster;
use App\Models\Group;
use App\Models\GroupSetting;
use DateTime;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Hash;

class GroupController extends Controller
{
    public function register(Request $request)
    {
        $group_id = Str::random(16);
        $group_settings_id = Str::random(16);
        $broadcaster_id = Str::random(16);
        $group_data = [
            'id' => $group_id,
            'group_user_id' => $request->groupUserId,
            'group_name' => $request->groupName,
            'has_password' => $request->hasPassword,
            'password' => $request->hasPassword ? bcrypt($request->password) : null,
            'group_pfp' => $request->groupPfp,
            'participants' => $request->participants,
        ];

        $is_recreation = false;
        $old_group_data = Group::where("group_user_id", $request->groupUserId);

        $group_settings_data = [
            'id' => $group_settings_id,
            'group_id' => $group_id,
            'lock_mention_everyone' => false,
            'schedule_piket' => false,
        ];

        $broadcaster_data = [
            'id' => $broadcaster_id,
            'group_id' => $group_id,
            'motd_enabled' => false,
            'pfpslide_enabled' => false,
        ];

        if ($old_group_data) {
            $old_group_data->delete();
            $is_recreation = true;
        }

        Group::create($group_data);
        GroupSetting::create($group_settings_data);
        Broadcaster::create($broadcaster_data);

        $callback_data = [
            "group_id" => $group_id,
            "group_settings_id" => $group_settings_id,
            "broadcaster_id" => $broadcaster_id,
        ];

        if ($is_recreation) {
            return response()->json([
                "success" => true,
                "msg" => "Data recreated " . $group_id,
                "callback" => $callback_data,
                "status" => 200,
            ], 200);
        }

        return response()->json([
            "success" => true,
            "msg" => "Data created " . $group_id,
            "callback" => $callback_data,
            "status" => 200,
        ], 200);
    }

    public function checkHasPassword(Request $request)
    {
        $group_id = $request->groupUserId;
        if (!$group_id) {
            return response()->json([
                "success" => false,
                "msg" => "Group id is empty",
                "status" => 400,
            ], 400);
        }
        $group = Group::where("group_user_id", $group_id)->first();
        if ($group) {
            if ($group->has_password) {
                return response()->json([
                    "success" => true,
                    "msg" => "Data retrieved",
                    "value" => true,
                    "status" => 200,
                ]);
            }

            return response()->json([
                "success" => true,
                "msg" => "Data retrieved",
                "value" => false,
                "status" => 200,
            ]);
        }


        return response()->json([
            "success" => true,
            "msg" => "Data retrieved",
            "value" => false,
            "status" => 200,
        ], 200);
    }

    public function login(Request $request)
    {
        if (!$request->groupUserId || !$request->password) {
            return response()->json([
                "success" => false,
                "msg" => "Group id or password is empty.",
                "status" => 401,
            ], 401);
        }

        $credentials = [
            "group_user_id" => $request->groupUserId,
            "password" => $request->password
        ];

        $group = Group::where("group_user_id", $credentials['group_user_id'])->first();

        if ($group && Hash::check($credentials['password'], $group->password)) {
            $bearer = $request->bearerToken();
            $user_token = AccessToken::where("access_token", $bearer)->first();
            $access_token_group_id = Str::random(16);

            if (!$user_token) {
                $access_token_id = Str::random(16);
                $access_token = Str::random(128);
                $expire_date = (new DateTime())->modify('+2 hours')->format('Y-m-d H:i:s');

                AccessToken::create([
                    'id' => $access_token_id,
                    'access_token' => $access_token,
                    'expire_date' => $expire_date,
                ]);

                AccessTokenGroup::create([
                    'id' => $access_token_group_id,
                    'access_token_id' => $access_token_id,
                    'group_id' => $group->id,
                ]);

                return response()->json([
                    "success" => true,
                    "msg" => "Access token created",
                    "access_token" => $access_token,
                    "status" => 200,
                ], 200);
            }

            $old_group_access_token = AccessTokenGroup::where("access_token_id", $user_token->id);
            if ($old_group_access_token) {
                $old_group_access_token->delete();
            }

            AccessTokenGroup::create([
                'id' => $access_token_group_id,
                'access_token_id' => $user_token->id,
                'group_id' => $group->id,
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

    public function getAll()
    {
        $groups = Group::with(['broadcaster', 'groupSettings'])->get();

        return response()->json([
            "success" => true,
            "msg" => "Data retrieved.",
            "groups" => $groups,
            "status" => 200,
        ], 200);
    }

    public function loginWithoutPassword(Request $request)
    {
        if (!$request->groupUserId) {
            return response()->json([
                "success" => false,
                "msg" => "Group id is empty.",
                "status" => 401,
            ], 401);
        }

        $credentials = [
            "group_user_id" => $request->groupUserId,
        ];

        $group = Group::where("group_user_id", $credentials['group_user_id'])->first();

        if (!$group) {
            return response()->json([
                "success" => false,
                "msg" => "Group not found.",
                "status" => 404,
            ], 404);
        }

        if ($group->has_password) {
            return response()->json([
                "success" => false,
                "msg" => "Invalid group id or password.",
                "status" => 401,
            ], 401);
        }

        if ($group) {
            $bearer = $request->bearerToken();
            $user_token = AccessToken::where("access_token", $bearer)->first();
            $access_token_group_id = Str::random(16);

            if (!$user_token) {
                $access_token_id = Str::random(16);
                $access_token = Str::random(128);
                $expire_date = (new DateTime())->modify('+2 hours')->format('Y-m-d H:i:s');

                AccessToken::create([
                    'id' => $access_token_id,
                    'access_token' => $access_token,
                    'expire_date' => $expire_date,
                ]);

                AccessTokenGroup::create([
                    'id' => $access_token_group_id,
                    'access_token_id' => $access_token_id,
                    'group_id' => $group->id,
                ]);

                return response()->json([
                    "success" => true,
                    "msg" => "Access token created",
                    "access_token" => $access_token,
                    "status" => 200,
                ], 200);
            }

            $old_group_access_token = AccessTokenGroup::where("access_token_id", $user_token->id);
            if ($old_group_access_token) {
                $old_group_access_token->delete();
            }

            AccessTokenGroup::create([
                'id' => $access_token_group_id,
                'access_token_id' => $user_token->id,
                'group_id' => $group->id,
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

    public function updateBroadcaster($group_id, Request $request)
    {
        if (!$group_id) {
            return response()->json([
                "success" => false,
                "msg" => "Group id is empty",
                "status" => 400
            ], 400);
        }

        $group = Group::where("group_user_id", $group_id)->first();

        $broadcaster = Broadcaster::where("group_id", $group->id)->first();
        if (!$broadcaster) {
            $broadcaster_id = Str::random(16);
            $broadcaster_data = [
                'id' => $broadcaster_id,
                'group_id' => $group_id,
                'motd_enabled' => false,
                'pfpslide_enabled' => false,
            ];
            Broadcaster::create($broadcaster_data);
            return response()->json([
                "success" => false,
                "msg" => "Unknown error, broadcast data not found. Recreating broadcast data, please try again",
                "status" => 400
            ], 400);
        }

        $broadcaster_data = [
            'motd_enabled' => $request->motdEnabled,
            'motd' => $request->motd,
            'motd_time' => $request->motdTime,
            'pfpslide_enabled' => $request->pfpslideEnabled,
            'pfp_slide_interval' => $request->pfpSlideInterval,
        ];

        $broadcaster->update($broadcaster_data);
        if ($request->hasFile("pfpSlide")) {
            if ($broadcaster->pfp_slide) {
                Broadcaster::deleteById($broadcaster->id);
            }
            Broadcaster::uploadImage($request->file("pfpSlide"), $broadcaster->id);
        }

        return response()->json([
            "success" => true,
            "msg" => "Data updated " . $group_id,
            "status" => 200,
        ], 200);
    }

    public function updateSettings($group_id, Request $request)
    {
        if (!$group_id) {
            return response()->json([
                "success" => false,
                "msg" => "Group id is empty",
                "status" => 400
            ], 400);
        }

        $group = Group::where("group_user_id", $group_id)->first();

        $group_setting = GroupSetting::where("group_id", $group->id)->first();
        if (!$group_setting) {
            $group_setting_id = Str::random(16);
            $group_setting_data = [
                'id' => $group_setting_id,
                'group_id' => $group_id,
                'lock_mention_everyone' => false,
                'schedule_piket' => false,
            ];
            GroupSetting::create($group_setting_data);
            return response()->json([
                "success" => false,
                "msg" => "Unknown error, broadcast data not found. Recreating broadcast data, please try again",
                "status" => 400
            ], 400);
        }

        $group_setting_data = [
            'lock_mention_everyone' => $request->lockMentionEveryone,
            'schedule_piket' => $request->schedulePiket,
        ];

        $group_setting->update($group_setting_data);

        return response()->json([
            "success" => true,
            "msg" => "Data updated " . $group_id,
            "status" => 200,
        ], 200);
    }

    public function fetchGroupData($group_id, Request $request)
    {
        if (!$group_id) {
            return response()->json([
                "success" => false,
                "msg" => "Group id is empty",
                "status" => 400
            ], 400);
        }

        $group = Group::where("group_user_id", $group_id)->first();

        if (!$group) {
            return response()->json([
                "success" => false,
                "msg" => "Group not found",
                "status" => 404
            ], 404);
        }

        $group_data = [
            'group_name' => $request->groupName,
            'group_pfp' => $request->groupPfp,
            'participants' => $request->participants,
        ];

        $group->update($group_data);

        return response()->json([
            "success" => true,
            "msg" => "Data updated " . $group_id,
            "status" => 200,
        ], 200);
    }

    public function clearPfpSlide($group_id)
    {
        if (!$group_id) {
            return response()->json([
                "success" => false,
                "msg" => "Group id is empty",
                "status" => 400
            ], 400);
        }

        $group = Group::where("group_user_id", $group_id)->first();

        $broadcaster = Broadcaster::where("group_id", $group->id)->first();

        if (!$broadcaster) {
            $broadcaster_id = Str::random(16);
            $broadcaster_data = [
                'id' => $broadcaster_id,
                'group_id' => $group_id,
                'motd_enabled' => false,
                'pfpslide_enabled' => false,
            ];
            Broadcaster::create($broadcaster_data);
            return response()->json([
                "success" => false,
                "msg" => "Unknown error, broadcast data not found. Recreating broadcast data, please try again",
                "status" => 400
            ], 400);
        }

        if ($broadcaster->pfp_slide) {
            Broadcaster::deleteById($broadcaster->id);
        }

        return response()->json([
            "success" => true,
            "msg" => "Data cleared " . $group_id,
            "status" => 200,
        ], 200);
    }

    public function shufflePfpSlideShow($group_id)
    {
        if (!$group_id) {
            return response()->json([
                "success" => false,
                "msg" => "Group id is empty",
                "status" => 400
            ], 400);
        }

        $group = Group::where("group_user_id", $group_id)->first();
        if (!$group) {
            return response()->json([
                "success" => false,
                "msg" => "Group not found",
                "status" => 404
            ], 404);
        }

        $broadcaster = Broadcaster::where("group_id", $group->id)->first();
        if (!$broadcaster) {
            $broadcaster_id = Str::random(16);
            $broadcaster_data = [
                'id' => $broadcaster_id,
                'group_id' => $group_id,
                'motd_enabled' => false,
                'pfpslide_enabled' => false,
            ];
            Broadcaster::create($broadcaster_data);
            return response()->json([
                "success" => false,
                "msg" => "Unknown error, broadcast data not found. Recreating broadcast data, please try again",
                "status" => 400
            ], 400);
        }

        $pfpSlides = json_decode($broadcaster->pfp_slide, true);

        shuffle($pfpSlides);

        return response()->json([
            "success" => true,
            "msg" => "Image received",
            "status" => 200,
            "image" => isset($pfpSlides[0]) ? "/storage/" . $pfpSlides[0] : null
        ], 200);
    }

    public function getById($group_user_id)
    {
        if (!$group_user_id) {
            return response()->json([
                "success" => false,
                "msg" => "Group id is empty",
                "status" => 400
            ], 400);
        }

        $group = Group::with(['broadcaster', 'groupSettings'])->where("group_user_id", $group_user_id)->first();
        if ($group) {
            return response()->json([
                "success" => true,
                "msg" => "Group retrieved",
                "group" => $group,
                "status" => 200
            ], 200);
        }

        return response()->json([
            "success" => false,
            "msg" => "Group not found",
            "status" => 404
        ], 404);
    }

    public function deleteRegistration($group_id)
    {
        if (!$group_id) {
            return response()->json([
                "success" => false,
                "msg" => "Group id is empty",
                "status" => 400
            ], 400);
        }

        $group = Group::where("group_user_id", $group_id)->first();

        AccessTokenGroup::where("group_id", $group->id)->delete();

        if (!$group) {
            return response()->json([
                "success" => false,
                "msg" => "Group not found",
                "status" => 404
            ], 404);
        }

        $group->delete();

        return response()->json([
            "success" => true,
            "msg" => "Group deleted",
            "status" => 200
        ], 200);
    }

    public function checkIsRegistered($group_id)
    {
        if (!$group_id) {
            return response()->json([
                "success" => false,
                "msg" => "Group id is empty",
                "status" => 400
            ], 400);
        }

        $group = Group::where("group_user_id", $group_id)->first();

        if (!$group) {
            return response()->json([
                "success" => true,
                "msg" => "Data retrieved",
                "value" => false,
                "status" => 200
            ], 200);
        }

        return response()->json([
            "success" => true,
            "msg" => "Data retrieved",
            "value" => true,
            "status" => 200
        ], 200);
    }
}
