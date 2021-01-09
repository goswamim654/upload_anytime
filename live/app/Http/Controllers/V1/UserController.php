<?php

namespace App\Http\Controllers\V1;

use Illuminate\Support\Facades\Input;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Dingo\Api\Routing\Helpers;
use Illuminate\Http\Request;
use Image;
use DB;

class UserController extends Controller
{

    use Helpers;

    //protected $userRepository;
    protected $userTransformer;


    //public function __construct(\App\Repository\UsersRepository $userRepository, \App\Transformer\UserTransformer $userTransformer){
    public function __construct(\App\User $user, \App\UserDetails $userDetails, \App\UserImages $userImages, \App\ResetPassword $resetPassword, \App\UserFollowers $userFollowers, \App\Transformer\UserTransformer $userTransformer, \App\Transformer\UserImagesTransformer $userImagesTransformer){
    	//$this->userRepository = $userRepository;
        $this->user = $user;
        $this->userDetails = $userDetails;
        $this->userImages = $userImages;
    	$this->resetPassword = $resetPassword;
        $this->userFollowers = $userFollowers;
        $this->userTransformer = $userTransformer;
    	$this->userImagesTransformer = $userImagesTransformer;
    }

    /**
    * GET Users Details 
    **/
    public function getUserProfileInfo(Request $request){
        $input=$request->all();

        $currentUser = \Auth::user();
        if(!isset($currentUser->id) || $currentUser->id==""){
            $returnArr['status']=1;
            $returnArr['content']="";
            $returnArr['message']="Could not found the user.";
            return $returnArr;
        }

        $logedInUser=$currentUser->id;
        $userIdOrSlug=$logedInUser;
        if(isset($input['user_id']) && $input['user_id']!=""){
            $userIdOrSlug=$input['user_id'];
        }

       

        $checkUserExistance=$this->user->where('id', $userIdOrSlug)->orwhere('slug', $userIdOrSlug)->first();
        if (!$checkUserExistance) {
            $returnArr['status']=4;
            $returnArr['content']="";
            $returnArr['message']="The User's profile your requesting does not exist.";
            return $returnArr;
        }

        $userId=$checkUserExistance->id;
        
        $resultData = $this->user->leftJoin('user_followers as is_following_check', function ($join) use ($logedInUser) {
            $join->on('users.id', '=', 'is_following_check.following_user_id')
            ->where('is_following_check.follower_user_id', $logedInUser);
        })
        //->leftJoin('user_followers as user_is_following', 'users.id', '=', 'user_is_following.follower_user_id')
        ->leftJoin('user_rating_views', 'users.id', '=', 'user_rating_views.user_id')
        ->leftJoin('user_images', function($join){
            $join->on('users.id', '=', 'user_images.user_id')
            ->where('user_images.status', '1');
        })
        ->where('users.id', $userIdOrSlug)
        ->orwhere('users.slug', $userIdOrSlug)
        ->select('users.id as id', 'users.name as name', 'users.photo as user_profile_photo', 'users.first_name as first_name', 'users.last_name as last_name', 'users.email as email', 'users.location as location', 'users.contact_number as contact_number', 'users.what_best_describes_you as what_best_describes_you', 'users.skills as skills', 'users.is_available_for_paid_photography as is_available_for_paid_photography', 'users.about_yourself as about_yourself', 'users.circle_photo as user_circle_photo', 'users.is_profile_completed as is_profile_completed', 'users.city as city', 'users.state as state', 'users.country as country', 'users.postal_code as postal_code', 'users.created_at as created_at', 'users.updated_at as updated_at', 'users.total_followers as total_followers', DB::raw('(SELECT COUNT(user_followers.id) from user_followers where user_followers.follower_user_id='.$userId.') as total_followings'), 'user_rating_views.average_rating as user_rating', 'user_rating_views.total_number_of_photos as total_number_of_rated_photos', DB::raw('(CASE WHEN is_following_check.follower_user_id = '. $logedInUser .' THEN 1 ELSE 0 END) as is_following'), DB::raw('COUNT(user_images.id) as total_snaps'))
        ->first();


        $dataArray=$resultData->toArray();
        if($dataArray){
            //$userPopularPhotos=$this->getUserPopularPhotosInternel($resultData->id, 15);
             $isCurrentloggedInUser=0;
            if($dataArray['id']==$logedInUser)
                $isCurrentloggedInUser=1;
            $response=[
                'data' => $dataArray,
                'is_current_logged_user' => $isCurrentloggedInUser
            ];

            $returnArr['status']=2;
            $returnArr['content']=$response;
            $returnArr['message']="Data fetched successfully.";
        }else{
            $returnArr['status']=3;
            $returnArr['content']="";
            $returnArr['message']="Something went wrong! could fetched the data.";
        }

        return $returnArr;

    }

    /**
    * Get Users Popular photos Internel Call
    **/    
    private function getUserPopularPhotosInternel($userId=NULL, $pagination_limit=NULL){

        $returnArr=array();
        $currentUser = \Auth::user();
        if(!isset($currentUser->id) || $currentUser->id==""){
            /*$returnArr['status']=1;
            $returnArr['content']="";
            $returnArr['message']="Could not found the user.";*/
            return $returnArr;
        }
        
        $paginationLimit=20;
        if(isset($pagination_limit) && $pagination_limit!=""){
            $paginationLimit=$pagination_limit;
        }

        $logedInUser=$currentUser->id;

        if(isset($userId) && $userId!=""){

            $query = $this->userImages->query();
            $query=$query->join('users', 'user_images.user_id', '=', 'users.id')
            //->join('user_details', 'user_images.user_id', '=', 'user_details.user_id')
            ->leftJoin('image_ratings', function ($join) use ($logedInUser) {
                $join->on('user_images.id', '=', 'image_ratings.image_id')
                ->where('image_ratings.user_id', $logedInUser);
            })
            ->leftJoin('image_likes', function ($join) use ($logedInUser) {
                $join->on('user_images.id', '=', 'image_likes.image_id')
                ->where('image_likes.user_id', $logedInUser);
            })
            ->leftJoin('user_followers', function ($join) use ($logedInUser) {
                $join->on('user_images.user_id', '=', 'user_followers.following_user_id')
                ->where('user_followers.follower_user_id', $logedInUser);
            })
            ->leftJoin('user_rating_views', 'users.id', '=', 'user_rating_views.user_id')
            ->leftJoin('image_rating_views', 'user_images.id', '=', 'image_rating_views.image_id')
            ->where('user_images.status', '1')
            ->where('users.id', $userId);

            $query=$query->orderBy('image_rating_views.average_rating', 'desc')
            ->orderBy('user_images.id', 'desc')
            ->select('users.name as user_name', 'users.photo as user_profile_photo', 'users.total_followers as total_followers', 'users.location as user_location', 'users.what_best_describes_you as user_what_best_describes_you', 'users.is_available_for_paid_photography as user_is_available_for_paid_photography', 'user_rating_views.average_rating as user_rating', 'user_rating_views.total_number_of_photos as total_number_of_rated_photos', 'image_rating_views.average_rating as photo_rating', 'image_rating_views.total_number_of_users as total_number_of_rated_users', 'image_ratings.content_composition as content_composition_rating', 'image_ratings.image_quality as image_quality_rating', 'image_ratings.professionalism as professionalism_rating', 'image_ratings.excellent as excellent_rating', 'image_ratings.world_class as world_class_rating', 'image_likes.status as is_liked', DB::raw('(CASE WHEN user_followers.follower_user_id = '. $logedInUser .' THEN 1 ELSE 0 END) as is_following'), 'user_images.*');

            $imageData = $query->paginate($paginationLimit);
            $dataArray=$imageData->toArray();
            if($dataArray['data']){
                $response=[
                    'data' => $dataArray['data'],
                    'total' => $dataArray['total'],
                    'limit' => $dataArray['per_page'],
                    'pagination' => [
                        'next_page' => $dataArray['next_page_url'],
                        'prev_page' => $dataArray['prev_page_url'],
                        'current_page' => $dataArray['current_page'],
                        'first_page' => $dataArray['first_page_url'],
                        'last_page' => $dataArray['last_page_url']
                    ]
                ];

                /*$returnArr['status']=2;
                $returnArr['content']=$response;
                $returnArr['message']="Data fetched successfully.";*/
                $returnArr=$dataArray['data'];
            }else{
                /*$returnArr['status']=4;
                $returnArr['content']="";
                $returnArr['message']="No data found.";*/
            }
            
        }else{
            /*returnArr['status']=5;
            $returnArr['content']="";
            $returnArr['message']="Required data not found.";*/
        }
        
        return $returnArr;
    }



