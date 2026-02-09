<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $user = Auth::user();

        $followingIds = $user->following()->pluck('users.id');
        $allowedUserIds = $followingIds->push($user->id);

        return Inertia::render('dashboard', [
            'posts' => Post::whereIn('user_id', $allowedUserIds)
                ->with(['user', 'comments.user'])
                ->withCount(['comments', 'likes', 'shares'])
                ->withExists([
                    'likes as liked' => function ($q) {
                        $q->where('user_id', auth()->id());
                    },
                    'shares as shared' => function ($q) {
                        $q->where('user_id', auth()->id());
                    }
                ])
                ->latest()
                ->paginate(5),
        ]);
    }
}
