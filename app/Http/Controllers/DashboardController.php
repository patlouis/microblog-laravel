<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\Share;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Pagination\LengthAwarePaginator;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        $userIds = $user->following()->pluck('users.id')->push($user->id);

        $directPosts = Post::withMetadata()
            ->whereIn('user_id', $userIds)
            ->get()
            ->map(function ($post) {
                return [
                    'type' => 'post',
                    'sort_date' => $post->created_at,
                    'data' => $post
                ];
            });

        $shares = Share::whereIn('user_id', $userIds)
            ->with(['user', 'post' => function ($q) {
                $q->withMetadata();
            }])
            ->get()
            ->map(function ($share) {
                return [
                    'type' => 'share',
                    'sort_date' => $share->updated_at,
                    'data' => $share
                ];
            })
            ->filter(fn($item) => $item['data']->post !== null);

        $feed = $directPosts->concat($shares)->sortByDesc('sort_date')->values();

        $perPage = 5;
        $currentPage = LengthAwarePaginator::resolveCurrentPage();

        $currentItems = $feed->slice(($currentPage - 1) * $perPage, $perPage)->values()->all();

        $posts = new LengthAwarePaginator(
            $currentItems,
            $feed->count(),
            $perPage,
            $currentPage,
            ['path' => $request->url(), 'query' => $request->query()]
        );

        return Inertia::render('dashboard', [
            'posts' => $posts
        ]);
    }
}
