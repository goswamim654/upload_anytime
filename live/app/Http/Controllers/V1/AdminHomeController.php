<?php

namespace App\Http\Controllers\V1;

use Illuminate\Support\Facades\Input;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Dingo\Api\Routing\Helpers;
use Illuminate\Http\Request;
use Image;
use DB;

class AdminHomeController extends Controller
{

    use Helpers;

    //protected $userRepository;
    protected $userTransformer;
    protected $userImagesTransformer;


    //public function __construct(\App\Repository\UsersRepository $userRepository, \App\Transformer\UserTransformer $userTransformer){
    public function __construct(\App\User $user, \App\UserDetails $userDetails, \App\UserImages $userImages, \App\UserFollowers $userFollowers, \App\ImageLikes $imageLikes, \App\Admin $admin, \App\Transformer\UserTransformer $userTransformer, \App\Transformer\UserImagesTransformer $userImagesTransformer, \App\Transformer\UserFollowersTransformer $userFollowersTransformer, \App\Transformer\ImageLikesTransformer $imageLikesTransformer){
    	//$this->userRepository = $userRepository;
        $this->user = $user;
        $this->userDetails = $userDetails;
        $this->userImages = $userImages;
        $this->userFollowers = $userFollowers;
        $this->imageLikes = $imageLikes;
        $this->admin = $admin;
        $this->userTransformer = $userTransformer;
        $this->userImagesTransformer = $userImagesTransformer;
        $this->userFollowersTransformer = $userFollowersTransformer;
        $this->imageLikesTransformer = $imageLikesTransformer;
    }

    // get the user assigned with the current token.
    public function getTokenUser(){
        $current_user = \Auth::user();
        return $current_user->id;
    }

