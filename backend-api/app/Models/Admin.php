<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Admin extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'id',
        'admin_user_id',
        'group_list',
        'login_email',
        'login_password',
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'id' => 'string',
        'group_list' => 'array',
    ];


    public function adminBroadcaster()
    {
        return $this->hasOne(AdminBroadcaster::class);
    }

    public function adminSettings()
    {
        return $this->hasOne(AdminSetting::class);
    }
}