    /**
    * GET Top rated Users 
    **/
    public function getTopRatedUsers(Request $request){
        $input=$request->all();

        $currentUser = \Auth::user();
        if(!isset($currentUser->id) || $currentUser->id==""){
            $returnArr['status']=1;
            $returnArr['content']="";
            $returnArr['message']="Could not found the user.";
            return $returnArr;
        }
        
        $paginationLimit=20;
        if(isset($input['pagination_limit']) && $input['pagination_limit']!=""){
            $paginationLimit=$input['pagination_limit'];
        }

        $logedInUser=$currentUser->id;

        $query = $this->user->leftJoin('user_followers', function ($join) use ($logedInUser) {
            $join->on('users.id', '=', 'user_followers.following_user_id')
            ->where('user_followers.follower_user_id', $logedInUser);
        })
        ->leftJoin('user_rating_views', 'users.id', '=', 'user_rating_views.user_id')
        ->orderBy('user_rating_views.average_rating', 'desc')
        ->orderBy('users.id', 'desc')
        ->select('users.id as id', 'users.slug as slug', 'users.name as name', 'users.photo as user_profile_photo', 'users.first_name as first_name', 'users.last_name as last_name', 'users.email as email', 'users.location as location', 'users.contact_number as contact_number', 'users.what_best_describes_you as what_best_describes_you', 'users.skills as skills', 'users.is_available_for_paid_photography as is_available_for_paid_photography', 'users.about_yourself as about_yourself', 'users.circle_photo as user_circle_photo', 'users.created_at as created_at', 'users.updated_at as updated_at', 'users.total_followers as total_followers', 'user_rating_views.average_rating as user_rating', 'user_rating_views.total_number_of_photos as total_number_of_rated_photos', DB::raw('(CASE WHEN user_followers.follower_user_id = '. $logedInUser .' THEN 1 ELSE 0 END) as is_following'))
        ->paginate($paginationLimit);

        //$imageData = $query
        $dataArray=$query->toArray();
        if($dataArray['data']){
            $response=[
                'data' => $dataArray['data'],
                'total' => $dataArray['total'],
                'limit' => $dataArray['per_page'],
                'pagination' => [
                    'next_page' => $dataArray['next_page_url'],
                    'prev_page' => $dataArray['prev_page_url'],
                    'current_page' => $dataArray['current_page'],
                    'first_page' => $dataArray['first_page_url'],
                    'last_page' => $dataArray['last_page_url']
                ]
            ];

            $returnArr['status']=2;
            $returnArr['content']=$response;
            $returnArr['message']="Data fetched successfully.";
        }else{
            $returnArr['status']=4;
            $returnArr['content']="";
            $returnArr['message']="No data found.";
        }
        
        return $returnArr;
    }

    /**
    * GET users Followers 
    **/
    public function getUserFollowers(Request $request){
        $input=$request->all();

        $currentUser = \Auth::user();
        if(!isset($currentUser->id) || $currentUser->id==""){
            $returnArr['status']=1;
            $returnArr['content']="";
            $returnArr['message']="Could not found the user.";
            return $returnArr;
        }
        
        $paginationLimit=20;
        if(isset($input['pagination_limit']) && $input['pagination_limit']!=""){
            $paginationLimit=$input['pagination_limit'];
        }

        $logedInUser=$currentUser->id;

        if(isset($input['user_id']) && $input['user_id']!=""){
            $userId=$input['user_id'];
            $query = $this->userFollowers->query();
            $query=$query->leftJoin('users', function ($join) use ($userId) {
                $join->on('user_followers.follower_user_id', '=', 'users.id');
                //->where('user_followers.following_user_id', $userId);
            })
            ->leftJoin('user_rating_views', 'users.id', '=', 'user_rating_views.user_id')
            ->where('user_followers.following_user_id', $userId);
            $query=$query->orderBy('user_rating_views.average_rating', 'desc')
            ->select('users.id as id', 'users.slug as slug', 'users.name as name', 'users.photo as user_profile_photo', 'users.first_name as first_name', 'users.last_name as last_name', 'users.email as email', 'users.location as location', 'users.contact_number as contact_number', 'users.what_best_describes_you as what_best_describes_you', 'users.skills as skills', 'users.is_available_for_paid_photography as is_available_for_paid_photography', 'users.about_yourself as about_yourself', 'users.circle_photo as user_circle_photo', 'users.created_at as created_at', 'users.updated_at as updated_at', 'users.total_followers as total_followers', 'user_rating_views.average_rating as user_rating', 'user_rating_views.total_number_of_photos as total_number_of_rated_photos', DB::raw('(CASE WHEN user_followers.follower_user_id = '. $logedInUser .' THEN 1 ELSE 0 END) as is_following'));

            $imageData = $query->paginate($paginationLimit);
            $dataArray=$imageData->toArray();
            if($dataArray['data']){
                $response=[
                    'data' => $dataArray['data'],
                    'total' => $dataArray['total'],
                    'limit' => $dataArray['per_page'],
                    'pagination' => [
                        'next_page' => $dataArray['next_page_url'],
                        'prev_page' => $dataArray['prev_page_url'],
                        'current_page' => $dataArray['current_page'],
                        'first_page' => $dataArray['first_page_url'],
                        'last_page' => $dataArray['last_page_url']
                    ]
                ];

                $returnArr['status']=2;
                $returnArr['content']=$response;
                $returnArr['message']="Data fetched successfully.";
            }else{
                $returnArr['status']=4;
                $returnArr['content']="";
                $returnArr['message']="No data found.";
            }
        }else{
            $returnArr['status']=5;
            $returnArr['content']="";
            $returnArr['message']="Required data not found.";
        }
        
        return $returnArr;
    }

