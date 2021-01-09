<?php

namespace App\Http\Controllers\V1;

use Illuminate\Support\Facades\Input;
use Illuminate\Support\Facades\Hash;
use Dingo\Api\Routing\Helpers;
use Illuminate\Http\Request;
use Image;
use DB;

class PhotoController extends Controller
{

    use Helpers;

    //protected $userRepository;
    protected $userTransformer;


    //public function __construct(\App\Repository\UsersRepository $userRepository, \App\Transformer\UserTransformer $userTransformer){
    public function __construct(\App\User $user, \App\UserDetails $userDetails, \App\UserImages $userImages, \App\ImageRatings $imageRatings, \App\UserFollowers $userFollowers, \App\Transformer\UserTransformer $userTransformer, \App\Transformer\UserImagesTransformer $userImagesTransformer){
    	//$this->userRepository = $userRepository;
        $this->user = $user;
        $this->userDetails = $userDetails;
        $this->userImages = $userImages;
        $this->imageRatings = $imageRatings;
    	$this->userFollowers = $userFollowers;
        $this->userTransformer = $userTransformer;
    	$this->userImagesTransformer = $userImagesTransformer;
    }


    /**
    * Update User's Photos Details
    **/
    public function updateUserPhotos(Request $request){
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

                    $updres=$this->userImages->where('id', $getImageId)->update($imageData);
                    /*$productImage = $this->userImages->findOrFail($getImageId);
                    $productImage->slug = null;
                    $updres=$productImage->update($imageData);*/
                    
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

    /**
    * Fetch User's Photos Details
    **/
    public function editUserPhotos(Request $request){
        $input=$request->all();

        $currentUser = \Auth::user();
        if(!isset($currentUser->id) || $currentUser->id==""){
            $returnArr['status']=1;
            $returnArr['content']="";
            $returnArr['message']="Could not found the user.";
            return $returnArr;
        }

        if(isset($input['photo_ids']) && !empty($input['photo_ids'])){
            $photosArr=explode(",", $input['photo_ids']);
            $query = $this->userImages->query();
            foreach ($photosArr as $key => $val) {
                if($key==0){
                    $query=$query->where('user_images.id', $val);
                }else{
                    $query=$query->orwhere('user_images.id', $val);
                }
            }
            $result=$query->get();
            if($result){
                $returnArr['status']=2;
                $returnArr['content']=$result;
                $returnArr['message']="Data fetched successfully.";
            }else{
                $returnArr['status']=3;
                $returnArr['content']="";
                $returnArr['message']="Something went wrong! Could not fetch the data.";
            }
        }else{
            $returnArr['status']=5;
            $returnArr['content']="";
            $returnArr['message']="Required data not provided.";
        }

        return $returnArr;
    }


    /**
    * Delete User's Photos
    **/
    public function deleteUserPhotos(Request $request){
        $input=$request->all();

        $currentUser = \Auth::user();
        if(!isset($currentUser->id) || $currentUser->id==""){
            $returnArr['status']=1;
            $returnArr['content']="";
            $returnArr['message']="Could not found the user.";
            return $returnArr;
        }

        if(isset($input['photo_ids']) && !empty($input['photo_ids'])){
            $photosArr=explode(",", $input['photo_ids']);
            $checkFlag=0;
            foreach ($photosArr as $key => $val) {
                $result=$this->userImages->where('id', $val)
                ->where('user_id', $currentUser->id)
                ->delete();
                if($result!=1){
                    $checkFlag=1;
                }
            }
            if($checkFlag==0){
                $returnArr['status']=2;
                $returnArr['content']="";
                $returnArr['message']="Photos deleted successfully."; 
            }else{
                $returnArr['status']=3;
                $returnArr['content']="";
                $returnArr['message']="Somethig went wrong!"; 
            }
        }else{
            $returnArr['status']=5;
            $returnArr['content']="";
            $returnArr['message']="Required data not provided.";
        }

        return $returnArr;
    }


    /**
    * Save Photo ratings.
    **/
    public function savePhotoRating(Request $request){
        $input=$request->all();

        $currentUser = \Auth::user();
        if(!isset($currentUser->id) || $currentUser->id==""){
            $returnArr['status']=1;
            $returnArr['content']="";
            $returnArr['message']="Could not found the user.";
            return $returnArr;
        }

        if(isset($input['photo_id']) && $input['photo_id']!=""){
            $totalRatingCount=0;
            $ratingData['image_id']=isset($input['photo_id']) ? $input['photo_id'] : NULL;
            $ratingData['image_owner_id']=isset($input['photo_owner_id']) ? $input['photo_owner_id'] : NULL;
            $ratingData['user_id']=$currentUser->id;
            $ratingData['content_composition']=isset($input['content_composition_rating']) ? $input['content_composition_rating'] : 0;
            $ratingData['image_quality']=isset($input['image_quality_rating']) ? $input['image_quality_rating'] : 0;
            $ratingData['professionalism']=isset($input['professionalism_rating']) ? $input['professionalism_rating'] : 0;
            $ratingData['excellent']=isset($input['excellent_rating']) ? $input['excellent_rating'] : 0;
            $ratingData['world_class']=isset($input['world_class_rating']) ? $input['world_class_rating'] : 0;
            
            $totalRatingCount=(float)$ratingData['content_composition']+(float)$ratingData['image_quality']+(float)$ratingData['professionalism']+(float)$ratingData['excellent']+(float)$ratingData['world_class'];
            
            if($totalRatingCount<=0){
                $returnArr['status']=4;
                $returnArr['content']="";
                $returnArr['message']="No rating saved. user did not gave any rating.";
                return $returnArr;
            }

            $overallRating=$totalRatingCount/5;
            $ratingData['overall_rating']=$overallRating;


            $photoRatingData=$this->imageRatings->where('user_id', $currentUser->id)->where('image_id', $input['photo_id'])->first();
            if($photoRatingData){

                $storeResult=$this->imageRatings->where('id', $photoRatingData->id)->update($ratingData);
                $updatedPhotoRating=DB::table('image_rating_views')
                ->where('image_id', $input['photo_id'])
                ->select('image_id as photo_id', 'average_rating as photo_rating', 'total_number_of_users as total_number_of_rated_users')
                ->first();
                /*$updatedPhotoRating=DB::statement("SELECT image_id as photo_id, average_rating as photo_rating, total_number_of_users as total_number_of_rated_users FROM image_rating_views where image_id=".$input['photo_id']);*/

                if($storeResult){
                    $returnArr['status']=2;
                    $returnArr['content']=$updatedPhotoRating;
                    $returnArr['message']="Ratings updated successfully.";
                }else{
                    $returnArr['status']=3;
                    $returnArr['content']="";
                    $returnArr['message']="Something went wrong! could not store the ratings.";
                }
            }else{
                $storeResult=$this->imageRatings->create($ratingData); 
                if($storeResult){

                    //$photoViewRes=DB::statement("CREATE VIEW image_rating_views as select distinct(a.image_id) as image_id, (select AVG(b.overall_rating) from image_ratings as b where b.image_id=a.image_id) as average_rating from image_ratings as a");

                    /**
                    * Script i used to create the mysql view tables 
                    * No need to run again view tables are reated
                    **/
                    /*$photoViewRes=DB::statement("CREATE VIEW image_rating_views as SELECT img.id AS image_id, (SELECT AVG(img_rating.overall_rating) FROM image_ratings AS img_rating WHERE img_rating.image_id=img.id) AS average_rating, (SELECT COUNT(usr_count.user_id) FROM image_ratings AS usr_count WHERE usr_count.image_id=img.id) AS total_number_of_users FROM user_images AS img WHERE img.status='1'");
                    
                    $userViewRes=DB::statement("CREATE VIEW user_rating_views as SELECT usr.id AS user_id, (SELECT AVG(img_rating.overall_rating) FROM image_ratings AS img_rating WHERE img_rating.image_owner_id=usr.id) AS average_rating, (SELECT COUNT(img_count.image_id) from image_ratings AS img_count WHERE img_count.image_owner_id=usr.id) AS total_number_of_photos FROM users AS usr");*/

                    /*$updatedPhotoRating=DB::statement("SELECT image_id as photo_id, average_rating as photo_rating, total_number_of_users as total_number_of_rated_users FROM image_rating_views where image_id=".$input['photo_id']);*/

                    $updatedPhotoRating=DB::table('image_rating_views')
                    ->where('image_id', $input['photo_id'])
                    ->select('image_id as photo_id', 'average_rating as photo_rating', 'total_number_of_users as total_number_of_rated_users')
                    ->first();

                    $returnArr['status']=2;
                    $returnArr['content']=$updatedPhotoRating;
                    $returnArr['message']="Ratings stored successfully.";
                }else{
                    $returnArr['status']=3;
                    $returnArr['content']="";
                    $returnArr['message']="Something went wrong! could not store the ratings.";
                }
            }
            
        }else{
            $returnArr['status']=5;
            $returnArr['content']="";
            $returnArr['message']="Required data not provided.";
        }
        return $returnArr;
    }


    /**
    * Get photo details
    **/
    public function getPhotoDetails(Request $request){
        $input=$request->all();

        $currentUser = \Auth::user();
        if(!isset($currentUser->id) || $currentUser->id==""){
            $returnArr['status']=1;
            $returnArr['content']="";
            $returnArr['message']="Could not found the user.";
            return $returnArr;
        }
        
        $logedInUser=$currentUser->id;

        if(isset($input['id']) && $input['id']!=""){

            $photoIdOrSlug=$input['id'];

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
            ->where(function($q) use ($photoIdOrSlug){
                $q->where('user_images.id', $photoIdOrSlug)
                ->orWhere('user_images.slug', $photoIdOrSlug);
            });

            $query=$query->orderBy('user_images.id', 'desc')
            ->select('users.name as user_name', 'users.slug as user_slug', 'users.photo as user_profile_photo', 'users.total_followers as total_followers', 'users.location as user_location', 'users.what_best_describes_you as user_what_best_describes_you', 'users.is_available_for_paid_photography as user_is_available_for_paid_photography', 'users.city as user_city', 'users.country as user_country', 'user_rating_views.average_rating as user_rating', 'user_rating_views.total_number_of_photos as total_number_of_rated_photos', 'image_rating_views.average_rating as photo_rating', 'image_rating_views.total_number_of_users as total_number_of_rated_users', 'image_ratings.content_composition as content_composition_rating', 'image_ratings.image_quality as image_quality_rating', 'image_ratings.professionalism as professionalism_rating', 'image_ratings.excellent as excellent_rating', 'image_ratings.world_class as world_class_rating', 'image_likes.status as is_liked', DB::raw('(CASE WHEN user_followers.follower_user_id = '. $logedInUser .' THEN 1 ELSE 0 END) as is_following'), 'user_images.*');

            $imageData = $query->first();
            $dataArray=$imageData->toArray();
            if($dataArray){
                $userPopularPhotos=$this->getUserPopularPhotosInternel($imageData->user_id, 6);
                $userFollowers=$this->getUserFollowersInternel($imageData->user_id, 4);
                $topRatedUsers=$this->getTopRatedUsersInternel($imageData->user_id, 4);

                $response=[
                    'data' => $dataArray,
                    'user_popular_photos' => $userPopularPhotos,
                    'user_followers' => $userFollowers,
                    'top_rated_users' => $topRatedUsers
                ];

                $returnArr['status']=2;
                $returnArr['content']=$response;
                $returnArr['message']="Fetched successfully.";
            }else{
                $returnArr['status']=4;
                $returnArr['content']="";
                $returnArr['message']="Something went wrong! could fetched the data.";
            }
            
        }else{
            $returnArr['status']=5;
            $returnArr['content']="";
            $returnArr['message']="Required data not found.";
        }
        
        return $returnArr;
    }





    /**
    * Get Users Popular photos
    **/    
    public function getUserPopularPhotos(Request $request){
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
        $userIdOrSlug=$logedInUser;
        if(isset($input['user_id']) && $input['user_id']!="")
            $userIdOrSlug=$input['user_id'];

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
        ->where(function($q) use ($userIdOrSlug){
            $q->where('users.id', $userIdOrSlug)
            ->orWhere('users.slug', $userIdOrSlug);
        });
        $query=$query->orderBy('image_rating_views.average_rating', 'desc')
        ->orderBy('user_images.id', 'desc')
        ->select('users.name as user_name', 'users.slug as user_slug', 'users.photo as user_profile_photo', 'users.total_followers as total_followers', 'users.location as user_location', 'users.what_best_describes_you as user_what_best_describes_you', 'users.is_available_for_paid_photography as user_is_available_for_paid_photography', 'user_rating_views.average_rating as user_rating', 'user_rating_views.total_number_of_photos as total_number_of_rated_photos', 'image_rating_views.average_rating as photo_rating', 'image_rating_views.total_number_of_users as total_number_of_rated_users', 'image_ratings.content_composition as content_composition_rating', 'image_ratings.image_quality as image_quality_rating', 'image_ratings.professionalism as professionalism_rating', 'image_ratings.excellent as excellent_rating', 'image_ratings.world_class as world_class_rating', 'image_likes.status as is_liked', DB::raw('(CASE WHEN user_followers.follower_user_id = '. $logedInUser .' THEN 1 ELSE 0 END) as is_following'), 'user_images.*');

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
            
        /*}else{
            $returnArr['status']=5;
            $returnArr['content']="";
            $returnArr['message']="Required data not found.";
        }*/
        
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
            ->select('users.name as user_name', 'users.slug as user_slug', 'users.photo as user_profile_photo', 'users.total_followers as total_followers', 'users.location as user_location', 'users.what_best_describes_you as user_what_best_describes_you', 'users.is_available_for_paid_photography as user_is_available_for_paid_photography', 'user_rating_views.average_rating as user_rating', 'user_rating_views.total_number_of_photos as total_number_of_rated_photos', 'image_rating_views.average_rating as photo_rating', 'image_rating_views.total_number_of_users as total_number_of_rated_users', 'image_ratings.content_composition as content_composition_rating', 'image_ratings.image_quality as image_quality_rating', 'image_ratings.professionalism as professionalism_rating', 'image_ratings.excellent as excellent_rating', 'image_ratings.world_class as world_class_rating', 'image_likes.status as is_liked', DB::raw('(CASE WHEN user_followers.follower_user_id = '. $logedInUser .' THEN 1 ELSE 0 END) as is_following'), 'user_images.*');

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
    * Get Users Followers Internel Call
    **/    
    private function getUserFollowersInternel($userId=NULL, $pagination_limit=NULL){

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

            $query = $this->userFollowers->query();
            $query=$query->leftJoin('users', function ($join) use ($userId) {
                $join->on('user_followers.follower_user_id', '=', 'users.id');
                //->where('user_followers.following_user_id', $userId);
            })
            ->leftJoin('user_rating_views', 'users.id', '=', 'user_rating_views.user_id')
            ->where('user_followers.following_user_id', $userId);
            $query=$query->orderBy('user_rating_views.average_rating', 'desc')
            ->orderBy('users.id', 'desc')
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
    * Get Top rated Users Internel Call
    **/    
    private function getTopRatedUsersInternel($userId=NULL, $pagination_limit=NULL){

        $returnArr=array();
        $currentUser = \Auth::user();
        if(!isset($currentUser->id) || $currentUser->id==""){
            /*$returnArr['status']=1;
            $returnArr['content']="";
            $returnArr['message']="Could not found the user.";*/
            return $returnArr;
        }
        
        $paginationLimit=50;
        if(isset($pagination_limit) && $pagination_limit!=""){
            $paginationLimit=$pagination_limit;
        }

        $logedInUser=$currentUser->id;

        if(isset($userId) && $userId!=""){

            $query = $this->user->query();
            $query=$query->leftJoin('user_followers', function ($join) use ($logedInUser) {
                $join->on('users.id', '=', 'user_followers.following_user_id')
                ->where('user_followers.follower_user_id', $logedInUser);
            })
            ->leftJoin('user_rating_views', 'users.id', '=', 'user_rating_views.user_id');
            $query=$query->orderBy('user_rating_views.average_rating', 'desc')
            ->orderBy('users.id', 'desc')
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

}