    /**
    * Make admin login
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
                    'user-agent' => $_SERVER['HTTP_USER_AGENT']
                ],
                'form_params' => [
                    'grant_type' => 'password', 
                    'client_id'=> 2, 
                    'client_secret' => 'e8XxyWFmnwPh3kDTa3KuryzdTcXtAIohWJDAlXsv', 
                    'username'=>$input['email'],
                    'password'=>$input['password'],
                    'scope'=>'*',
                    'provider'=>'admin'
                ]
            ]); 
            $response=json_decode($responsePre->getBody(), true);  

            if(isset($response['access_token']) && $response['access_token']!=""){

                $adminData=$this->admin->where('email', $input['email'])->first();
                if (Hash::check($input['password'], $adminData->password))
                {
                    $adminId=$adminData->id;
                    

                    //$adminLastLoginData['id']=$adminId;
                    $adminLastLoginData['last_login_at']=$adminData->current_login_at;
                    $adminLastLoginData['current_login_at']=\Carbon\Carbon::now()->toDateTimeString();

                    $lastLoginData=$this->admin->where('id', $adminId)->update($adminLastLoginData);
                    

                    $returnArr['status']=2;
                    $returnArr['content']=$response;
                    $returnArr['message']="Token generated successfully.";
                }else{
                    $returnArr['status']=3;
                    $returnArr['content']="";
                    $returnArr['message']="Could not generate the token.";
                }

            }else{
                $returnArr['status']=3;
                $returnArr['content']="";
                $returnArr['message']="Could not generate the token.";
            }
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


    //get current token admin's details
    public function getAdminDetails(Request $request){
        
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
        $userData=$this->admin->where('id', '=', $currentUser->id)
        ->select('admins.id', 'admins.name', 'admins.email', 'admins.photo as user_profile_photo', 'admins.created_at', 'admins.last_login_at', 'admins.current_login_at', 'admins.updated_at')
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


    /**
    * Get Admin home page data
    **/
    public function home(Request $request){
        $input=$request->all();

        //return $input;
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

        $date = \Carbon\Carbon::today()->subDays(10);
        $lastTenDaysUploaded=$this->userImages->where('created_at', '>=', $date)->count(); 
      
        $getUsedCategories=$this->userImages->select('categories')->get();

        $usedCategoryArray=array();
        if(!empty($getUsedCategories)){
            foreach ($getUsedCategories as $usedKey => $usedVal) {
                if(!in_array($usedVal->categories, $usedCategoryArray) && $usedVal->categories !== null && $usedVal->categories != ""){
                    array_push($usedCategoryArray, $usedVal->categories);
                }
            }
        }
        $totalUsedCategories=count($usedCategoryArray);

        if((isset($input['from_date']) && $input['from_date']!="") && (isset($input['to_date']) && $input['to_date']!="")){
            $from=date("Y-m-d H:i:s", strtotime($input['from_date']));
            $to=date("Y-m-d H:i:s", strtotime($input['to_date']));
            //return $from." ".$to;
            $imageData=$this->userImages->join('users', 'user_images.user_id', '=', 'users.id')
            /*->whereBetween('user_images.created_at', [$from, $to])*/
            ->where('user_images.created_at', '>=', $from)
            ->where('user_images.created_at', '<=', $to)
            ->orderBy('user_images.created_at', 'desc')
            ->select('users.name as user_name', 'users.email as user_email', 'users.photo as user_profile_photo', 'users.total_followers as total_followers', 'user_images.*')
            ->paginate($paginationLimit);
        }else{
            $imageData=$this->userImages->join('users', 'user_images.user_id', '=', 'users.id')
            ->orderBy('user_images.created_at', 'desc')
            ->select('users.name as user_name', 'users.email as user_email', 'users.photo as user_profile_photo', 'users.total_followers as total_followers', 'user_images.*')
            ->paginate($paginationLimit);
        }
        
        $dataArray=$imageData->toArray();
        if($dataArray){

            /*if(!empty($dataArray['data'])){
                foreach ($dataArray['data'] as $key => $val) {
                    $userReactionOnLike=0;
                    $getUserReactionData=$this->imageLikes->where('user_id', $currentUser->id)->where('image_id', $val['id'])->first();
                    if($getUserReactionData)
                        $userReactionOnLike=$getUserReactionData->status;

                    $dataArray['data'][$key]['is_liked']=$userReactionOnLike;
                }
            }*/
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
                ],
                'number_of_photos_uploaded_last_ten_days' => $lastTenDaysUploaded,
                'total_used_categories' => $totalUsedCategories
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

    public function testMail(){

        $data['from']="team@snaplava.com";
        $data['to']="hemantapro@gmail.com";
        $data['subject']="Your photo(s) are now live at SnapLava.";
        $data['content']="Your photo(s) are now live at SnapLava.";
        Mail::raw($data['content'],function($message) use ($data) {
            $message->from($data['from']);
            $message->to($data['to']);
            $message->subject($data['subject']);
            $message->setBody($data['content'], 'text/html');
        });

        /*Mail::raw('Raw string email', function($msg) { 
                $msg->to(['hemantapro@gmail.com']); 
                $msg->from(['bunuhemant28@gmail.com']); 
                $msg->from(['bunuhemant28@gmail.com']); 
            });*/
        //return 1;
    }
    
    /**
    * Approve user uploaded photo
    **/
    public function approvePhoto(Request $request){
        $input=$request->all();

        $currentUser = \Auth::user();
        if(!isset($currentUser->id) || $currentUser->id==""){
            $returnArr['status']=1;
            $returnArr['content']="";
            $returnArr['message']="Could not found the user.";
            return $returnArr;
        }


        if(isset($input['image_id']) && $input['image_id']!=""){
            $imageData=$this->userImages->find($input['image_id']);
            if (!$imageData) {
                $returnArr['status']=4;
                $returnArr['content']="";
                $returnArr['message']="Image not found in database.";
                return $returnArr;
            }

            $updateData['status']='1';
            $result=$this->userImages->where('id', $input['image_id'])->update($updateData);
            if($result==1){
                $updatedData=$this->userImages->join('users', 'user_images.user_id', '=', 'users.id')
                ->where('user_images.id', $input['image_id'])
                ->select('users.email as user_email', 'user_images.*')
                ->first();
                if(isset($updatedData->user_email) && $updatedData['user_email']!==null){
                    $data['from']="team@snaplava.com";
                    $data['to']=$updatedData->user_email;
                    $data['subject']="Your photo(s) are now live at SnapLava.";
                    $data['content']="Your photo(s) are now live at SnapLava.";
                    Mail::raw($data['content'],function($message) use ($data) {
                        $message->from($data['from']);
                        $message->to($data['to']);
                        $message->subject($data['subject']);
                        $message->setBody($data['content'], 'text/html');
                    });
                }
                $returnArr['status']=2;
                $returnArr['content']=$updatedData;
                $returnArr['message']="Operation successfull."; 
            }else{
                $returnArr['status']=3;
                $returnArr['content']="";
                $returnArr['message']="Some thing went wrong! Operation failed."; 
            }

        }else{
            $returnArr['status']=5;
            $returnArr['content']="";
            $returnArr['message']="Required data not provided.";
        }

        return $returnArr;
    }

    /**
    * Decline user uploaded photo
    **/
    public function declinePhoto(Request $request){
        $input=$request->all();

        $currentUser = \Auth::user();
        if(!isset($currentUser->id) || $currentUser->id==""){
            $returnArr['status']=1;
            $returnArr['content']="";
            $returnArr['message']="Could not found the user.";
            return $returnArr;
        }

        if(isset($input['image_id']) && $input['image_id']!=""){
            $imageData=$this->userImages->find($input['image_id']);
            if (!$imageData) {
                $returnArr['status']=4;
                $returnArr['content']="";
                $returnArr['message']="Image not found in database.";
                return $returnArr;
            }

            $updateData['status']='2';
            $result=$this->userImages->where('id', $input['image_id'])->update($updateData);
            if($result==1){
                $updatedData=$this->userImages->join('users', 'user_images.user_id', '=', 'users.id')
                ->where('user_images.id', $input['image_id'])
                ->select('users.email as user_email', 'user_images.*')
                ->first();
                if(isset($updatedData->user_email) && $updatedData['user_email']!==null){
                    $data['from']="team@snaplava.com";
                    $data['to']=$updatedData->user_email;
                    $data['subject']="Your photo(s) are not published in SnapLava.";
                    $data['content']="Your photo(s) are not published in SnapLava.";
                    Mail::raw($data['content'],function($message) use ($data) {
                        $message->from($data['from']);
                        $message->to($data['to']);
                        $message->subject($data['subject']);
                        $message->setBody($data['content'], 'text/html');
                    });
                }
                $returnArr['status']=2;
                $returnArr['content']=$updatedData;
                $returnArr['message']="Operation successfull."; 
            }else{
                $returnArr['status']=3;
                $returnArr['content']="";
                $returnArr['message']="Some thing went wrong! Operation failed."; 
            }

        }else{
            $returnArr['status']=5;
            $returnArr['content']="";
            $returnArr['message']="Required data not provided.";
        }

        return $returnArr;
    }

    /**
    * Delete user uploaded photo
    **/
    public function deletePhoto(Request $request){
        $input=$request->all();

        $currentUser = \Auth::user();
        if(!isset($currentUser->id) || $currentUser->id==""){
            $returnArr['status']=1;
            $returnArr['content']="";
            $returnArr['message']="Could not found the user.";
            return $returnArr;
        }

        if(isset($input['image_id']) && $input['image_id']!=""){
            $imageData=$this->userImages->find($input['image_id']);
            if (!$imageData) {
                $returnArr['status']=4;
                $returnArr['content']="";
                $returnArr['message']="Image not found in database.";
                return $returnArr;
            }

            $result=$this->userImages->where('id', $input['image_id'])->delete();
            if($result==1){
                $returnArr['status']=2;
                $returnArr['content']="";
                $returnArr['message']="Operation successfull."; 
            }else{
                $returnArr['status']=3;
                $returnArr['content']="";
                $returnArr['message']="Some thing went wrong! Operation failed."; 
            }

        }else{
            $returnArr['status']=5;
            $returnArr['content']="";
            $returnArr['message']="Required data not provided.";
        }

        return $returnArr;
    }
}