    /**
    * GET users Followings 
    **/
    public function getUserFollowings(Request $request){
        $input=$request->all();

        $currentUser = \Auth::user();
        if(!isset($currentUser->id) || $currentUser->id==""){
            $returnArr['status']=1;
            $returnArr['content']="";
            $returnArr['message']="Could not found the user.";
            return $returnArr;
        }
        
        $paginationLimit=20;
        if(isset($input['pagination_limit']) && $input['pagination_limit']!=""){
            $paginationLimit=$input['pagination_limit'];
        }

        $logedInUser=$currentUser->id;

        if(isset($input['user_id']) && $input['user_id']!=""){
            $userId=$input['user_id'];
            $query = $this->userFollowers->query();
            $query=$query->leftJoin('users', function ($join) use ($userId) {
                $join->on('user_followers.following_user_id', '=', 'users.id');
                //->where('user_followers.following_user_id', $userId);
            })
            ->leftJoin('user_rating_views', 'users.id', '=', 'user_rating_views.user_id')
            ->where('user_followers.follower_user_id', $userId);
            $query=$query->orderBy('user_rating_views.average_rating', 'desc')
            ->select('users.id as id', 'users.slug as slug', 'users.name as name', 'users.photo as user_profile_photo', 'users.first_name as first_name', 'users.last_name as last_name', 'users.email as email', 'users.location as location', 'users.contact_number as contact_number', 'users.what_best_describes_you as what_best_describes_you', 'users.skills as skills', 'users.is_available_for_paid_photography as is_available_for_paid_photography', 'users.about_yourself as about_yourself', 'users.circle_photo as user_circle_photo', 'users.created_at as created_at', 'users.updated_at as updated_at', 'users.total_followers as total_followers', 'user_rating_views.average_rating as user_rating', 'user_rating_views.total_number_of_photos as total_number_of_rated_photos', DB::raw('(CASE WHEN user_followers.follower_user_id = '. $logedInUser .' THEN 1 ELSE 0 END) as is_following'));

            $imageData = $query->paginate($paginationLimit);
            $dataArray=$imageData->toArray();
            if($dataArray['data']){
                $response=[
                    'data' => $dataArray['data'],
                    'total' => $dataArray['total'],
                    'limit' => $dataArray['per_page'],
                    'pagination' => [
                        'next_page' => $dataArray['next_page_url'],
                        'prev_page' => $dataArray['prev_page_url'],
                        'current_page' => $dataArray['current_page'],
                        'first_page' => $dataArray['first_page_url'],
                        'last_page' => $dataArray['last_page_url']
                    ]
                ];

                $returnArr['status']=2;
                $returnArr['content']=$response;
                $returnArr['message']="Data fetched successfully.";
            }else{
                $returnArr['status']=4;
                $returnArr['content']="";
                $returnArr['message']="No data found.";
            }
        }else{
            $returnArr['status']=5;
            $returnArr['content']="";
            $returnArr['message']="Required data not found.";
        }
        
        return $returnArr;
    }


    /**
    * reset password 
    **/
    public function resetPassword(Request $request){
        $input=$request->all();

        $validationRules=[
            'password' => 'required|confirmed|min:6'
        ];
        $validator= \Validator::make($input, $validationRules);
        if($validator->fails()){
            $returnArr['status']=1;
            $returnArr['content']=$validator->errors();
            $returnArr['message']="Validation failed.";
            return $returnArr;
        }

        if(isset($input['token']) && $input['token']!=""){
            $tokenData=$this->resetPassword->where('token', $input['token'])->first();
            if($tokenData == null){
                $glodabMsg['token']="The link you are using is either invalid or expired. Please request a new reset password link.";
                $returnArr['status']=1;
                $returnArr['content']=$glodabMsg;
                $returnArr['message']="Token not provided or not valid";
                return $returnArr;
            }

            $updateData['password']=Hash::make($input['password'], ['rounds' => 15]);
            $updres=$this->user->where('id', $tokenData->user_id)->update($updateData);
            if($updres==true){
                $deleteResult=$this->resetPassword->where('email', $tokenData->email)->delete();
                $returnArr['status']=2;
                $returnArr['content']="";
                $returnArr['message']="New password is set successfully.";
                
            }else{
                $returnArr['status']=3;
                $returnArr['content']="";
                $returnArr['message']="Something went wrong! could not set the new password.";
                
            }
        }else{
            $glodabMsg['token']="The link you are using is either invalid or expired. Please request a new reset password link.";
            $returnArr['status']=1;
            $returnArr['content']=$glodabMsg;
            $returnArr['message']="Token not provided or not valid";
        }
        return $returnArr;
    }

    /**
    * Sending reset password link to user
    **/
    public function sendResetPasswordLink(Request $request){
        $input=$request->all();

        $validationRules=[
            'email' => 'required|email',
        ];
        $validator= \Validator::make($input, $validationRules);
        if($validator->fails()){
            $returnArr['status']=1;
            $returnArr['content']=$validator->errors();
            $returnArr['message']="Validation failed.";
            return $returnArr;
        }

        $getUserData=$this->user->where('email', $input['email'])->first();

        if($getUserData == null){
            $sendMessage['email']="This email does not exist in our system.";
            $returnArr['status']=1;
            $returnArr['content']=$sendMessage;
            $returnArr['message']="Validation failed.";
            return $returnArr;
        }


        $result=$this->resetPassword->where('email', $input['email'])->delete();

        $length=rand(20,30);
        $token = bin2hex(random_bytes($length));
        
        $resetPasswordData['user_id']=isset($getUserData->id) ? $getUserData->id : NULL;
        $resetPasswordData['email']=$input['email'];
        $resetPasswordData['token']=$token;
        $restPasswordResult=$this->resetPassword->create($resetPasswordData);    

        if($restPasswordResult){
            $passwordResetLink="https://www.snaplava.com/reset-password?token=".$token;

            $data['from']="team@snaplava.com";
            $data['to']=$input['email'];
            $data['subject']="Password reset Link Snaplava.";
            $data['content']="You can reset your password on this link :- ".$passwordResetLink."";
            Mail::raw($data['content'],function($message) use ($data) {
                $message->from($data['from']);
                $message->to($data['to']);
                $message->subject($data['subject']);
                $message->setBody($data['content'], 'text/html');
            }); 

            $returnArr['status']=2;
            $returnArr['content']="Password reset link has been sent to your mail, Please check your mail.";
            $returnArr['message']="Reset password link sent successfully.";

        }else{
            $returnArr['status']=3;
            $returnArr['content']="";
            $returnArr['message']="Something went wrong could not generate and send the reset password link.";
        }
        return $returnArr;
    }


