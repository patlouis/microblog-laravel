<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Post;
use App\Models\Share;
use App\Models\Follow;
use App\Services\ProfileService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB; 
use Inertia\Inertia;

class ProfileController extends Controller
{
    public function show(Request $request, User $user, ProfileService $profileService)
    {
        $user->loadCount(['posts', 'shares', 'followers', 'following', ]);

        return Inertia::render('profile/show', [
            'profileUser' => $user,
            'isFollowing' => $request->user()?->isFollowing($user),
            'posts'       => $profileService->getUserFeed($user->id, 10)
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
            ->get();

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
            ->get();

        return Inertia::render('profile/UserList', [
            'profileUser' => $user,
            'title' => 'Following',
            'users' => $users,
        ]);
    }

    public function destroy(Post $post)
    {
        Gate::authorize('delete', $post);
        
        if ($post->image_url) {
            Storage::disk('public')->delete($post->image_url);
        }
        
        $post->delete();
        if (url()->previous() === route('posts.show', $post)) {
            return to_route('dashboard')->with('success', 'Post deleted.');
        }
        return back()->with('success', 'Post deleted.');
    }
}
