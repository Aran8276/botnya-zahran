<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdminSetting extends Model
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
        'bot_delay_enabled',
        'bot_delay',
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'id' => 'string',
        'admin_id' => 'string',
        'bot_delay_enabled' => 'boolean',
    ];

    public function id(): BelongsTo
    {
        return $this->belongsTo(Admin::class);
    }
}
