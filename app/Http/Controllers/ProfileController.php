<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Post;
use App\Models\Follow;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProfileController extends Controller
{
    public function show(Request $request, User $user)
    {
        $isFollowing = $request->user() 
            ? $request->user()->isFollowing($user) 
            : false;

        return Inertia::render('profile/show', [
            'profileUser' => $user,
            'isFollowing' => $isFollowing,
            'posts' => Post::where('user_id', $user->id)
                ->with('user')
                ->latest()
                ->paginate(5)
        ]);
    }

    public function follow(Request $request, User $user)
    {
        if ($request->user()->id === $user->id) {
            return back()->with('error', 'You cannot follow yourself.');
        }

        $existingFollow = Follow::withTrashed()
            ->where('follower_id', $request->user()->id)
            ->where('user_id', $user->id)
            ->first();

        if ($existingFollow) {
            if ($existingFollow->trashed()) {
                $existingFollow->restore();
                return back()->with('success', 'User followed.');
            } else {
                $existingFollow->delete();
                return back()->with('success', 'User unfollowed.');
            }
        } else {
            Follow::create([
                'follower_id' => $request->user()->id,
                'user_id' => $user->id,
            ]);
            return back()->with('success', 'User followed.');
        }
    }
}
