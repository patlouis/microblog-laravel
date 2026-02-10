<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Post;
use App\Models\Share;
use App\Models\Follow;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB; 
use Inertia\Inertia;

class ProfileController extends Controller
{
    public function show(Request $request, User $user)
    {
        $user->loadCount(['followers', 'following', 'posts', 'shares']);

        $isFollowing = $request->user()?->isFollowing($user);

        $postsQuery = DB::table('posts')
            ->select('id', DB::raw("'post' as type"), 'created_at as sort_date')
            ->where('user_id', $user->id)
            ->whereNull('deleted_at');

        $sharesQuery = DB::table('shares')
            ->select('id', DB::raw("'share' as type"), 'updated_at as sort_date')
            ->where('user_id', $user->id);

        $feedIds = $postsQuery->union($sharesQuery)
            ->orderByDesc('sort_date')
            ->paginate(5);

        $feedItems = $feedIds->getCollection()->map(function ($item) {
            if ($item->type === 'post') {
                $post = Post::with(['user'])->withMetadata()->find($item->id);
                if ($post) $post->type = 'post';
                return $post;
            } else {
                $share = Share::with([
                    'post' => fn($q) => $q->withMetadata()->with('user'),
                    'user'
                ])->find($item->id);
                
                if ($share) $share->type = 'share';
                return $share;
            }
        })->filter()->values();

        $feedIds->setCollection($feedItems);

        return Inertia::render('profile/show', [
            'profileUser' => $user,
            'isFollowing' => $isFollowing,
            'posts' => $feedIds
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
