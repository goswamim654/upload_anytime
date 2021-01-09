<?php  
	namespace App\Http\Controllers\V1\Auth;
	
	use App\Http\Controllers\V1\Controller;
	use Illuminate\Support\Facades\Input;
	use Illuminate\Support\Facades\Hash;
	use Dingo\Api\Routing\Helpers;
	use Illuminate\Http\Request;
	use DB;
	use Socialite;

	class LoginController extends Controller
	{
		use Helpers;

	    //protected $userRepository;
	    protected $userTransformer;


	    //public function __construct(\App\Repository\UsersRepository $userRepository, \App\Transformer\UserTransformer $userTransformer){
	    public function __construct(\App\User $user, \App\UserDetails $userDetails, \App\OauthClients $oauthClients, \App\OauthPersonalAccessClients $oauthPersonalAccessClients, \App\Transformer\UserTransformer $userTransformer){
	    	//$this->userRepository = $userRepository;
	        $this->user = $user;
	    	$this->userDetails = $userDetails;
	    	$this->userTransformer = $userTransformer;
	    	$this->oauthClients = $oauthClients;
	    	$this->oauthPersonalAccessClients = $oauthPersonalAccessClients;
	    }

	    /**
	     * Redirect the user to the GitHub authentication page.
	     *
	     * @return \Illuminate\Http\Response
	     */
	    public function redirectToTwitter()
	    {
	        return Socialite::driver('twitter')->redirect();
	    }

	    /**
	     * Obtain the user information from GitHub.
	     *
	     * @return \Illuminate\Http\Response
	     */
	    public function handleTwitterCallback()
	    {
	        $user = Socialite::driver('twitter')->user();

	        if(empty($user)){
	        	$returnArr['status']=3;
	            $returnArr['content']="";
	            $returnArr['message']="Could not fetch user data.";
	        }else{
	        	$id=$user->getId();
				$name=$user->getName();
				$email=$user->getEmail();
				$photoUrl=$user->getAvatar();
				$photo=isset($user->user['profile_image_url_https']) ? $user->user['profile_image_url_https'] : $photoUrl;

				/*$returnArr['status']=2;
                $returnArr['content']=$user;
                $returnArr['message']="User loged in successfull.";
				return $returnArr;*/   

				if(isset($email) && $email!=NULL){
					$usersEmailCheckData=DB::table('users')
                        ->select('users.id as user_id', 'users.name as user_name', 'users.email as user_email', 'users.photo as users_photo')
                        ->where('users.email', '=', $email)
                        ->first();
                    if($usersEmailCheckData){
                    	$checkUserData = DB::table('users')
                        ->select('users.id as user_id', 'users.name as user_name', 'users.email as user_email', 'users.photo as users_photo', 'user_details.social_id as social_id', 'user_details.email as social_email', 'user_details.photo as social_photo', 'oauth_clients.id as client_id', 'oauth_clients.secret as client_secret')
                        ->join('user_details', 'users.id', '=', 'user_details.user_id')
                        ->join('oauth_clients', 'users.id', '=', 'oauth_clients.user_id')
                        ->where('user_details.social_id', '=', $id)
                        ->first();

		                if($checkUserData){

		                	$username=isset($checkUserData->user_email) ? $checkUserData->user_email : $checkUserData->social_email;
		                	$userPhoto=isset($checkUserData->users_photo) ? $checkUserData->users_photo : $checkUserData->social_photo;

			                $client = new \GuzzleHttp\Client();

			                try {
			                	$response = $client->request('POST', 'https://www.snaplava.com/live/public/api/v1/oauth/token', [
				                    'headers' => [
				                        'user-agent' => $_SERVER['HTTP_USER_AGENT'],
				                    ],
				                    'form_params' => [
				                        'grant_type' => 'personal_access', 
			                            'client_id'=> $checkUserData->client_id, 
			                            'client_secret' => $checkUserData->client_secret, 
			                            //'username'=>$username,
			                            'user_id'=>$checkUserData->user_id,
			                            'scope'=>'*',
			                            'provider'=>'api'
				                    ]
				                ]);

				                $contents = json_decode($response->getBody(), true);

				                $returnArr['status']=2;
				                $returnArr['content']=$contents;
				                $returnArr['message']="User loged in successfull.";
			                }
			                catch (\GuzzleHttp\Exception\ClientException $e) {
				                $responsePre = $e->getResponse();
				                $response = json_decode($responsePre->getBody(), true);

				                $returnArr['status']=3;
				                $returnArr['content']=$response;
				                $returnArr['message']="Could not generate the user access token.";
				            }

			                

		                }else{
		                	$userDetailsData['user_id']=$usersEmailCheckData->user_id;
							$userDetailsData['social_id']=isset($id) ? $id : NULL;
							$userDetailsData['email']=isset($email) ? $email : NULL;
							$userDetailsData['photo']=isset($photo) ? $photo : NULL;
							$userDetailsData['login_type']='twitter';
							$userDetailsResult=$this->userDetails->create($userDetailsData);

							$oauthClientsData['user_id']=$usersEmailCheckData->user_id;
							$oauthClientsData['name']="Personal Access Client";
							$oauthClientsData['secret']=isset($user->tokenSecret) ? $user->tokenSecret : NULL;
							$oauthClientsData['redirect']="https://www.snaplava.com/";
							$oauthClientsData['personal_access_client']=1;
							$oauthClientsData['password_client']=0;
							$oauthClientsData['revoked']=0;
							$oauthClientsResult=$this->oauthClients->create($oauthClientsData);

							$oauthPersonalAccessClientsData['client_id']=$oauthClientsResult->id;
							$oauthPersonalAccessClientsResult=$this->oauthPersonalAccessClients->create($oauthPersonalAccessClientsData);

							if(!empty($oauthPersonalAccessClientsResult)){
								$username=$userDetailsData['email'];

								$client = new \GuzzleHttp\Client();
								try{
									$response = $client->request('POST', 'https://www.snaplava.com/live/public/api/v1/oauth/token', [
			                            'headers' => [
			                                'user-agent' => $_SERVER['HTTP_USER_AGENT'],
			                            ],
			                            'form_params' => [
			                                'grant_type' => 'personal_access', 
			                                'client_id'=> $oauthClientsResult->id, 
			                                'client_secret' => $oauthClientsData['secret'], 
			                                //'username'=>$username,
			                                'user_id'=>$oauthClientsData['user_id'],
			                                'scope'=>'*',
			                                'provider'=>'api'
			                            ]
			                        ]);

			                        $contents = json_decode($response->getBody(), true);

			                        $returnArr['status']=2;
			                        $returnArr['content']=$contents;
			                        $returnArr['message']="User is created successfully.";
								}
								catch (\GuzzleHttp\Exception\ClientException $e) {
					                $responsePre = $e->getResponse();
					                $response = json_decode($responsePre->getBody(), true);

					                $returnArr['status']=3;
					                $returnArr['content']=$response;
					                $returnArr['message']="Could not generate the user access token.";
					            }

							}else{
			                    $returnArr['status']=3;
			                    $returnArr['content']="";
			                    $returnArr['message']="User is not created successfully.";
			                }
		                }
                    }else{

                    	$userData['name']=isset($name) ? $name : NULL;
						$userData['email']=isset($email) ? $email : NULL;
						$userData['photo']=isset($photo) ? $photo : NULL;
						$userData=$this->user->create($userData);

						$userDetailsData['user_id']=$userData->id;
						$userDetailsData['social_id']=isset($id) ? $id : NULL;
						$userDetailsData['email']=isset($email) ? $email : NULL;
						$userDetailsData['photo']=isset($photo) ? $photo : NULL;
						$userDetailsData['login_type']='twitter';
						$userDetailsResult=$this->userDetails->create($userDetailsData);

						$oauthClientsData['user_id']=$userData->id;
						$oauthClientsData['name']="Personal Access Client";
						$oauthClientsData['secret']=isset($user->tokenSecret) ? $user->tokenSecret : NULL;
						$oauthClientsData['redirect']="https://www.snaplava.com/";
						$oauthClientsData['personal_access_client']=1;
						$oauthClientsData['password_client']=0;
						$oauthClientsData['revoked']=0;
						$oauthClientsResult=$this->oauthClients->create($oauthClientsData);

						$oauthPersonalAccessClientsData['client_id']=$oauthClientsResult->id;
						$oauthPersonalAccessClientsResult=$this->oauthPersonalAccessClients->create($oauthPersonalAccessClientsData);

						if(!empty($oauthPersonalAccessClientsResult)){
							$username=$userDetailsData['email'];

							$client = new \GuzzleHttp\Client();
							try{
								$response = $client->request('POST', 'https://www.snaplava.com/live/public/api/v1/oauth/token', [
		                            'headers' => [
		                                'user-agent' => $_SERVER['HTTP_USER_AGENT'],
		                            ],
		                            'form_params' => [
		                                'grant_type' => 'personal_access', 
		                                'client_id'=> $oauthClientsResult->id, 
		                                'client_secret' => $oauthClientsData['secret'], 
		                                //'username'=>$username,
		                                'user_id'=>$oauthClientsData['user_id'],
		                                'scope'=>'*',
		                                'provider'=>'api'
		                            ]
		                        ]);

		                        $contents = json_decode($response->getBody(), true);

		                        $returnArr['status']=2;
		                        $returnArr['content']=$contents;
		                        $returnArr['message']="User is created successfully.";
							}
	                        catch (\GuzzleHttp\Exception\ClientException $e) {
				                $responsePre = $e->getResponse();
				                $response = json_decode($responsePre->getBody(), true);

				                $returnArr['status']=3;
				                $returnArr['content']=$response;
				                $returnArr['message']="Could not generate the user access token.";
				            }


						}else{
		                    $returnArr['status']=3;
		                    $returnArr['content']="";
		                    $returnArr['message']="User is not created successfully.";
		                }
                    }
				}else{

					// EMAIL IS NULL FROM TWITTER
					$userData['name']=isset($name) ? $name : NULL;
					$userData['email']=isset($email) ? $email : NULL;
					$userData['photo']=isset($photo) ? $photo : NULL;
					$userData=$this->user->create($userData);

					$userDetailsData['user_id']=$userData->id;
					$userDetailsData['social_id']=isset($id) ? $id : NULL;
					$userDetailsData['email']=isset($email) ? $email : NULL;
					$userDetailsData['photo']=isset($photo) ? $photo : NULL;
					$userDetailsData['login_type']='twitter';
					$userDetailsResult=$this->userDetails->create($userDetailsData);

					$oauthClientsData['user_id']=$userData->id;
					$oauthClientsData['name']="Personal Access Client";
					$oauthClientsData['secret']=isset($user->tokenSecret) ? $user->tokenSecret : NULL;
					$oauthClientsData['redirect']="https://www.snaplava.com/";
					$oauthClientsData['personal_access_client']=1;
					$oauthClientsData['password_client']=0;
					$oauthClientsData['revoked']=0;
					$oauthClientsResult=$this->oauthClients->create($oauthClientsData);

					$oauthPersonalAccessClientsData['client_id']=$oauthClientsResult->id;
					$oauthPersonalAccessClientsResult=$this->oauthPersonalAccessClients->create($oauthPersonalAccessClientsData);

					if(!empty($oauthPersonalAccessClientsResult)){
						$username=$userDetailsData['email'];

						$client = new \GuzzleHttp\Client();
						try{
							$response = $client->request('POST', 'https://www.snaplava.com/live/public/api/v1/oauth/token', [
	                            'headers' => [
	                                'user-agent' => $_SERVER['HTTP_USER_AGENT'],
	                            ],
	                            'form_params' => [
	                                'grant_type' => 'personal_access', 
	                                'client_id'=> $oauthClientsResult->id, 
	                                'client_secret' => $oauthClientsData['secret'], 
	                                //'username'=>$username,
	                                'user_id'=>$oauthClientsData['user_id'],
	                                'scope'=>'*',
	                                'provider'=>'api'
	                            ]
	                        ]);

	                        $contents = json_decode($response->getBody(), true);

	                        $returnArr['status']=2;
	                        $returnArr['content']=$contents;
	                        $returnArr['message']="User is created successfully.";
						}
						catch (\GuzzleHttp\Exception\ClientException $e) {
			                $responsePre = $e->getResponse();
			                $response = json_decode($responsePre->getBody(), true);

			                $returnArr['status']=3;
			                $returnArr['content']=$response;
			                $returnArr['message']="Could not generate the user access token.";
			            }

					}else{
	                    $returnArr['status']=3;
	                    $returnArr['content']="";
	                    $returnArr['message']="User is not created successfully.";
	                }

				}
	        }
	        
	        return $returnArr;
	    }


	    /**
	    * Handleing Android twitter login responses
	    **/
	    public function handleTwillerAndroidCallback(Request $request){
	    	$input=$request->all();

			if(empty($input)){
	        	$returnArr['status']=5;
	            $returnArr['content']="";
	            $returnArr['message']="Required data not found.";
	        }else{

	        	$id=isset($input['id']) ? $input['id'] : NULL;
				$name=isset($input['name']) ? $input['name'] : NULL;
				$first_name=isset($input['first_name']) ? $input['first_name'] : NULL;
				$last_name=isset($input['last_name']) ? $input['last_name'] : NULL;
				$email=isset($input['email']) ? $input['email'] : NULL;
				$photo=isset($input['photo']) ? $input['photo'] : NULL;
				//$access_token=isset($input['access_token']) ? $input['access_token'] : NULL;

				/* Note : noemail is the string sent from mobile app if user email is not retrived from social media site */
				if(isset($email) && $email!=NULL  && $email != "noemail"){
					$usersEmailCheckData=DB::table('users')
	                    ->select('users.id as user_id', 'users.name as user_name', 'users.email as user_email', 'users.photo as users_photo')
	                    ->where('users.email', '=', $email)
	                    ->first();
	                if($usersEmailCheckData){
	                	$checkUserData = DB::table('users')
	                    ->select('users.id as user_id', 'users.name as user_name', 'users.email as user_email', 'users.photo as users_photo', 'user_details.social_id as social_id', 'user_details.email as social_email', 'user_details.photo as social_photo', 'oauth_clients.id as client_id', 'oauth_clients.secret as client_secret')
	                    ->join('user_details', 'users.id', '=', 'user_details.user_id')
	                    ->join('oauth_clients', 'users.id', '=', 'oauth_clients.user_id')
	                    ->where('user_details.social_id', '=', $id)
	                    ->first();

		                if($checkUserData){

		                	$username=isset($checkUserData->user_email) ? $checkUserData->user_email : $checkUserData->social_email;
		                	$userPhoto=isset($checkUserData->users_photo) ? $checkUserData->users_photo : $checkUserData->social_photo;

			                $client = new \GuzzleHttp\Client();

			                try {
			                	$response = $client->request('POST', 'https://www.snaplava.com/live/public/api/v1/oauth/token', [
				                    'headers' => [
				                        'user-agent' => $_SERVER['HTTP_USER_AGENT'],
				                    ],
				                    'form_params' => [
				                        'grant_type' => 'personal_access', 
			                            'client_id'=> $checkUserData->client_id, 
			                            'client_secret' => $checkUserData->client_secret, 
			                            //'username'=>$username,
			                            'user_id'=>$checkUserData->user_id,
			                            'scope'=>'*',
			                            'provider'=>'api'
				                    ]
				                ]);

				                $contents = json_decode($response->getBody(), true);

				                $returnArr['status']=2;
				                $returnArr['content']=$contents;
				                $returnArr['message']="User loged in successfull.";
			                }
			                catch (\GuzzleHttp\Exception\ClientException $e) {
				                $responsePre = $e->getResponse();
				                $response = json_decode($responsePre->getBody(), true);

				                $returnArr['status']=3;
				                $returnArr['content']=$response;
				                $returnArr['message']="Could not generate the user access token.";
				            }

			                

		                }else{
		                	$userDetailsData['user_id']=$usersEmailCheckData->user_id;
							$userDetailsData['social_id']=isset($id) ? $id : NULL;
							$userDetailsData['email']=isset($email) ? $email : NULL;
							$userDetailsData['photo']=isset($photo) ? $photo : NULL;
							$userDetailsData['login_type']='twitter';
							$userDetailsResult=$this->userDetails->create($userDetailsData);

							$oauthClientsData['user_id']=$usersEmailCheckData->user_id;
							$oauthClientsData['name']="Personal Access Client";
							$oauthClientsData['secret']=isset($id) ? $id : NULL;
							$oauthClientsData['redirect']="https://www.snaplava.com/";
							$oauthClientsData['personal_access_client']=1;
							$oauthClientsData['password_client']=0;
							$oauthClientsData['revoked']=0;
							$oauthClientsResult=$this->oauthClients->create($oauthClientsData);

							$oauthPersonalAccessClientsData['client_id']=$oauthClientsResult->id;
							$oauthPersonalAccessClientsResult=$this->oauthPersonalAccessClients->create($oauthPersonalAccessClientsData);

							if(!empty($oauthPersonalAccessClientsResult)){
								$username=$userDetailsData['email'];

								$client = new \GuzzleHttp\Client();
								try{
									$response = $client->request('POST', 'https://www.snaplava.com/live/public/api/v1/oauth/token', [
			                            'headers' => [
			                                'user-agent' => $_SERVER['HTTP_USER_AGENT'],
			                            ],
			                            'form_params' => [
			                                'grant_type' => 'personal_access', 
			                                'client_id'=> $oauthClientsResult->id, 
			                                'client_secret' => $oauthClientsData['secret'], 
			                                //'username'=>$username,
			                                'user_id'=>$oauthClientsData['user_id'],
			                                'scope'=>'*',
			                                'provider'=>'api'
			                            ]
			                        ]);

			                        $contents = json_decode($response->getBody(), true);

			                        $returnArr['status']=2;
			                        $returnArr['content']=$contents;
			                        $returnArr['message']="User is created successfully.";
								}
								catch (\GuzzleHttp\Exception\ClientException $e) {
					                $responsePre = $e->getResponse();
					                $response = json_decode($responsePre->getBody(), true);

					                $returnArr['status']=3;
					                $returnArr['content']=$response;
					                $returnArr['message']="Could not generate the user access token.";
					            }

							}else{
			                    $returnArr['status']=3;
			                    $returnArr['content']="";
			                    $returnArr['message']="User is not created successfully.";
			                }
		                }
	                }else{

	                	$userData['name']=isset($name) ? $name : NULL;
	                	$userData['first_name']=isset($first_name) ? $first_name : NULL;
	                	$userData['last_name']=isset($last_name) ? $last_name : NULL;
						$userData['email']=isset($email) ? $email : NULL;
						$userData['photo']=isset($photo) ? $photo : NULL;
						$userData=$this->user->create($userData);

						$userDetailsData['user_id']=$userData->id;
						$userDetailsData['social_id']=isset($id) ? $id : NULL;
						$userDetailsData['email']=isset($email) ? $email : NULL;
						$userDetailsData['photo']=isset($photo) ? $photo : NULL;
						$userDetailsData['login_type']='twitter';
						$userDetailsResult=$this->userDetails->create($userDetailsData);

						$oauthClientsData['user_id']=$userData->id;
						$oauthClientsData['name']="Personal Access Client";
						$oauthClientsData['secret']=isset($id) ? $id : NULL;
						$oauthClientsData['redirect']="https://www.snaplava.com/";
						$oauthClientsData['personal_access_client']=1;
						$oauthClientsData['password_client']=0;
						$oauthClientsData['revoked']=0;
						$oauthClientsResult=$this->oauthClients->create($oauthClientsData);

						$oauthPersonalAccessClientsData['client_id']=$oauthClientsResult->id;
						$oauthPersonalAccessClientsResult=$this->oauthPersonalAccessClients->create($oauthPersonalAccessClientsData);

						if(!empty($oauthPersonalAccessClientsResult)){
							$username=$userDetailsData['email'];

							$client = new \GuzzleHttp\Client();
							try{
								$response = $client->request('POST', 'https://www.snaplava.com/live/public/api/v1/oauth/token', [
		                            'headers' => [
		                                'user-agent' => $_SERVER['HTTP_USER_AGENT'],
		                            ],
		                            'form_params' => [
		                                'grant_type' => 'personal_access', 
		                                'client_id'=> $oauthClientsResult->id, 
		                                'client_secret' => $oauthClientsData['secret'], 
		                                //'username'=>$username,
		                                'user_id'=>$oauthClientsData['user_id'],
		                                'scope'=>'*',
		                                'provider'=>'api'
		                            ]
		                        ]);

		                        $contents = json_decode($response->getBody(), true);

		                        $returnArr['status']=2;
		                        $returnArr['content']=$contents;
		                        $returnArr['message']="User is created successfully.";
							}
	                        catch (\GuzzleHttp\Exception\ClientException $e) {
				                $responsePre = $e->getResponse();
				                $response = json_decode($responsePre->getBody(), true);

				                $returnArr['status']=3;
				                $returnArr['content']=$response;
				                $returnArr['message']="Could not generate the user access token.";
				            }


						}else{
		                    $returnArr['status']=3;
		                    $returnArr['content']="";
		                    $returnArr['message']="User is not created successfully.";
		                }
	                }
				}else{

					// EMAIL IS NULL FROM TWITTER
					$userData['name']=isset($name) ? $name : NULL;
					$userData['first_name']=isset($first_name) ? $first_name : NULL;
					$userData['last_name']=isset($last_name) ? $last_name : NULL;
					$userData['email']=isset($email) ? $email : NULL;
					$userData['photo']=isset($photo) ? $photo : NULL;
					$userData=$this->user->create($userData);

					$userDetailsData['user_id']=$userData->id;
					$userDetailsData['social_id']=isset($id) ? $id : NULL;
					$userDetailsData['email']=isset($email) ? $email : NULL;
					$userDetailsData['photo']=isset($photo) ? $photo : NULL;
					$userDetailsData['login_type']='twitter';
					$userDetailsResult=$this->userDetails->create($userDetailsData);

					$oauthClientsData['user_id']=$userData->id;
					$oauthClientsData['name']="Personal Access Client";
					$oauthClientsData['secret']=isset($id) ? $id : NULL;
					$oauthClientsData['redirect']="https://www.snaplava.com/";
					$oauthClientsData['personal_access_client']=1;
					$oauthClientsData['password_client']=0;
					$oauthClientsData['revoked']=0;
					$oauthClientsResult=$this->oauthClients->create($oauthClientsData);

					$oauthPersonalAccessClientsData['client_id']=$oauthClientsResult->id;
					$oauthPersonalAccessClientsResult=$this->oauthPersonalAccessClients->create($oauthPersonalAccessClientsData);

					if(!empty($oauthPersonalAccessClientsResult)){
						$username=$userDetailsData['email'];

						$client = new \GuzzleHttp\Client();
						try{
							$response = $client->request('POST', 'https://www.snaplava.com/live/public/api/v1/oauth/token', [
	                            'headers' => [
	                                'user-agent' => $_SERVER['HTTP_USER_AGENT'],
	                            ],
	                            'form_params' => [
	                                'grant_type' => 'personal_access', 
	                                'client_id'=> $oauthClientsResult->id, 
	                                'client_secret' => $oauthClientsData['secret'], 
	                                //'username'=>$username,
	                                'user_id'=>$oauthClientsData['user_id'],
	                                'scope'=>'*',
	                                'provider'=>'api'
	                            ]
	                        ]);

	                        $contents = json_decode($response->getBody(), true);

	                        $returnArr['status']=2;
	                        $returnArr['content']=$contents;
	                        $returnArr['message']="User is created successfully.";
						}
						catch (\GuzzleHttp\Exception\ClientException $e) {
			                $responsePre = $e->getResponse();
			                $response = json_decode($responsePre->getBody(), true);

			                $returnArr['status']=3;
			                $returnArr['content']=$response;
			                $returnArr['message']="Could not generate the user access token.";
			            }

					}else{
	                    $returnArr['status']=3;
	                    $returnArr['content']="";
	                    $returnArr['message']="User is not created successfully.";
	                }

				}

			}

			return $returnArr;
	    }


	    public function redirectToFacebook()
	    {
	        return Socialite::driver('facebook')->stateless()->redirect();
	    }

	    public function handleFacebookCallback()
	    {
	        $user = Socialite::driver('facebook')->stateless()->user();

	        if(empty($user)){
	        	$returnArr['status']=3;
	            $returnArr['content']="";
	            $returnArr['message']="Could not fetch user data.";
	        }else{
	        	$id=$user->getId();
				$name=$user->getName();
				$email=$user->getEmail();
				$photo=$user->getAvatar();

				/*$returnArr['status']=2;
                $returnArr['content']=$user;
                $returnArr['message']="User loged in successfull.";
				return $returnArr; */               

				if(isset($email) && $email!=NULL){
					$usersEmailCheckData=DB::table('users')
                        ->select('users.id as user_id', 'users.name as user_name', 'users.email as user_email', 'users.photo as users_photo')
                        ->where('users.email', '=', $email)
                        ->first();
                    if($usersEmailCheckData){
                    	$checkUserData = DB::table('users')
                        ->select('users.id as user_id', 'users.name as user_name', 'users.email as user_email', 'users.photo as users_photo', 'user_details.social_id as social_id', 'user_details.email as social_email', 'user_details.photo as social_photo', 'oauth_clients.id as client_id', 'oauth_clients.secret as client_secret')
                        ->join('user_details', 'users.id', '=', 'user_details.user_id')
                        ->join('oauth_clients', 'users.id', '=', 'oauth_clients.user_id')
                        ->where('user_details.social_id', '=', $id)
                        ->first();
                		if($checkUserData){
                			$username=isset($checkUserData->user_email) ? $checkUserData->user_email : $checkUserData->social_email;
		                	$userPhoto=isset($checkUserData->users_photo) ? $checkUserData->users_photo : $checkUserData->social_photo;

		                	$client = new \GuzzleHttp\Client();
		                	try{
		                		$response = $client->request('POST', 'https://www.snaplava.com/live/public/api/v1/oauth/token', [
				                    'headers' => [
				                        'user-agent' => $_SERVER['HTTP_USER_AGENT'],
				                    ],
				                    'form_params' => [
				                        'grant_type' => 'personal_access', 
			                            'client_id'=> $checkUserData->client_id, 
			                            'client_secret' => $checkUserData->client_secret, 
			                            //'username'=>$username,
			                            'user_id'=>$checkUserData->user_id,
			                            'scope'=>'*',
			                            'provider'=>'api'
				                    ]
				                ]);

				                $contents = json_decode($response->getBody(), true);

				                $returnArr['status']=2;
				                $returnArr['content']=$contents;
				                $returnArr['message']="User loged in successfull.";
		                	}
		                	catch (\GuzzleHttp\Exception\ClientException $e) {
				                $responsePre = $e->getResponse();
				                $response = json_decode($responsePre->getBody(), true);

				                $returnArr['status']=3;
				                $returnArr['content']=$response;
				                $returnArr['message']="Could not generate the user access token.";
				            }
				            //haks
			                
                		}else{
                			$userDetailsData['user_id']=$usersEmailCheckData->user_id;
							$userDetailsData['social_id']=isset($id) ? $id : NULL;
							$userDetailsData['email']=isset($email) ? $email : NULL;
							$userDetailsData['photo']=isset($photo) ? $photo : NULL;
							$userDetailsData['login_type']="facebook";
							$userDetailsResult=$this->userDetails->create($userDetailsData);

							$oauthClientsData['user_id']=$usersEmailCheckData->user_id;
							$oauthClientsData['name']="Personal Access Client";
							$oauthClientsData['secret']=isset($user->token) ? $user->token : NULL;
							$oauthClientsData['redirect']="https://www.snaplava.com/";
							$oauthClientsData['personal_access_client']=1;
							$oauthClientsData['password_client']=0;
							$oauthClientsData['revoked']=0;
							$oauthClientsResult=$this->oauthClients->create($oauthClientsData);

							$oauthPersonalAccessClientsData['client_id']=$oauthClientsResult->id;
							$oauthPersonalAccessClientsResult=$this->oauthPersonalAccessClients->create($oauthPersonalAccessClientsData);

							if(!empty($oauthPersonalAccessClientsResult)){
								$username=isset($userDetailsData['email']) ? $userDetailsData['email'] : "";

								$client = new \GuzzleHttp\Client();
								try{
									$response = $client->request('POST', 'https://www.snaplava.com/live/public/api/v1/oauth/token', [
			                            'headers' => [
			                                'user-agent' => $_SERVER['HTTP_USER_AGENT'],
			                            ],
			                            'form_params' => [
			                                'grant_type' => 'personal_access', 
			                                'client_id'=> $oauthClientsResult->id, 
			                                'client_secret' => $oauthClientsData['secret'], 
			                                //'username'=>$username,
			                                'user_id'=>$oauthClientsData['user_id'],
			                                'scope'=>'*',
			                                'provider'=>'api'
			                            ]
			                        ]);

			                        $contents = json_decode($response->getBody(), true);

			                        $returnArr['status']=2;
			                        $returnArr['content']=$contents;
			                        $returnArr['message']="User is created successfully.";
								}
								catch (\GuzzleHttp\Exception\ClientException $e) {
					                $responsePre = $e->getResponse();
					                $response = json_decode($responsePre->getBody(), true);

					                $returnArr['status']=3;
					                $returnArr['content']=$response;
					                $returnArr['message']="Could not generate the user access token.";
					            }
		                        
							}else{
								$returnArr['status']=3;
			                    $returnArr['content']="";
			                    $returnArr['message']="User is not created successfully.";
							}
                		}
                    }else{
                    	$userData['name']=isset($name) ? $name : NULL;
						$userData['email']=isset($email) ? $email : NULL;
						$userData['photo']=isset($photo) ? $photo : NULL;

						$userData=$this->user->create($userData);

						$userDetailsData['user_id']=$userData->id;
						$userDetailsData['social_id']=isset($id) ? $id : NULL;
						$userDetailsData['email']=isset($email) ? $email : NULL;
						$userDetailsData['photo']=isset($photo) ? $photo : NULL;
						$userDetailsData['login_type']='facebook';
						$userDetailsResult=$this->userDetails->create($userDetailsData);

						$oauthClientsData['user_id']=$userData->id;
						$oauthClientsData['name']="Personal Access Client";
						$oauthClientsData['secret']=isset($user->token) ? $user->token : NULL;
						$oauthClientsData['redirect']="https://www.snaplava.com/";
						$oauthClientsData['personal_access_client']=1;
						$oauthClientsData['password_client']=0;
						$oauthClientsData['revoked']=0;
						$oauthClientsResult=$this->oauthClients->create($oauthClientsData);

						$oauthPersonalAccessClientsData['client_id']=$oauthClientsResult->id;
						$oauthPersonalAccessClientsResult=$this->oauthPersonalAccessClients->create($oauthPersonalAccessClientsData);

						if(!empty($oauthPersonalAccessClientsResult)){
							$username=$userDetailsData['email'];

							$client = new \GuzzleHttp\Client();
							try{
								$response = $client->request('POST', 'https://www.snaplava.com/live/public/api/v1/oauth/token', [
		                            'headers' => [
		                                'user-agent' => $_SERVER['HTTP_USER_AGENT'],
		                            ],
		                            'form_params' => [
		                                'grant_type' => 'personal_access', 
		                                'client_id'=> $oauthClientsResult->id, 
		                                'client_secret' => $oauthClientsData['secret'], 
		                                //'username'=>$username,
		                                'user_id'=>$oauthClientsData['user_id'],
		                                'scope'=>'*',
		                                'provider'=>'api'
		                            ]
		                        ]);

		                        $contents = json_decode($response->getBody(), true);

		                        $returnArr['status']=2;
		                        $returnArr['content']=$contents;
		                        $returnArr['message']="User is created successfully.";
							}
							catch (\GuzzleHttp\Exception\ClientException $e) {
				                $responsePre = $e->getResponse();
				                $response = json_decode($responsePre->getBody(), true);

				                $returnArr['status']=3;
				                $returnArr['content']=$response;
				                $returnArr['message']="Could not generate the user access token.";
				            }
	                        
						}else{
							$returnArr['status']=3;
		                    $returnArr['content']="";
		                    $returnArr['message']="User is not created successfully.";
						}
                    }
				}else{
					$userData['name']=isset($name) ? $name : NULL;
					$userData['email']=isset($email) ? $email : NULL;
					$userData['photo']=isset($photo) ? $photo : NULL;
					$userData=$this->user->create($userData);

					$userDetailsData['user_id']=$userData->id;
					$userDetailsData['social_id']=isset($id) ? $id : NULL;
					$userDetailsData['email']=isset($email) ? $email : NULL;
					$userDetailsData['photo']=isset($photo) ? $photo : NULL;
					$userDetailsData['login_type']='facebook';
					$userDetailsResult=$this->userDetails->create($userDetailsData);

					$oauthClientsData['user_id']=$userData->id;
					$oauthClientsData['name']="Personal Access Client";
					$oauthClientsData['secret']=isset($user->token) ? $user->token : NULL;
					$oauthClientsData['redirect']="https://www.snaplava.com/";
					$oauthClientsData['personal_access_client']=1;
					$oauthClientsData['password_client']=0;
					$oauthClientsData['revoked']=0;
					$oauthClientsResult=$this->oauthClients->create($oauthClientsData);

					$oauthPersonalAccessClientsData['client_id']=$oauthClientsResult->id;
					$oauthPersonalAccessClientsResult=$this->oauthPersonalAccessClients->create($oauthPersonalAccessClientsData);

					if(!empty($oauthPersonalAccessClientsResult)){
						$username=$userDetailsData['email'];

						$client = new \GuzzleHttp\Client();
						try{
							$response = $client->request('POST', 'https://www.snaplava.com/live/public/api/v1/oauth/token', [
	                            'headers' => [
	                                'user-agent' => $_SERVER['HTTP_USER_AGENT'],
	                            ],
	                            'form_params' => [
	                                'grant_type' => 'personal_access', 
	                                'client_id'=> $oauthClientsResult->id, 
	                                'client_secret' => $oauthClientsData['secret'], 
	                                //'username'=>$username,
	                                'user_id'=>$oauthClientsData['user_id'],
	                                'scope'=>'*',
	                                'provider'=>'api'
	                            ]
	                        ]);

	                        $contents = json_decode($response->getBody(), true);

	                        $returnArr['status']=2;
	                        $returnArr['content']=$contents;
	                        $returnArr['message']="User is created successfully.";
						}
						catch (\GuzzleHttp\Exception\ClientException $e) {
			                $responsePre = $e->getResponse();
			                $response = json_decode($responsePre->getBody(), true);

			                $returnArr['status']=3;
			                $returnArr['content']=$response;
			                $returnArr['message']="Could not generate the user access token.";
			            }
                        
					}else{
						$returnArr['status']=3;
	                    $returnArr['content']="";
	                    $returnArr['message']="User is not created successfully.";
					}
				}
			}

			return $returnArr;
	    }

	    /**
	    * Handleing Android facebook login responses
	    **/
	    public function handleFacebookAndroidCallback(Request $request){
	    	$input=$request->all();

			if(empty($input)){
	        	$returnArr['status']=5;
	            $returnArr['content']="";
	            $returnArr['message']="Required data not found.";
	        }else{

	        	$id=isset($input['id']) ? $input['id'] : NULL;
				$name=isset($input['name']) ? $input['name'] : NULL;
				$first_name=isset($input['first_name']) ? $input['first_name'] : NULL;
				$last_name=isset($input['last_name']) ? $input['last_name'] : NULL;
				$email=isset($input['email']) ? $input['email'] : NULL;
				$photo=isset($input['photo']) ? $input['photo'] : NULL;
				//$access_token=isset($input['access_token']) ? $input['access_token'] : NULL;

				/* Note : noemail is the string sent from mobile app if user email is not retrived from social media site */
				if(isset($email) && $email!=NULL && $email != "noemail"){
					$usersEmailCheckData=DB::table('users')
	                    ->select('users.id as user_id', 'users.name as user_name', 'users.email as user_email', 'users.photo as users_photo')
	                    ->where('users.email', '=', $email)
	                    ->first();
	                if($usersEmailCheckData){
	                	$checkUserData = DB::table('users')
	                    ->select('users.id as user_id', 'users.name as user_name', 'users.email as user_email', 'users.photo as users_photo', 'user_details.social_id as social_id', 'user_details.email as social_email', 'user_details.photo as social_photo', 'oauth_clients.id as client_id', 'oauth_clients.secret as client_secret')
	                    ->join('user_details', 'users.id', '=', 'user_details.user_id')
	                    ->join('oauth_clients', 'users.id', '=', 'oauth_clients.user_id')
	                    ->where('user_details.social_id', '=', $id)
	                    ->first();
	            		if($checkUserData){
	            			$username=isset($checkUserData->user_email) ? $checkUserData->user_email : $checkUserData->social_email;
		                	$userPhoto=isset($checkUserData->users_photo) ? $checkUserData->users_photo : $checkUserData->social_photo;

		                	$client = new \GuzzleHttp\Client();
		                	try{
		                		$response = $client->request('POST', 'https://www.snaplava.com/live/public/api/v1/oauth/token', [
				                    'headers' => [
				                        'user-agent' => $_SERVER['HTTP_USER_AGENT'],
				                    ],
				                    'form_params' => [
				                        'grant_type' => 'personal_access', 
			                            'client_id'=> $checkUserData->client_id, 
			                            'client_secret' => $checkUserData->client_secret, 
			                            //'username'=>$username,
			                            'user_id'=>$checkUserData->user_id,
			                            'scope'=>'*',
			                            'provider'=>'api'
				                    ]
				                ]);

				                $contents = json_decode($response->getBody(), true);

				                $returnArr['status']=2;
				                $returnArr['content']=$contents;
				                $returnArr['message']="User loged in successfull.";
		                	}
		                	catch (\GuzzleHttp\Exception\ClientException $e) {
				                $responsePre = $e->getResponse();
				                $response = json_decode($responsePre->getBody(), true);

				                $returnArr['status']=3;
				                $returnArr['content']=$response;
				                $returnArr['message']="Could not generate the user access token.";
				            }
			                
	            		}else{
	            			$userDetailsData['user_id']=$usersEmailCheckData->user_id;
							$userDetailsData['social_id']=isset($id) ? $id : NULL;
							$userDetailsData['email']=isset($email) ? $email : NULL;
							$userDetailsData['photo']=isset($photo) ? $photo : NULL;
							$userDetailsData['login_type']="facebook";
							$userDetailsResult=$this->userDetails->create($userDetailsData);

							$oauthClientsData['user_id']=$usersEmailCheckData->user_id;
							$oauthClientsData['name']="Personal Access Client";
							$oauthClientsData['secret']=isset($id) ? $id : NULL;
							$oauthClientsData['redirect']="https://www.snaplava.com/";
							$oauthClientsData['personal_access_client']=1;
							$oauthClientsData['password_client']=0;
							$oauthClientsData['revoked']=0;
							$oauthClientsResult=$this->oauthClients->create($oauthClientsData);

							$oauthPersonalAccessClientsData['client_id']=$oauthClientsResult->id;
							$oauthPersonalAccessClientsResult=$this->oauthPersonalAccessClients->create($oauthPersonalAccessClientsData);

							if(!empty($oauthPersonalAccessClientsResult)){
								$username=isset($userDetailsData['email']) ? $userDetailsData['email'] : "";

								$client = new \GuzzleHttp\Client();
								try{
									$response = $client->request('POST', 'https://www.snaplava.com/live/public/api/v1/oauth/token', [
			                            'headers' => [
			                                'user-agent' => $_SERVER['HTTP_USER_AGENT'],
			                            ],
			                            'form_params' => [
			                                'grant_type' => 'personal_access', 
			                                'client_id'=> $oauthClientsResult->id, 
			                                'client_secret' => $oauthClientsData['secret'], 
			                                //'username'=>$username,
			                                'user_id'=>$oauthClientsData['user_id'],
			                                'scope'=>'*',
			                                'provider'=>'api'
			                            ]
			                        ]);

			                        $contents = json_decode($response->getBody(), true);

			                        $returnArr['status']=2;
			                        $returnArr['content']=$contents;
			                        $returnArr['message']="User is created successfully.";
								}
								catch (\GuzzleHttp\Exception\ClientException $e) {
					                $responsePre = $e->getResponse();
					                $response = json_decode($responsePre->getBody(), true);

					                $returnArr['status']=3;
					                $returnArr['content']=$response;
					                $returnArr['message']="Could not generate the user access token.";
					            }
		                        
							}else{
								$returnArr['status']=3;
			                    $returnArr['content']="";
			                    $returnArr['message']="User is not created successfully.";
							}
	            		}
	                }else{
	                	$userData['name']=isset($name) ? $name : NULL;
	                	$userData['first_name']=isset($first_name) ? $first_name : NULL;
	                	$userData['last_name']=isset($last_name) ? $last_name : NULL;
						$userData['email']=isset($email) ? $email : NULL;
						$userData['photo']=isset($photo) ? $photo : NULL;

						$userData=$this->user->create($userData);

						$userDetailsData['user_id']=$userData->id;
						$userDetailsData['social_id']=isset($id) ? $id : NULL;
						$userDetailsData['email']=isset($email) ? $email : NULL;
						$userDetailsData['photo']=isset($photo) ? $photo : NULL;
						$userDetailsData['login_type']='facebook';
						$userDetailsResult=$this->userDetails->create($userDetailsData);

						$oauthClientsData['user_id']=$userData->id;
						$oauthClientsData['name']="Personal Access Client";
						$oauthClientsData['secret']=isset($id) ? $id : NULL;
						$oauthClientsData['redirect']="https://www.snaplava.com/";
						$oauthClientsData['personal_access_client']=1;
						$oauthClientsData['password_client']=0;
						$oauthClientsData['revoked']=0;
						$oauthClientsResult=$this->oauthClients->create($oauthClientsData);

						$oauthPersonalAccessClientsData['client_id']=$oauthClientsResult->id;
						$oauthPersonalAccessClientsResult=$this->oauthPersonalAccessClients->create($oauthPersonalAccessClientsData);

						if(!empty($oauthPersonalAccessClientsResult)){
							$username=$userDetailsData['email'];

							$client = new \GuzzleHttp\Client();
							try{
								$response = $client->request('POST', 'https://www.snaplava.com/live/public/api/v1/oauth/token', [
		                            'headers' => [
		                                'user-agent' => $_SERVER['HTTP_USER_AGENT'],
		                            ],
		                            'form_params' => [
		                                'grant_type' => 'personal_access', 
		                                'client_id'=> $oauthClientsResult->id, 
		                                'client_secret' => $oauthClientsData['secret'], 
		                                //'username'=>$username,
		                                'user_id'=>$oauthClientsData['user_id'],
		                                'scope'=>'*',
		                                'provider'=>'api'
		                            ]
		                        ]);

		                        $contents = json_decode($response->getBody(), true);

		                        $returnArr['status']=2;
		                        $returnArr['content']=$contents;
		                        $returnArr['message']="User is created successfully.";
							}
							catch (\GuzzleHttp\Exception\ClientException $e) {
				                $responsePre = $e->getResponse();
				                $response = json_decode($responsePre->getBody(), true);

				                $returnArr['status']=3;
				                $returnArr['content']=$response;
				                $returnArr['message']="Could not generate the user access token.";
				            }
	                        
						}else{
							$returnArr['status']=3;
		                    $returnArr['content']="";
		                    $returnArr['message']="User is not created successfully.";
						}
	                }
				}else{
					$userData['name']=isset($name) ? $name : NULL;
					$userData['first_name']=isset($first_name) ? $first_name : NULL;
	                $userData['last_name']=isset($last_name) ? $last_name : NULL;
					$userData['email']=isset($email) ? $email : NULL;
					$userData['photo']=isset($photo) ? $photo : NULL;
					$userData=$this->user->create($userData);

					$userDetailsData['user_id']=$userData->id;
					$userDetailsData['social_id']=isset($id) ? $id : NULL;
					$userDetailsData['email']=isset($email) ? $email : NULL;
					$userDetailsData['photo']=isset($photo) ? $photo : NULL;
					$userDetailsData['login_type']='facebook';
					$userDetailsResult=$this->userDetails->create($userDetailsData);

					$oauthClientsData['user_id']=$userData->id;
					$oauthClientsData['name']="Personal Access Client";
					$oauthClientsData['secret']=isset($id) ? $id : NULL;
					$oauthClientsData['redirect']="https://www.snaplava.com/";
					$oauthClientsData['personal_access_client']=1;
					$oauthClientsData['password_client']=0;
					$oauthClientsData['revoked']=0;
					$oauthClientsResult=$this->oauthClients->create($oauthClientsData);

					$oauthPersonalAccessClientsData['client_id']=$oauthClientsResult->id;
					$oauthPersonalAccessClientsResult=$this->oauthPersonalAccessClients->create($oauthPersonalAccessClientsData);

					if(!empty($oauthPersonalAccessClientsResult)){
						$username=$userDetailsData['email'];

						$client = new \GuzzleHttp\Client();
						try{
							$response = $client->request('POST', 'https://www.snaplava.com/live/public/api/v1/oauth/token', [
	                            'headers' => [
	                                'user-agent' => $_SERVER['HTTP_USER_AGENT'],
	                            ],
	                            'form_params' => [
	                                'grant_type' => 'personal_access', 
	                                'client_id'=> $oauthClientsResult->id, 
	                                'client_secret' => $oauthClientsData['secret'], 
	                                //'username'=>$username,
	                                'user_id'=>$oauthClientsData['user_id'],
	                                'scope'=>'*',
	                                'provider'=>'api'
	                            ]
	                        ]);

	                        $contents = json_decode($response->getBody(), true);

	                        $returnArr['status']=2;
	                        $returnArr['content']=$contents;
	                        $returnArr['message']="User is created successfully.";
						}
						catch (\GuzzleHttp\Exception\ClientException $e) {
			                $responsePre = $e->getResponse();
			                $response = json_decode($responsePre->getBody(), true);

			                $returnArr['status']=3;
			                $returnArr['content']=$response;
			                $returnArr['message']="Could not generate the user access token.";
			            }
	                    
					}else{
						$returnArr['status']=3;
	                    $returnArr['content']="";
	                    $returnArr['message']="User is not created successfully.";
					}
				}

			}
			return $returnArr;
	    }
	}
?>