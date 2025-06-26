<?php

namespace App\Http\Controllers;

use App\Models\Response;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

use function Laravel\Prompts\search;

class ResponseController extends Controller
{
    public function getResponses()
    {
        $data = Response::paginate(10);
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
            'reply' => 'max:4096',
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
            'reply' => isset($data['reply']) ? $data['reply'] : null
        ];
        Response::createResponse($send_data);

        if ($request->hasFile("image")) {
            Response::uploadImage($request->file("image"), $id);
        }

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
            'reply' => 'max:4096',
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
            'reply' => isset($data['reply']) ? $data['reply'] : null
        ];
        Response::updateData($send_data, $id);
        $response = Response::find($id);
        if ($request->hasFile("images")) {
            if ($response->images) {
                Response::deleteById($response->id);
            }
            Response::uploadImage($request->file("images"), $id);
        }
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
        $response = Response::find($id);
        if ($response->images) {
            Response::deleteById($id);
        }

        Response::deleteData($id);
        return response()->json([
            "success" => true,
            "msg" => "Data deleted",
            "id" => $id,
            "status" => 200,
        ]);
    }

    public function deleteImages($id)
    {
        $response = Response::find($id);
        if ($response->images) {
            Response::deleteById($id);
        }
        return response()->json([
            "success" => true,
            "msg" => "Images deleted",
            "id" => $id,
            "status" => 200,
        ]);
    }

    public function importResponses(Request $request)
    {
        if (!$request->data) {
            return response()->json([
                "success" => false,
                "msg" => "Data is empty",
                "status" => 400,
            ], 400);
        }

        $data = $request->data;

        foreach ($data as $item) {
            Response::create($item);
        }

        return response()->json([
            "success" => true,
            "msg" => "Import successful",
            "status" => 200,
        ], 200);
    }

    public function searchResponses()
    {
        $data = Response::all();
        return response()->json([
            "success" => true,
            "msg" => "Data retrieved (no query index)",
            "responses" => $data,
            "status" => 200,
        ]);

        // $search = $request->q;
        // if (!$search) {
        //     $data = Response::all();
        //     return response()->json([
        //         "success" => true,
        //         "msg" => "Data retrieved (no query index)",
        //         "responses" => $data,
        //         "status" => 200,
        //     ]);
        // }

        // $result = Response::where("case", 'like', '%' . $search . '%')->paginate(10);

        // return response()->json([
        //     "success" => true,
        //     "msg" => "Data retrieved",
        //     "responses" => $result,
        //     "status" => 200,
        // ], 200);
    }

    public function getByCase(Request $request)
    {
        $find = $request->find;
        if (!$find) {
            return response()->json([
                "success" => true,
                "msg" => "Find is empty",
                "status" => 400,
            ], 400);
        }

        $result = Response::where("case", '=', $find)->first();

        return response()->json([
            "success" => true,
            "msg" => "Data retrieved",
            "responses" => $result,
            "status" => 200,
        ], 200);
    }
}
