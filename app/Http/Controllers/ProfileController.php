<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Post;
use Inertia\Inertia;

class ProfileController extends Controller
{
    public function show(User $user)
    {
        return Inertia::render('profile/show', [
            'profileUser' => $user,
            'posts' => Post::where('user_id', $user->id)
                ->with('user')
                ->latest()
                ->paginate(5)
        ]);
    }
}
