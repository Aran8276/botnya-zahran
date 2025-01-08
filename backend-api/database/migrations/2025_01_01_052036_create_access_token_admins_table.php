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

        Schema::create('access_token_admins', function (Blueprint $table) {
            $table->string('id', 16)->primary();
            $table->string('access_token_id', 16);
            $table->foreign('access_token_id')->references('id')->on('access_tokens')->onDelete('cascade')->onUpdate('cascade');
            $table->timestamps();
        });

        Schema::enableForeignKeyConstraints();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('access_token_admins');
    }
};
