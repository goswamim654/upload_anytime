<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class ImageRatings extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = ['user_id', 'image_id', 'image_owner_id', 'status', 'content_composition', 'image_quality', 'professionalism', 'excellent', 'world_class', 'overall_rating'];
}