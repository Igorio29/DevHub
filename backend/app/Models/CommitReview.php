<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CommitReview extends Model
{
    protected $fillable = [
        'project_id',
        'commit_sha',
        'score',
        'summary',
        'reviewed_by_user_id',
        'model',
    ];

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by_user_id');
    }
}
