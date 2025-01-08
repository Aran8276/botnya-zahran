<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Response extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'id',
        'case',
        'reply',
        'images',
    ];

    protected $casts = [
        'id ' => 'string',
    ];

    public $incrementing = false;


    protected static function createResponse($data)
    {
        return self::create($data);
    }

    protected static function updateData($data, $id)
    {
        $response = self::find($id);

        return $response->update($data);
    }

    protected static function deleteData($id)
    {
        $response = self::find($id);

        return $response->delete();
    }

    protected static function findData($id)
    {
        return self::find($id);
    }

    protected static function deleteById($id)
    {
        $media = self::find($id);
        $images = json_decode($media->images);

        Storage::disk('public')->delete($images);

        $media->images = null;
        $media->save();
    }

    protected static function uploadImage($data, $id)
    {
        $media = self::find($id);
        $paths = [];
        foreach ($data as $file) {
            $path = $file->store('/uploads/responses-images', "public");
            $paths[] = $path;
        }
        $media->images = json_encode($paths);
        $media->save();

    }
}
