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
            'posts' => Post::with([
                'user',                
                'comments.user',        
            ])
            ->withCount('comments')     
            ->latest()
            ->paginate(5),
        ]);
    }
}
