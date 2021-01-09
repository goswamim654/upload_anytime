<?php

namespace App\Http\Middleware;

use Closure;

class Admin
{

    /* This middle ware is not in use now 19-03-2018 */

    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {


        if ( \Auth::check() && \Auth::user()->isAdmin() )
        {
            return $next($request);
        }


        $returnArr['status']=1;
        $returnArr['content']="";
        $returnArr['message']="Not an admin";

        //return redirect('home');
        return $returnArr;


        // Pre-Middleware Action

        /*$response = $next($request);*/

        // Post-Middleware Action

        /*return $response;*/
    }
}
