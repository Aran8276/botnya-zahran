<?php

namespace App\Models;

use App\Http\Controllers\AccessTokenController;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AccessToken extends Model
{
    use HasFactory;
    protected $table = "access_tokens";
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'id',
        'access_token',
        'expire_date',
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'id' => 'string',
        'expire_date' => 'datetime',
    ];

    public function adminAcToken()
    {
        return $this->hasOne(AccessTokenAdmin::class);
    }

    public function groupAcToken()
    {
        return $this->hasOne(AccessTokenGroup::class);
    }

    public function manageAcToken()
    {
        return $this->hasOne(AccessTokenManage::class);
    }

    public function tokenDateValid($bearer)
    {
        $accessTokenController = new AccessTokenController();
        $accessTokenController->refresh();
        $db_token = $this->where("access_token", $bearer)->first();
        if (!$db_token) {
            return false;
        }
        return true;
    }
}
