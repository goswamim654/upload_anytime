<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class OauthClients extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = ['user_id', 'name', 'secret', 'redirect', 'personal_access_client', 'password_client', 'revoked'];
}