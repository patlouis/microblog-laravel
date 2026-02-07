<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the general feed.
     */
    public function index(): Response
    {
        return Inertia::render('dashboard', [
            'posts' => Post::with('user')
                ->latest()
                ->get(),
        ]);
    }
}
