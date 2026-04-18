<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('commit_comments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('project_id');
            $table->string('commit_sha', 64);
            $table->string('file_path');
            $table->unsignedInteger('line_number');
            $table->string('line_side', 8);
            $table->text('line_text')->nullable();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->text('body');
            $table->timestamps();

            $table->index(['project_id', 'commit_sha']);
            $table->index(['project_id', 'commit_sha', 'file_path', 'line_number'], 'commit_comments_location_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('commit_comments');
    }
};