    /**
    * Change user password
    **/
    public function changePassword(Request $request){
        $input=$request->all();

        $currentUser = \Auth::user();
        if(!isset($currentUser->id) || $currentUser->id==""){
            $returnArr['status']=1;
            $returnArr['content']="";
            $returnArr['message']="Could not found the user.";
            return $returnArr;
        }

        $validationRules=[
            'current_password' => 'required',
            'password' => 'required|confirmed|min:6'
        ];
        $validator= \Validator::make($input, $validationRules);
        if($validator->fails()){
            $returnArr['status']=1;
            $returnArr['content']=$validator->errors();
            $returnArr['message']="Validation failed.";
            return $returnArr;
        }

        $currentUserData=$this->user->find($currentUser->id);
        if (!Hash::check($input['current_password'], $currentUserData->password)){
            $createMessage['current_password']="The current password is incorrect.";
            $returnArr['status']=1;
            $returnArr['content']=$createMessage;
            $returnArr['message']="Validation failed.";
            return $returnArr;
        }else{

            $updateData['password']=Hash::make($input['password'], ['rounds' => 15]);
            $updres=$this->user->where('id', $currentUser->id)->update($updateData);
            if($updres==true){

                $getUserDetailsTableData=$this->userDetails->where('user_id', $currentUser->id)->where('login_type', 'password')->first();
                if($getUserDetailsTableData == null){
                    $userDetailsData['user_id']=$currentUser->id;
                    $userDetailsData['email']=isset($currentUserData->email) ? $currentUserData->email : NULL;
                    $userDetailsData['photo']=isset($currentUserData->photo) ? $currentUserData->photo : NULL;
                    $userDetailsData['login_type']='password';
                    $userDetailsResult=$this->userDetails->create($userDetailsData);
                }

                $returnArr['status']=2;
                $returnArr['content']=$getUserDetailsTableData;
                $returnArr['message']="Password is changed successfully.";
                return $returnArr;
            }else{
                $returnArr['status']=3;
                $returnArr['content']="";
                $returnArr['message']="Something went wrong! could not changed the password.";
                return $returnArr;
            }
            
        }
    }


    /**
    * Uploading user profile's Square image
    **/
    public function uploadProfileSquareImage(Request $request){
        $input=$request->all();

        $currentUser = \Auth::user();
        if(!isset($currentUser->id) || $currentUser->id==""){
            $returnArr['status']=1;
            $returnArr['content']="";
            $returnArr['message']="Could not found the user.";
            return $returnArr;
        }

        $validationRules=[
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:20000'
        ];
        $validator= \Validator::make($input, $validationRules);
        if($validator->fails()){
            $result['status']=1;
            $result['content']=$validator->errors();
            $result['message']="Validation failed.";
            return $result;
        }
        //$uploadDir=__DIR__."/../../../../files/";
        $micoTime=preg_replace('/(0)\.(\d+) (\d+)/', '$3$1$2', microtime());

        $imageName = $micoTime.'.'.$request->image->getClientOriginalExtension();

        $photo = $request->file('image');

        $destinationPath = public_path('user_profile_upload/square/');
        //$destinationPath = public_path('original_upload/');
        $uploadRes=$photo->move($destinationPath, $imageName);
        

        //$uploadRes=$request->image->move($uploadDir, $imageName);
        if($uploadRes){
            $updateData['photo']="https://www.snaplava.com/live/public/user_profile_upload/square/".$imageName;
            $updres=$this->user->where('id', $currentUser->id)->update($updateData);
            if($updres){
                $updatedData=$this->user->find($currentUser->id);
                $returnArr['status']=2;
                $returnArr['content']=$updatedData;
                $returnArr['message']="Image uploaded successfully.";
            }else{
                $returnArr['status']=3;
                $returnArr['content']="";
                $returnArr['message']="Could not upload the image.";
            }
        }else{
            $returnArr['status']=3;
            $returnArr['content']="";
            $returnArr['message']="Could not upload the image.";
        }

        return $returnArr;
    }



    /**
    * User profile Update
    **/
    public function userProfileUpdate(Request $request){
        $input=$request->all();

        $currentUser = \Auth::user();
        if(!isset($currentUser->id) || $currentUser->id==""){
            $returnArr['status']=1;
            $returnArr['content']="";
            $returnArr['message']="Could not found the user.";
            return $returnArr;
        }

        $validationRules=[
            'userFirstName' => 'required',
            'userLastName' => 'required',
            'userLocation' => 'required',
            'isUserAvailableForPaid' => 'required',
            'profilePhoto' => 'required',
            //'base64_circle_image' => 'required|min:12',
        ];
        $validator= \Validator::make($input, $validationRules);
        if($validator->fails()){
            $returnArr['status']=1;
            $returnArr['content']=$validator->errors();
            $returnArr['message']="Validation failed.";
            return $returnArr;
        }


        if($input['profilePhoto']!=2){
            $micoTime=preg_replace('/(0)\.(\d+) (\d+)/', '$3$1$2', microtime());
            //$imageName = $micoTime.'.'.$request->base64_image->getClientOriginalExtension();
            $imageName = $micoTime.'.png';
            $photo = $input['base64_circle_image'];
            $destinationPath = public_path('user_profile_upload/circle/');
            Image::make(file_get_contents($input['base64_circle_image']))->save($destinationPath."/".$imageName);
        }
         


        $whatBestDescribesUser=NULL;
        if(isset($input['whatBestDescribesUser']) && !empty($input['whatBestDescribesUser'])){
            $whatBestDescribesUser=implode(",",$input['whatBestDescribesUser']);
        }
        $userSkills=NULL;
        if(isset($input['userSkills']) && !empty($input['userSkills'])){
            $userSkills=implode(",",$input['userSkills']);
        }

        $updateData['first_name']=isset($input['userFirstName'])? $input['userFirstName'] : NULL;
        $updateData['last_name']=isset($input['userLastName'])? $input['userLastName'] : NULL;
        $updateData['location']=isset($input['userLocation'])? $input['userLocation'] : NULL;
        $updateData['contact_number']=isset($input['userContactNo'])? $input['userContactNo'] : NULL;
        $updateData['what_best_describes_you']=$whatBestDescribesUser;
        $updateData['skills']=$userSkills;
        $updateData['is_available_for_paid_photography']=isset($input['isUserAvailableForPaid'])? $input['isUserAvailableForPaid'] : NULL;
        $updateData['is_profile_completed']="1";
        $updateData['about_yourself']=isset($input['aboutUserSelf'])? $input['aboutUserSelf'] : NULL;
        $updateData['city']=isset($input['userCity'])? $input['userCity'] : NULL;
        $updateData['state']=isset($input['userState'])? $input['userState'] : NULL;
        $updateData['country']=isset($input['userCountry'])? $input['userCountry'] : NULL;
        $updateData['postal_code']=isset($input['userPostalCode'])? $input['userPostalCode'] : NULL;
        if($input['profilePhoto']!=2){
            $updateData['circle_photo']="https://www.snaplava.com/live/public/user_profile_upload/circle/".$imageName;
        }   
        $updres=$this->user->where('id', $currentUser->id)->update($updateData);
        
        if($updres){
            $updatedData=$this->user->find($currentUser->id);
            $returnArr['status']=2;
            $returnArr['content']=$updatedData;
            $returnArr['message']="Profile data stored successfully.";
        }else{
            $returnArr['status']=3;
            $returnArr['content']="";
            $returnArr['message']="Could not store the data.";
        }

        return $returnArr;
    }

