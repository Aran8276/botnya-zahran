<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('groups', function (Blueprint $table) {
            $table->string('id', 16)->primary();
            $table->string('group_user_id', 50);
            $table->string('group_name', 255);
            $table->boolean('has_password');
            $table->string('password', 255)->nullable();
            $table->string('group_pfp', 255);
            $table->json('participants');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('groups');
    }
};
