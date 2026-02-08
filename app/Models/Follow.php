<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Follow extends Model
{
    use SoftDeletes;

    protected $table = 'followers'; 

    protected $fillable = [
        'user_id', 
        'follower_id'
    ];
}
