<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Response extends Model
{
    /** @use HasFactory<\Database\Factories\ResponseFactory> */
    use HasFactory;

    protected $table = 'responses';
    protected $primaryKey = 'id';
    protected $keyType = 'string';
    protected $fillable = [
        'id',
        'case',
        'reply',
    ];

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
}
