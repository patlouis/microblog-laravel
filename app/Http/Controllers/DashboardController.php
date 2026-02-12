<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\Share;
use App\Services\DashboardService;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request, DashboardService $dashboardService)
    {
        $user = $request->user();
        
        $userIds = $user->following()->pluck('users.id')->push($user->id)->toArray();

        return Inertia::render('dashboard', [
            'posts' => $dashboardService->getGlobalFeed($userIds, 20)
        ]);
    }
}
