<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Group extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'id',
        'group_user_id',
        'group_name',
        'has_password',
        'password',
        'group_pfp',
        'participants',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array
     */
    protected $hidden = [
        'password',
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'id' => 'string',
        'participants' => 'array',
    ];


    public function broadcaster()
    {
        return $this->hasOne(Broadcaster::class);
    }

    public function groupSettings()
    {
        return $this->hasOne(GroupSetting::class);
    }
}
