<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use App\Models\AccessToken;
use App\Models\AccessTokenGroup;
use App\Models\Group;

class AccessTokenGroupFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = AccessTokenGroup::class;

    /**
     * Define the model's default state.
     */
    public function definition(): array
    {
        return [
            'access_token_id' => AccessToken::factory(),
            'group_id' => Group::factory(),
        ];
    }
}
