<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Post;
use App\Models\Follow;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ProfileController extends Controller
{
    public function show(Request $request, User $user)
    {
        $user->loadCount(['followers', 'following', 'posts', 'shares']);
        $isFollowing = $request->user()->isFollowing($user);
        $posts = Post::where('user_id', $user->id)
            ->orWhereHas('shares', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->withMetadata()
            ->latest()
            ->paginate(5);

        return Inertia::render('profile/show', [
            'profileUser' => $user,
            'isFollowing' => $isFollowing,
            'posts' => $posts
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

public function followers(Request $request, User $user)
    {
        $users = $user->followers()
            ->withExists(['followers as is_following' => function ($query) {
                $query->where('follower_id', Auth::id());
            }])
            ->paginate(15);

        return Inertia::render('profile/UserList', [
            'profileUser' => $user,
            'title' => 'Followers',
            'users' => $users,
        ]);
    }

    public function following(Request $request, User $user)
    {
        $users = $user->following()
            ->withExists(['followers as is_following' => function ($query) {
                $query->where('follower_id', Auth::id());
            }])
            ->paginate(15);

        return Inertia::render('profile/UserList', [
            'profileUser' => $user,
            'title' => 'Following',
            'users' => $users,
        ]);
    }
}
