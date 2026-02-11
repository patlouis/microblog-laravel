<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\PostController;
use App\Http\Controllers\DashboardController; 
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\LikeController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\ShareController;
use App\Http\Controllers\SearchController;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // Home
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    // Search
    Route::get('/api/search/users', SearchController::class)->name('search.users');
    // Post
    Route::resource('posts', PostController::class);
    Route::post('/posts/{post}/like', [LikeController::class, 'toggle'])->name('posts.like'); 
    Route::post('/posts/{post}/share', [ShareController::class, 'store'])->name('posts.share');
    Route::post('/posts/{post}/comments', [CommentController::class, 'store'])->name('comments.store');
    Route::put('/comments/{comment}', [CommentController::class, 'update'])->name('comments.update');
    Route::delete('/comments/{comment}', [CommentController::class, 'destroy'])->name('comments.destroy');
    // Profile
    Route::get('/profile/{user}', [ProfileController::class, 'show'])->name('profile.show');
    Route::get('/profile/{user}/followers', [ProfileController::class, 'followers'])->name('profile.followers');
    Route::get('/profile/{user}/following', [ProfileController::class, 'following'])->name('profile.following');
    Route::post('/profile/{user}/follow', [ProfileController::class, 'follow'])->name('profile.follow');
});

require __DIR__.'/settings.php';
