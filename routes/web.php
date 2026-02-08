<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\PostController;
use App\Http\Controllers\DashboardController; 
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\LikeController;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/profile/{user}', [ProfileController::class, 'show'])->name('profile.show');
    Route::post('/posts/{post}/like', [LikeController::class, 'toggle'])->name('posts.like'); 
    Route::resource('posts', PostController::class);
});

require __DIR__.'/settings.php';
