<?php

namespace App\Http\Controllers;

use App\Models\Response;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ResponseController extends Controller
{
    public function getResponses()
    {
        $data = Response::all();
        return response()->json([
            "success" => true,
            "msg" => "Data retrieved",
            "responses" => $data,
            "status" => 200,
        ]);
    }

    public function getResponse($id)
    {
        $data = Response::findData($id);
        return response()->json([
            "success" => true,
            "msg" => "Data retrieved",
            "response" => $data,
            "status" => 200,
        ]);
    }

    public function createResponse(Request $request)
    {
        $data = $request->all();
        if (empty($data)) {
            return response()->json([
                "success" => false,
                "msg" => "Create action failed",
                "error" => "Body is empty",
                "status" => 400,
            ], 400);
        }
        $validator = Validator::make($data, [
            'case' => 'required|max:255',
            'reply' => 'required|max:4096',
        ]);
        if ($validator->fails()) {
            return response()->json([
                "success" => false,
                "msg" => "Create action failed",
                "error" => $validator->errors(),
                "status" => 400,
            ], 400);
        }
        $id = Str::random(16);
        $send_data = [
            'id' => $id,
            'case' => $data['case'],
            'reply' => $data['reply'],
        ];
        Response::createResponse($send_data);
        return response()->json([
            "success" => true,
            "msg" => "Data created",
            "callback" => $send_data,
            "status" => 200,
        ]);
    }

    public function updateResponse(Request $request, $id)
    {
        $data = $request->all();
        if (empty($data)) {
            return response()->json([
                "success" => false,
                "msg" => "Update fails",
                "error" => "Body is empty",
                "status" => 400,
            ], 400);
        }
        $validator = Validator::make($data, [
            'case' => 'required|max:255',
            'reply' => 'required|max:4096',
        ]);
        if ($validator->fails()) {
            return response()->json([
                "success" => false,
                "msg" => "Update fails",
                "error" => $validator->errors(),
                "status" => 400,
            ], 400);
        }
        $send_data = [
            'case' => $data['case'],
            'reply' => $data['reply'],
        ];
        Response::updateData($send_data, $id);
        return response()->json([
            "success" => true,
            "msg" => "Data updated",
            "id" => $id,
            "callback" => $send_data,
            "status" => 200,
        ]);
    }

    public function deleteResponse($id)
    {
        Response::deleteData($id);
        return response()->json([
            "success" => true,
            "msg" => "Data deleted",
            "id" => $id,
            "status" => 200,
        ]);
    }
}
