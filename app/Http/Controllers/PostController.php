<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Http\Requests\StorePostRequest;
use App\Http\Requests\UpdatePostRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PostController extends Controller
{
    public function create()
    {
        return Inertia::render('post/create', []);
    }

    /**
     * Store a newly created post.
     */
    public function store(StorePostRequest $request)
    {
        $validated = $request->validated();
        $imageUrl = null;

        if ($request->hasFile('image')) {
            $imageUrl = $request->file('image')->store('posts', 'public');
        }

        Post::create([
            'user_id' => Auth::id(),
            'content' => $validated['content'],
            'image_url' => $imageUrl,
        ]);

        return redirect()->route('dashboard')->with('success', 'Post created successfully!');
    }

    /**
     * Display a single post.
     */
    public function show(Post $post)
    {
        $post->load([
            'user', 
            'comments.user',
        ]);
        
        $post->loadCount(['comments', 'likes', 'shares']);
        
        $post->liked = $post->likes()->where('user_id', auth()->id())->exists();
        $post->shared = $post->shares()->where('user_id', auth()->id())->exists();

        return Inertia::render('post/show', [
            'post' => $post,
        ]);
    }

    public function edit(Post $post)
    {
        return Inertia::render('post/edit', [
            'post' => [
                'id' => $post->id,
                'content' => $post->content,
                'image_url' => $post->image_url,
            ]
        ]);
    }

    /**
     * Update the specified post.
     */
    public function update(UpdatePostRequest $request, Post $post)
    {
        $validated = $request->validated();

        if ($request->hasFile('image')) {
            if ($post->image_url) {
                Storage::disk('public')->delete($post->image_url);
            }
            $post->image_url = $request->file('image')->store('posts', 'public');
        } 
        else if ($request->boolean('remove_image')) {
            if ($post->image_url) {
                Storage::disk('public')->delete($post->image_url);
            }
            $post->image_url = null;
        }

        $post->content = $validated['content'];
        $post->save();

        return redirect()->route('dashboard')->with('success', 'Post updated successfully!');
    }

    /**
     * Soft delete the post.
     */
    public function destroy(Post $post)
    {
        if ($post->image_url) {
            Storage::disk('public')->delete($post->image_url);
        }
        
        $post->delete();

        return redirect()->back()->with('success', 'Post deleted.');
    }
}