    public function index()
    {
    	$user=$this->user->paginate(20);
        return $this->response->paginator($user, $this->userTransformer);
    }

    // get the user assigned with the current token.
    public function getTokenUser(){
        $current_user = \Auth::user();
        return $current_user->id;
    }

    /**
    * Creating/registering new user 
    */
    public function store(Request $request)
    {
        $input=$request->all();

        $validationRules=[
            'name' => 'required|min:3',
            'email' => 'required|email',
            'password' => 'required|min:6'
        ];
        $validator= \Validator::make($input, $validationRules);
        if($validator->fails()){
            // $result= new \Illuminate\Http\JsonResponse(
            //     [ 'errors' => $validator->errors() ],
            //     \Illuminate\Http\Response::HTTP_BAD_REQUEST
            // );
            $returnArr['status']=1;
            $returnArr['content']=$validator->errors();
            $returnArr['message']="Validation failed.";
            return $returnArr;
        }

        $rowPassword=$input['password'];
        $input['password']=Hash::make($input['password'], ['rounds' => 15]);

        $checkEmail=$this->user->where('email', $input['email'])->first();
        /*$returnArr['status']=121;
        $returnArr['content']=$checkEmail;
        $returnArr['message']="PRE";
        return $returnArr;*/
        if($checkEmail === null){

            /*$returnArr['status']=124;
            $returnArr['content']=$checkEmail;
            $returnArr['message']="N";
            return $returnArr;*/

            $input['photo']="https://www.snaplava.com/live/public/thumbnail_upload/avatar.png";
            $user=$this->user->create($input);

            $userDetailsData['user_id']=$user->id;
            $userDetailsData['email']=isset($input['email']) ? $input['email'] : NULL;
            $userDetailsData['photo']=isset($input['photo']) ? $input['photo'] : NULL;
            $userDetailsData['login_type']='password';
            $userDetailsResult=$this->userDetails->create($userDetailsData);

            
        }else{
            
            /*$returnArr['status']=123;
            $returnArr['content']=$checkEmail;
            $returnArr['message']="Y";
            return $returnArr;*/
            if($checkEmail->password===null || $checkEmail->password==""){
                $updateData['password']=$input['password'];
                $updres=$this->user->where('id', $checkEmail->id)->update($updateData);

                $userDetailsData['user_id']=$checkEmail->id;
                $userDetailsData['email']=isset($checkEmail->email) ? $checkEmail->email : NULL;
                $userDetailsData['photo']=isset($checkEmail->photo) ? $checkEmail->photo : NULL;
                $userDetailsData['login_type']='password';
                $userDetailsResult=$this->userDetails->create($userDetailsData);
                
            }else{
                $validationMsg['email']="The email has already been taken.";
                $returnArr['status']=1;
                $returnArr['content']=$validationMsg;
                $returnArr['message']="Validation failed.";
                return $returnArr;
            }
            
        }

        if($userDetailsResult){
            $client = new \GuzzleHttp\Client();
            try {
                $response = $client->request('POST', 'https://www.snaplava.com/live/public/api/v1/oauth/token', [
                    'headers' => [
                        'user-agent' => $_SERVER['HTTP_USER_AGENT'],
                    ],
                    'form_params' => [
                        'grant_type' => 'password', 
                        'client_id'=> 2, 
                        'client_secret' => 'e8XxyWFmnwPh3kDTa3KuryzdTcXtAIohWJDAlXsv', 
                        'username'=>$input['email'],
                        'password'=>$rowPassword,
                        'scope'=>'*',
                        'provider'=>'api'
                    ]
                ]);

                $contents = json_decode($response->getBody(), true);  

                $sendArr['user_id']=$userDetailsData['user_id'];
                $sendArr['name']=$input['name'];
                $sendArr['photo']=NUll;

                $returnArr['status']=2;
                $returnArr['content']=array_merge($contents, $sendArr);
                $returnArr['message']="User is created successfully.";
            }
            catch (\GuzzleHttp\Exception\ClientException $e) {
                $responsePre = $e->getResponse();
                $response = json_decode($responsePre->getBody(), true);

                $returnArr['status']=3;
                $returnArr['content']=$response;
                $returnArr['message']="Could not create the user.";
            }
            
        }else{
            $returnArr['status']=3;
            $returnArr['content']="";
            $returnArr['message']="Could not create the user.";
        }
        
        return $returnArr; 
    }


    /**
    * Login with password
    **/
    public function login(Request $request){
        $input=$request->all();

        $validationRules=[
            'email' => 'required',
            'password' => 'required'
        ];
        $validator= \Validator::make($input, $validationRules);
        if($validator->fails()){
            $returnArr['status']=1;
            $returnArr['content']=$validator->errors();
            $returnArr['message']="Validation failed.";
            return $returnArr;
        }

        $client = new \GuzzleHttp\Client();
        try {
            $responsePre = $client->request('POST', 'https://www.snaplava.com/live/public/api/v1/oauth/token', [
                'headers' => [
                    'user-agent' => $_SERVER['HTTP_USER_AGENT'],
                ],
                'form_params' => [
                    'grant_type' => 'password', 
                    'client_id'=> 2, 
                    'client_secret' => 'e8XxyWFmnwPh3kDTa3KuryzdTcXtAIohWJDAlXsv', 
                    'username'=>$input['email'],
                    'password'=>$input['password'],
                    'scope'=>'*',
                    'provider'=>'api'
                ]
            ]); 
            $response=json_decode($responsePre->getBody(), true);  

            $returnArr['status']=2;
            $returnArr['content']=$response;
            $returnArr['message']="Token generated successfully.";
        }
        catch (\GuzzleHttp\Exception\ClientException $e) {
            $responsePre = $e->getResponse();
            $response = json_decode($responsePre->getBody(), true);

            $returnArr['status']=3;
            $returnArr['content']=$response;
            $returnArr['message']="Could not generate the token.";
        }

        return $returnArr;
    }


