<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class AdminBroadcaster extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'id',
        'admin_id',
        'pfpslide_enabled',
        'pfpslide',
        'pfpslide_interval',
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'id' => 'string',
        'pfpslide_enabled' => 'boolean',
        'pfpslide' => 'array',
    ];

    public function admin(): BelongsTo
    {
        return $this->belongsTo(Admin::class);
    }

    protected static function deleteById($id)
    {
        $media = self::find($id);
        $images = json_decode($media->pfpslide);

        Storage::disk('public')->delete($images);

        $media->pfpslide = json_encode([]);
        $media->save();
    }

    protected static function uploadImage($data, $id)
    {
        $media = self::find($id);
        $paths = [];
        foreach ($data as $file) {
            $path = $file->store('/uploads/admin-pfp-slides', "public");
            $paths[] = $path;
        }
        $media->pfpslide = json_encode($paths);
        $media->save();
    }
}
