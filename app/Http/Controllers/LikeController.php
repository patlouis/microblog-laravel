<?php

namespace App\Http\Controllers;

use App\Models\Post;

class LikeController extends Controller
{
    public function toggle(Post $post)
    {
        $userId = auth()->id();

        $like = $post->likes()
            ->withTrashed()
            ->where('user_id', $userId)
            ->first();

        if ($like) {
            if ($like->trashed()) {
                $like->restore();

                return back()->with('success', 'You liked the post');
            } else {
                $like->delete();

                return back()->with('success', 'You unliked the post');
            }
        }

        $post->likes()->create([
            'user_id' => $userId,
        ]);

        return back()->with('success', 'You liked the post');
    }
}