    //Users Image upload
    public function imageUpload(Request $request){
        $input=$request->all();

        $currentUser = \Auth::user();
        if(!isset($currentUser->id) || $currentUser->id==""){
            $returnArr['status']=1;
            $returnArr['content']="";
            $returnArr['message']="Could not found the user.";
            return $returnArr;
        }

        $validationRules=[
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:20000'
        ];
        $validator= \Validator::make($input, $validationRules);
        if($validator->fails()){
            $result['status']=1;
            $result['content']=$validator->errors();
            $result['message']="Validation failed.";
            return $result;
        }
        //$uploadDir=__DIR__."/../../../../files/";
        $micoTime=preg_replace('/(0)\.(\d+) (\d+)/', '$3$1$2', microtime());

        $imageName = $micoTime.'.'.$request->image->getClientOriginalExtension();

        /* Resizing images */
        $photo = $request->file('image');

        // read width and height of the image
        $width = Image::make($photo->getRealPath())->width();
        $height = Image::make($photo->getRealPath())->height();

        if($width>=$height)
        {
            if($width>=200){
                $thumb_new_width=200;
                $thumb_new_height = $height * ($thumb_new_width/$width);
                $thumb_new_height=floor($thumb_new_height);    
            }else{
                $thumb_new_width=$width;
                $thumb_new_height = $height * ($thumb_new_width/$width);
                $thumb_new_height=floor($thumb_new_height);
            }
            
        }
        else if($height>=$width)
        {
            if($height>=390){
                $thumb_new_height=390;
                $thumb_new_width = $width * ($thumb_new_height/$height);
                $thumb_new_width=floor($thumb_new_width);
                if($thumb_new_width>200){
                    $thumb_new_width=200;
                    $thumb_new_height = $height * ($thumb_new_width/$width);
                    $thumb_new_height=floor($thumb_new_height);
                }
            }else{
                $thumb_new_height=$height;
                $thumb_new_width = $width * ($thumb_new_height/$height);
                $thumb_new_width=floor($thumb_new_width);
            }
            
        }

        $destinationPath = public_path('thumbnail_upload/');
        $thumb_img = Image::make($photo->getRealPath())->resize($thumb_new_width, $thumb_new_height);
        $thumb_img->save($destinationPath."/".$imageName,90);


        /* Medium strat */
        if($width==$height){
            $new_width=820;
            $new_height=820;
        }
        else if($width>=$height)
        {
            if($width>=820){
                $new_width=820;
                $new_height = $height * ($new_width/$width);
                $new_height=floor($new_height);    
            }else{
                $new_width=$width;
                $new_height = $height * ($new_width/$width);
                $new_height=floor($new_height);
            }
            
        }
        else if($height>=$width)
        {
            if($height>=820){
                $new_height=820;
                $new_width = $width * ($new_height/$height);
                $new_width=floor($new_width);
                if($new_width<562 && $width>562){
                    $new_width=562;
                    $new_height = $height * ($new_width/$width);
                    $new_height=floor($new_height);
                }
            }else{
                $new_height=$height;
                $new_width = $width * ($new_height/$height);
                $new_width=floor($new_width);
            }
            
        }
        
        $destinationPath = public_path('medium_upload/');
        $medium_img = Image::make($photo->getRealPath())->resize($new_width, $new_height);
        $medium_img->save($destinationPath."/".$imageName,90);
        /* Medium End*/

        $destinationPath = public_path('original_upload/');
        $uploadRes=$photo->move($destinationPath, $imageName);
        /* Resizing images */

        //$uploadRes=$request->image->move($uploadDir, $imageName);
        if($uploadRes){
            $userImageData['user_id']=$currentUser->id;
            $userImageData['image_original']="https://www.snaplava.com/live/public/original_upload/".$imageName;
            $userImageData['image_medium']="https://www.snaplava.com/live/public/medium_upload/".$imageName;
            $userImageData['image_thumbnail']="https://www.snaplava.com/live/public/thumbnail_upload/".$imageName;
            $userImageData['ip_address']=$request->ip();
            
            $userImageResult=$this->userImages->create($userImageData);
            if($userImageResult){
                $returnArr['status']=2;
                $returnArr['content']="";
                $returnArr['message']="Image uploaded successfully.";
            }else{
                $returnArr['status']=3;
                $returnArr['content']="";
                $returnArr['message']="Could not upload the image.";
            }
        }else{
            $returnArr['status']=3;
            $returnArr['content']="";
            $returnArr['message']="Could not upload the image.";
        }

        return $returnArr;
    }


    //Get less detailed User Images
    public function getUsersLessDetailedImages(Request $request){
        $input=$request->all();

        $currentUser = \Auth::user();

        if(!isset($currentUser->id) || $currentUser->id==""){
            $returnArr['status']=1;
            $returnArr['content']="";
            $returnArr['message']="Could not found the user.";
            return $returnArr;
        }

       // return $currentUser->id;
        //$images=$this->userImages->where('user_id', $currentUser->id)->where('title', NULL)->orwhere('title', '=', '')->paginate(20);
        $images=$this->userImages->where('user_id', $currentUser->id)
        ->where(function($q){
            $q->where('title', NULL)
            ->orWhere('title', '=', '');
        })->paginate(20);
        
        //$res=$this->response->paginator($images, $this->userImagesTransformer);
        $dataArray=$images->toArray();

        if($dataArray){
            $response=[
                'data' => $dataArray['data'],
                'total' => $dataArray['total'],
                'limit' => $dataArray['per_page'],
                'pagination' => [
                    'next_page' => $dataArray['next_page_url'],
                    'prev_page' => $dataArray['prev_page_url'],
                    'current_page' => $dataArray['current_page'],
                    'first_page' => $dataArray['first_page_url'],
                    'last_page' => $dataArray['last_page_url']
                ]
            ];

            if($response){
                $returnArr['status']=2;
                $returnArr['content']=$response;
                $returnArr['message']="Data fetched successfully.";
            }else{
                $returnArr['status']=3;
                $returnArr['content']="";
                $returnArr['message']="Could not fetch the data.";
            }
        }else{
            $returnArr['status']=3;
            $returnArr['content']="";
            $returnArr['message']="Could not fetch the data.";
        }
        
        
        return $returnArr;
    }

