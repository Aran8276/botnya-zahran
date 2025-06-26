<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class Broadcaster extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'id',
        'group_id',
        'motd_enabled',
        'motd',
        'motd_time',
        'pfpslide_enabled',
        'pfp_slide',
        'pfp_slide_interval',
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'id' => 'string',
        'motd_enabled' => 'boolean',
        'motd_time' => 'datetime',
        'pfpslide_enabled' => 'boolean',
        'pfp_slide' => 'array',
    ];

    public function group(): BelongsTo
    {
        return $this->belongsTo(Group::class);
    }

    protected static function deleteById($id)
    {
        $media = self::find($id);
        $images = json_decode($media->pfp_slide);

        Storage::disk('public')->delete($images);

        $media->pfp_slide = json_encode([]);
        $media->save();
    }

    protected static function uploadImage($data, $id)
    {
        $media = self::find($id);
        $paths = [];
        foreach ($data as $file) {
            $path = $file->store('/uploads/group-pfp-slides', "public");
            $paths[] = $path;
        }
        $media->pfp_slide = json_encode($paths);
        $media->save();
    }
}
