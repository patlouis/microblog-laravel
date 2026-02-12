<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Post extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'content',
        'image_url',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function likes()
    {
        return $this->hasMany(Like::class);
    }

    public function likedBy(User $user): bool
    {
        return $this->likes()
            ->where('user_id', $user->id)
            ->exists();
    }

    public function comments() {
        return $this->hasMany(Comment::class);
    }

    public function shares()
    {
        return $this->hasMany(Share::class);
    }

    public function scopeWithMetadata($query)
    {
        return $query->with(['user', 'comments.user'])
            ->withCount(['comments', 'likes', 'shares'])
            ->withExists([
                'likes as liked' => fn($q) => $q->where('user_id', auth()->id()),
                'shares as shared' => fn($q) => $q->where('user_id', auth()->id())
            ]);
    }

    public function scopeFeedFor($query, $user)
    {
        $userIds = $user->following()->pluck('users.id')->push($user->id);
        return $query->whereIn('user_id', $userIds);
    }

    protected static function booted()
    {
        static::deleting(function ($post) {
            if ($post->isForceDeleting()) {
                $post->comments()->forceDelete();
                $post->likes()->forceDelete();
                $post->shares()->forceDelete();
            } else {
                $post->comments()->delete();
                $post->likes()->delete();
            }
        });

        static::restoring(function ($post) {
            $post->comments()->restore();
            $post->likes()->restore();
            $post->shares()->restore();
        });
    }
}
