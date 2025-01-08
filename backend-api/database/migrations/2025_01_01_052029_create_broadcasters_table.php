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
        Schema::disableForeignKeyConstraints();

        Schema::create('broadcasters', function (Blueprint $table) {
            $table->string('id', 16)->primary();
            $table->string('group_id', 16);
            $table->foreign('group_id')->references('id')->on('groups')->onDelete('cascade')->onUpdate('cascade');
            $table->boolean('motd_enabled');
            $table->longText('motd')->nullable();
            $table->dateTime('motd_time')->nullable();
            $table->boolean('pfpslide_enabled');
            $table->json('pfp_slide')->nullable();
            $table->integer('pfp_slide_interval')->nullable();
            $table->timestamps();
        });

        Schema::enableForeignKeyConstraints();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('broadcasters');
    }
};
