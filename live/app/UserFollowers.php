<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class UserFollowers extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = ['follower_user_id', 'following_user_id'];
}