    //Store image details
    public function storeUsersImageDetails(Request $request){
        $input=$request->all();
        
        if(isset($input['totalNumberOfSet']) && !empty($input['totalNumberOfSet']) && $input['totalNumberOfSet']>0){

            $currentUser = \Auth::user();
            if(!isset($currentUser->id) || $currentUser->id==""){
                $returnArr['status']=1;
                $returnArr['content']="";
                $returnArr['message']="Could not found the user.";
                return $returnArr;
            }

            $validationRules=[];
            for ($i=1; $i <= $input['totalNumberOfSet']; $i++) { 
                $getId=$input['imageId'.$i];
                $validationRules["imageTitle".$getId]='required';
            }
            /*foreach ($input['imageIds'] as $imageKey => $imageVal) {
                $validationRules["imageTitle".$imageVal]='required';
            }*/

            if(!empty($validationRules)){
                
                /* validation part is blocked for now will be implemented in future */
                $validator= \Validator::make($input, $validationRules);
                /*if($validator->fails()){
                    $returnArr['status']=1;
                    $returnArr['content']=$validator->errors();
                    $returnArr['message']="Validation Failed.";
                    return $returnArr;
                }*/

                /*$checkImageInDatabase=$this->userImages->find($imageVal);
                if (!$checkImageInDatabase) {
                    $returnArr['status']=4;
                    $returnArr['content']="";
                    $returnArr['message']="Image not found in database.";
                    return $returnArr;
                }*/

                for ($i=1; $i <= $input['totalNumberOfSet']; $i++) { 
                    $getImageId=$input['imageId'.$i];
                //foreach ($input['imageIds'] as $imageStoreKey => $imageStoreVal) {
                    $imageData=[];
                    
                    $categories=NULL;
                    if(isset($input['imageCategory'.$getImageId]) && !empty($input['imageCategory'.$getImageId])){
                        $categories=implode(",",$input['imageCategory'.$getImageId]);
                    }

                    //$imageData['id']=$getImageId;
                    $imageData['title']=isset($input['imageTitle'.$getImageId]) ? $input['imageTitle'.$getImageId] : NULL;
                    $imageData['description']=isset($input['imageDescription'.$getImageId]) ? $input['imageDescription'.$getImageId] : NULL;
                    $imageData['categories']=$categories;

                    //$updres=$this->userImages->where('id', $getImageId)->update($imageData);
                    $productImage = $this->userImages->findOrFail($getImageId);
                    $productImage->slug = null;
                    $updres=$productImage->update($imageData);
                    
                    // $post->fill($imageData);
                    // $post->save();
                }
                $lastImage=$this->userImages->find($getImageId);

                if($updres){
                    $returnArr['status']=2;
                    $returnArr['content']=$lastImage;
                    $returnArr['message']="Stored successfully.";
                }else{
                    $returnArr['status']=3;
                    $returnArr['content']="";
                    $returnArr['message']="Could not store the data.";
                }
                
            }else{
                $returnArr['status']=3;
                $returnArr['content']="";
                $returnArr['message']="Data not found.";
            }
        }else{
            $returnArr['status']=5;
            $returnArr['content']="";
            $returnArr['message']="Required data not provided.";
        }

        return $returnArr;
        
    }


    public function getUsersLastUpDatedImage(Request $request){
        $input=$request->all();

        $currentUser = \Auth::user();
        if(!isset($currentUser->id) || $currentUser->id==""){
            $returnArr['status']=1;
            $returnArr['content']="";
            $returnArr['message']="Could not found the user.";
            return $returnArr;
        }

        $imageData=$this->userImages->where('user_id', $currentUser->id)->where('title', '!=', NULL)->where('title', '!=', '')->orderby('id', 'DESC')->first();
        //$imageData=$this->userImages->where('user_id', $currentUser->id)->orderby('updated_at', 'DESC')->first();
        if($imageData){
            $returnArr['status']=2;
            $returnArr['content']=$imageData;
            $returnArr['message']="Fetched successfully.";
        }else{
            $returnArr['status']=4;
            $returnArr['content']="";
            $returnArr['message']="No data found.";
        }
        return $returnArr;
    }


    public function getUserImages(Request $request){
        $input=$request->all();

        $currentUser = \Auth::user();
        if(!isset($currentUser->id) || $currentUser->id==""){
            $returnArr['status']=1;
            $returnArr['content']="";
            $returnArr['message']="Could not found the user.";
            return $returnArr;
        }

        $paginationLimit=20;
        if(isset($input['pagination_limit']) && $input['pagination_limit']!=""){
            $paginationLimit=$input['pagination_limit'];
        }

        $logedInUser=$currentUser->id;
        $imageData=$this->userImages->join('users', 'user_images.user_id', '=', 'users.id')
        //->join('user_details', 'user_images.user_id', '=', 'user_details.user_id')
        ->leftJoin('image_ratings', function ($join) use ($logedInUser) {
            $join->on('user_images.id', '=', 'image_ratings.image_id')
            ->where('image_ratings.user_id', $logedInUser);
        })
        ->leftJoin('image_likes', function ($join) use ($logedInUser) {
            $join->on('user_images.id', '=', 'image_likes.image_id')
            ->where('image_likes.user_id', $logedInUser);
        })
        ->leftJoin('user_rating_views', 'users.id', '=', 'user_rating_views.user_id')
        ->leftJoin('image_rating_views', 'user_images.id', '=', 'image_rating_views.image_id')
        ->where('user_images.status', '1')
        ->where('user_images.user_id', '=', $logedInUser)
        ->orderBy('user_images.id', 'desc')
        ->select('users.name as user_name', 'users.slug as user_slug', 'users.photo as user_profile_photo', 'users.total_followers as total_followers', 'user_rating_views.average_rating as user_rating', 'user_rating_views.total_number_of_photos as total_number_of_rated_photos', 'image_rating_views.average_rating as photo_rating', 'image_rating_views.total_number_of_users as total_number_of_rated_users', 'image_ratings.content_composition as content_composition_rating', 'image_ratings.image_quality as image_quality_rating', 'image_ratings.professionalism as professionalism_rating', 'image_ratings.excellent as excellent_rating', 'image_ratings.world_class as world_class_rating', 'image_likes.status as is_liked', 'user_images.*')
        ->paginate($paginationLimit);
        $dataArray=$imageData->toArray();
        if($dataArray){
            $response=[
                'data' => $dataArray['data'],
                'total' => $dataArray['total'],
                'limit' => $dataArray['per_page'],
                'pagination' => [
                    'next_page' => $dataArray['next_page_url'],
                    'prev_page' => $dataArray['prev_page_url'],
                    'current_page' => $dataArray['current_page'],
                    'first_page' => $dataArray['first_page_url'],
                    'last_page' => $dataArray['last_page_url']
                ]
            ];

            $returnArr['status']=2;
            $returnArr['content']=$response;
            $returnArr['message']="Data fetched successfully.";
        }else{
            $returnArr['status']=4;
            $returnArr['content']="";
            $returnArr['message']="No images found.";
        }

        return $returnArr;
    }

    //get  current token user's details
    public function getUserDetails(Request $request){
        
        $currentUser = \Auth::user();
        if(!isset($currentUser->id) || $currentUser->id==""){
            $returnArr['status']=1;
            $returnArr['content']="";
            $returnArr['message']="Could not found the user.";
            return $returnArr;
        }

        // $userData=$this->user->join('user_details', 'users.id', '=', 'user_details.user_id')
        // ->where('users.id', '=', $currentUser->id)
        // ->select('users.id as id', 'users.name as name', 'users.email as email', 'users.photo as user_primary_profile_photo', 'user_details.photo as user_secondary_profile_photo', 'users.created_at as created_at', 'users.updated_at as updated_at')
        // ->first();
        $userData=$this->user->where('id', '=', $currentUser->id)
        ->select('users.id', 'users.name', 'users.email', 'users.photo as user_profile_photo', 'users.created_at', 'users.updated_at')
        ->first();
        if($userData){
            $returnArr['status']=2;
            $returnArr['content']=$userData;
            $returnArr['message']="Data fetched successfully.";
        }else{
            $returnArr['status']=3;
            $returnArr['content']="";
            $returnArr['message']="Could not fetch the data.";
        }
        
        return $returnArr;
    }


