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
        return Inertia::render('dashboard', [
            'posts' => Post::feedFor(auth()->user())
                ->withMetadata()
                ->latest()
                ->paginate(5),
        ]);
    }
}
