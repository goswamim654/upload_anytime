<?php

namespace App\Http\Controllers\Auth\V1;

use Psr\Http\Message\ServerRequestInterface;
use Illuminate\Http\Request;
use Laravel\Passport\Http\Controllers\AccessTokenController;

class CustomAccessTokenController extends AccessTokenController
{
    /**
     * Hooks in before the AccessTokenController issues a token
     *
     *
     * @param  ServerRequestInterface $request
     * @return mixed
     */
    public function issueUserToken(ServerRequestInterface $request)
    {

        $httpRequest =  $request->getHeaders();

        // $allPostPutVars = $request->getParsedBody();
        // foreach($allPostPutVars as $key => $param){
        //    echo $param."  <>  ".$key."<br>";
        // }
        echo '<pre>';
        print_r($httpRequest);
        exit;
        // 1.
        if ($httpRequest->grant_type == 'password') {
            // 2.
            //$user = \App\User::where('email', $httpRequest->username)->first();

            // Perform your validation here

            // If the validation is successfull:
            return $this->issueToken($request);
        }
    }
}