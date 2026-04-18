<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CommitComment extends Model
{
    protected $fillable = [
        'project_id',
        'commit_sha',
        'file_path',
        'line_number',
        'line_side',
        'line_text',
        'user_id',
        'body',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