    public function saveCollageImage(Request $request){
        $input=$request->all();
        
        $uploadDir=__DIR__."/../../../../files/";
        $micoTime=preg_replace('/(0)\.(\d+) (\d+)/', '$3$1$2', microtime());

        //$_POST[data][1] has the base64 encrypted binary codes. 
        //convert the binary to image using file_put_contents
        $savefile = @file_put_contents($uploadDir.$micoTime.".jpg", base64_decode(explode(",", $input['data'])[1]));

        //if the file saved properly, print the file name
        if($savefile){
            return $micoTime;
        }
    } 










    public function facebookUsers(Request $request){
        $input=$request->all();

        $user=array();
        if(empty($input)){
            $returnArr['status']=1;
            $returnArr['content']="";
            $returnArr['message']="Required data not found.";
            //return $result;
        }else{
            //$checkUserData=$this->userDetails::where('social_id', $input['id'])->get();
            $checkUserData = DB::table('users')
                        ->select('users.id as user_id', 'users.name as user_name', 'users.email as user_email', 'users.photo as users_photo', 'user_details.social_id as social_id', 'user_details.email as social_email', 'user_details.photo as social_photo')
                        ->join('user_details', 'users.id', '=', 'user_details.user_id')
                        ->where('user_details.social_id', '=', $input['id'])
                        ->first();

            
            if($checkUserData){
                
                $username=isset($checkUserData->user_email) ? $checkUserData->user_email : $checkUserData->social_email;

                $client = new \GuzzleHttp\Client();
                $response = $client->request('POST', 'https://www.snaplava.com/live/public/api/v1/oauth/token', [
                    'headers' => [
                        // 'Access-Control-Allow-Origin'      => '*',
                        // 'Access-Control-Allow-Methods'     => 'POST, GET, OPTIONS, PUT, DELETE',
                        // 'Access-Control-Allow-Credentials' => 'true',
                        // 'Access-Control-Max-Age'           => '86400',
                        // 'Access-Control-Allow-Headers'     => 'Content-Type, Authorization, X-Requested-With',
                        //'Origin' => 'https://snaplava.com',
                        // 'x-https' => '1',
                        // 'accept-language' => 'en-US,en;q=0.9',
                        // 'accept-encoding' => 'gzip, deflate, br',
                        // 'Accept'     => '*/*',
                        // 'Content-Type' => 'application/x-www-form-urlencoded',
                        // 'postman-token' => '27dd374a-7bc6-b1f0-3e12-aced6c6f8b55',
                        // 'Access-Control-Allow-Origin' => '*',
                        // 'origin' => 'https://www.snaplava.com/',
                        // 'cache-control' => 'no-cache',
                        //'user-agent' => 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.167 Safari/537.36',
                        'user-agent' => $_SERVER['HTTP_USER_AGENT'],
                        // 'content-length' => '504',
                        // 'connection' => 'keep-alive',
                        // 'host' => 'www.snaplava.com',
                    ],
                    'form_params' => [
                        'grant_type' => 'personal_access', 
                        'client_id'=> 1, 
                        'client_secret' => 'ZYBK9KYAdNbPmct35EAaBKulLAzhqfR71uEvRlJC', 
                        'username'=>$username,
                    ]
                ]);

                $contents = json_decode($response->getBody());

                $returnArr['status']=2;
                $returnArr['content']=$contents;
                $returnArr['message']="User loged in successfull.";

            }else{

                if(isset($input['id']) && $input['id']!=NULL){
                    $user['name']=isset($input['name']) ? $input['name'] : NULL;
                    $user['email']=isset($input['email']) ? $input['email'] : NULL;
                    $userData=$this->user->create($user);

                    $userDetailsArr['user_id']=$userData->id;
                    $userDetailsArr['social_id']=$input['id'];
                    $userDetailsArr['email']=isset($user['email']) ? $user['email'] : $input['id']."@snaplava.com";
                    $userDetailsArr['photo']=isset($input['picture']['data']['url']) ? $input['picture']['data']['url'] : NUll;
                    $userDetailsData=$this->userDetails->create($userDetailsArr);

                    if(!empty($userDetailsData)){
                        $username=$userDetailsArr['email'];

                        $client = new \GuzzleHttp\Client();
                        $response = $client->request('POST', 'https://www.snaplava.com/live/public/api/v1/oauth/token', [
                            'headers' => [
                                // 'Access-Control-Allow-Origin'      => '*',
                                // 'Access-Control-Allow-Methods'     => 'POST, GET, OPTIONS, PUT, DELETE',
                                // 'Access-Control-Allow-Credentials' => 'true',
                                // 'Access-Control-Max-Age'           => '86400',
                                // 'Access-Control-Allow-Headers'     => 'Content-Type, Authorization, X-Requested-With',
                                //'Origin' => 'https://snaplava.com',
                                 // 'x-https' => '1',
                                 // 'accept-language' => 'en-US,en;q=0.9',
                                 // 'accept-encoding' => 'gzip, deflate, br',
                                 // 'Accept'     => '*/*',
                                // 'Content-Type' => 'application/x-www-form-urlencoded',
                                // 'postman-token' => '27dd374a-7bc6-b1f0-3e12-aced6c6f8b55',
                                // 'Access-Control-Allow-Origin' => '*',
                                // 'Origin' => 'https://www.snaplava.com',
                                // 'cache-control' => 'no-cache',
                                'user-agent' => $_SERVER['HTTP_USER_AGENT'],
                                // 'content-length' => '504',
                                // 'connection' => 'keep-alive',
                                // 'host' => 'www.snaplava.com',
                            ],
                            'form_params' => [
                                'grant_type' => 'personal_access', 
                                'client_id'=> 1, 
                                'client_secret' => 'ZYBK9KYAdNbPmct35EAaBKulLAzhqfR71uEvRlJC', 
                                'username'=>$username,
                            ]
                        ]);

                        $contents = json_decode($response->getBody());

                        $returnArr['status']=2;
                        $returnArr['content']=$contents;
                        $returnArr['message']="User is created successfully.";

                    }else{
                        $returnArr['status']=3;
                        $returnArr['content']="";
                        $returnArr['message']="User is not created.";
                    }
                }else{
                    $returnArr['status']=3;
                    $returnArr['content']="";
                    $returnArr['message']="Could not fetch user data.";
                }
            }
        }

        //$finalResponse=$this->response->item($returnArr, $this->userTransformer);
        return $returnArr;
    }


    public function logedinUserInfo(){
        echo "hello";
    }



    public function show(Request $request){
        $input=$request->all();
        echo '<pre>';
        print_r($input);
        exit;
    	$user=$this->user->paginate(20);
        return $this->response->paginator($user, $this->userTransformer);

    	// $user = $this->userRepository->getAll();
    	// $response=$this->response->item($user, $this->userTransformer);
    	// return $response;
    }
}
