<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('commit_reviews', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('project_id');
            $table->string('commit_sha', 64);
            $table->unsignedTinyInteger('score');
            $table->text('summary');
            $table->foreignId('reviewed_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('model', 120)->nullable();
            $table->timestamps();

            $table->unique(['project_id', 'commit_sha']);
            $table->index(['project_id', 'commit_sha']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('commit_reviews');
    }
};
