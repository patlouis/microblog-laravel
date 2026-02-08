<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('dashboard', [
            'posts' => Post::with(['user', 'comments.user'])
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
