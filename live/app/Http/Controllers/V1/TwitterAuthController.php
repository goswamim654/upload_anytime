<?php

namespace App\Http\Controllers\V1;

use Illuminate\Support\Facades\Input;
use Illuminate\Support\Facades\Hash;
use Dingo\Api\Routing\Helpers;
use Illuminate\Http\Request;
use Abraham\TwitterOAuth\TwitterOAuth;
use DB;

class TwitterAuthController extends Controller
{
    use Helpers;
    protected $twitteroauth;
    protected $clientCallback = "https://www.snaplava.com/?twitter_auth_check=true";
    protected $app_id = "4tUGARpYU6OGSeMAVLVNh2zkt";
    protected $app_secret = "SG7LKmlJpviAHVDFVw23PbWGOS8iAXqvKkGrSboOmKthq9sy2h";

    protected $userTransformer;


    //public function __construct(\App\Repository\UsersRepository $userRepository, \App\Transformer\UserTransformer $userTransformer){
    public function __construct(\App\User $user, \App\UserDetails $userDetails, \App\Transformer\UserTransformer $userTransformer){
    	
        $this->user = $user;
    	$this->userDetails = $userDetails;
    	$this->userTransformer = $userTransformer;
        $this->twitteroauth = new TwitterOAuth($this->app_id,$this->app_secret);
    }

    protected function generateAccessToken()
    {
        $response=$this->twitteroauth->oauth('oauth/request_token', ['oauth_callback' => $this->clientCallback]);
        if($response){
            return $response;
        }else{
            return false;
        }
    }

    public function getUrl()
    {
        $accessToken=$this->generateAccessToken();
        if($accessToken){
            $authorizationUrl=$this->twitteroauth->url('oauth/authorize', ['oauth_token' => $accessToken['oauth_token'] ]);
            if($authorizationUrl){
                $data['auth_token']=$accessToken['oauth_token'];
                $data['auth_secret']=$accessToken['oauth_token_secret'];
                $data['url']=$authorizationUrl;
                $returnArr['status']=2;
                $returnArr['content']=$data;
                $returnArr['message']="Authorization Url created successfully.";
            }else{
                $returnArr['status']=3;
                $returnArr['content']="";
                $returnArr['message']="Could not create the Authorization Url.";
            }
        }else{
            $returnArr['status']=3;
            $returnArr['content']="";
            $returnArr['message']="Could not create the Authorization Url.";
        }

        return $returnArr;
    }

    public function getTwitterUserInformation(Request $request){
        $input=$request->all();

        if((isset($input['oauth_token']) && $input['oauth_token']!="") && (isset($input['oauth_verifier']) && $input['oauth_verifier']!="") && (isset($input['twitter_auth_secret']) && $input['twitter_auth_secret']!="")){

            $connection = new TwitterOAuth($this->app_id,$this->app_secret, $input['oauth_token'], $input['twitter_auth_secret']);

            $accessToken = $connection->oauth('oauth/access_token', ['oauth_verifier' => $input['oauth_verifier']]);
          
            $connection = new TwitterOAuth($this->app_id, $this->app_secret, $accessToken['oauth_token'], $accessToken['oauth_token_secret']);

            $params = array('include_email' => 'true', 'include_entities' => 'false', 'skip_status' => 'true');

            $payload = $connection->get('account/verify_credentials', $params); 
            // don't forgot the qoutes over the true.


            if(isset($payload->id) && $payload->id!=NULL){

               // $dataArr[]=

                $user['name']=isset($payload->name) ? $payload->name : NULL;
                $user['email']=isset($payload->email) ? $payload->email : NULL;
                $userData=$this->user->create($user);

                if(isset($payload->profile_image_url_https) && $payload->profile_image_url_https!=NULL){
                    $profileImage=$payload->profile_image_url_https;
                }else if(isset($payload->profile_image_url) && $payload->profile_image_url!=NULL){
                    $profileImage=$payload->profile_image_url;
                }else{
                    $profileImage=NULL;
                }

                $userDetailsArr['user_id']=$userData->id;
                $userDetailsArr['social_id']=$payload->id;
                $userDetailsArr['email']=isset($user['email']) ? $user['email'] : $payload->id."@snaplava.com";
                $userDetailsArr['photo']=isset($profileImage) ? $profileImage : NUll;
                $userDetailsData=$this->userDetails->create($userDetailsArr);

                $returnArr['status']=2;
                $returnArr['content']=$payload;
                $returnArr['message']="Loged in successfully.";
            }else{
                $returnArr['status']=3;
                $returnArr['content']="";
                $returnArr['message']="Could not fetch user data.";
            }
            
            
            return $returnArr;

        }
        
    }
    
}
