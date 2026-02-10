<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $posts = Post::withMetadata()
            ->whereIn('user_id', $request->user()->following()->pluck('user_id'))
            ->orWhere('user_id', $request->user()->id)
            ->latest()
            ->paginate(5);

        return Inertia::render('dashboard', [
            'posts' => $posts
        ]);
    }
}
