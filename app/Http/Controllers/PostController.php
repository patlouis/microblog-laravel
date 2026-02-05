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
    /**
     * Display the feed.
     */
    public function index()
    {
        $posts = Post::with('user')
            ->latest()
            ->get();

        return Inertia::render('post/index', [
            'posts' => $posts,
        ]);
    }

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

        $imagePath = null;

        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('posts', 'public');
        }

        Post::create([
            'user_id' => Auth::id(),
            'content' => $validated['content'],
            'image_path' => $imagePath,
        ]);

        return redirect()->back();
    }

    /**
     * Display a single post.
     */
    public function show(Post $post)
    {
        $post->load('user');

        return Inertia::render('post/show', [
            'post' => $post,
        ]);
    }

        public function edit()
        {
            return Inertia::render('post/edit', []);
        }

    /**
     * Update the specified post.
     */
    public function update(UpdatePostRequest $request, Post $post)
    {
        $this->authorize('update', $post);

        $validated = $request->validated();

        if ($request->hasFile('image')) {
            if ($post->image_path) {
                Storage::disk('public')->delete($post->image_path);
            }

            $post->image_path = $request->file('image')->store('posts', 'public');
        }

        $post->update([
            'content' => $validated['content'],
        ]);

        return redirect()->back();
    }

    /**
     * Soft delete the post.
     */
    public function destroy(Post $post)
    {
        $this->authorize('delete', $post);

        $post->delete();

        return redirect()->back();
    }
}
