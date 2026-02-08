<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;

class ShareController extends Controller
{
    public function store(Request $request, Post $post)
    {
        $existingShare = $request->user()->shares()
            ->withTrashed()
            ->where('post_id', $post->id)
            ->first();

        if ($existingShare) {
            if ($existingShare->trashed()) {
                $existingShare->restore();
                $existingShare->touch();
                
                return back()->with('success', 'Post shared.');
            } else {
                $existingShare->delete();
                
                return back()->with('success', 'Post unshared.');
            }
        } else {
            $request->user()->shares()->create([
                'post_id' => $post->id,
            ]);

            return back()->with('success', 'Post shared.');
        }
    }
}
