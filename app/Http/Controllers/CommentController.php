<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\Comment;
use Illuminate\Http\Request;
use App\Http\Requests\StoreCommentRequest;

class CommentController extends Controller
{
    public function store(StoreCommentRequest $request, Post $post)
    {
        $validated = $request->validated();

        $post->comments()->create([
            'body' => $validated['body'],
            'user_id' => $request->user()->id,
        ]);

        return back()->with('success', 'Comment posted.');
    }
    
    public function destroy(Comment $comment)
    {
        $this->authorize('delete', $comment);
        $comment->delete();
        return back()->with('success', 'Comment deleted.');
    }
}
