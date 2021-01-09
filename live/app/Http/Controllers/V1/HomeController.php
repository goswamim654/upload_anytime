<?php

namespace App\Http\Controllers\V1;

use Illuminate\Support\Facades\Input;
use Illuminate\Support\Facades\Hash;
use Dingo\Api\Routing\Helpers;
use Illuminate\Http\Request;
use Image;
use DB;

class HomeController extends Controller
{

    use Helpers;

    //protected $userRepository;
    protected $userTransformer;
    protected $userImagesTransformer;


    //public function __construct(\App\Repository\UsersRepository $userRepository, \App\Transformer\UserTransformer $userTransformer){
    public function __construct(\App\User $user, \App\UserDetails $userDetails, \App\UserImages $userImages, \App\UserFollowers $userFollowers, \App\ImageLikes $imageLikes, \App\ImageRatings $imageRatings, \App\Transformer\UserTransformer $userTransformer, \App\Transformer\UserImagesTransformer $userImagesTransformer, \App\Transformer\UserFollowersTransformer $userFollowersTransformer, \App\Transformer\ImageLikesTransformer $imageLikesTransformer){
    	//$this->userRepository = $userRepository;
        $this->user = $user;
        $this->userDetails = $userDetails;
        $this->userImages = $userImages;
        $this->userFollowers = $userFollowers;
    	$this->imageLikes = $imageLikes;
        $this->imageRatings = $imageRatings;
        $this->userTransformer = $userTransformer;
        $this->userImagesTransformer = $userImagesTransformer;
        $this->userFollowersTransformer = $userFollowersTransformer;
    	$this->imageLikesTransformer = $imageLikesTransformer;
    }

    public function getAllImages(Request $request)
    {
        $input=$request->all();

        $currentUser = \Auth::user();
        if(!isset($currentUser->id) || $currentUser->id==""){
            $returnArr['status']=1;
            $returnArr['content']="";
            $returnArr['message']="Could not found the user.";
            return $returnArr;
        }

        $paginationLimit=10;
        if(isset($input['pagination_limit']) && $input['pagination_limit']!=""){
            $paginationLimit=$input['pagination_limit'];
        }

        $logedInUser=$currentUser->id;
        //$imageData=$this->userImages->orderby('updated_at', 'DESC')->paginate(20);
        $imageData=$this->userImages->join('users', 'user_images.user_id', '=', 'users.id')
        //->join('user_details', 'user_images.user_id', '=', 'user_details.user_id')
        ->leftJoin('image_ratings', function ($join) use ($logedInUser) {
            $join->on('user_images.id', '=', 'image_ratings.image_id')
                 ->where('image_ratings.user_id', $logedInUser);
        })
        ->leftJoin('user_rating_views', 'users.id', '=', 'user_rating_views.user_id')
        ->leftJoin('image_rating_views', 'user_images.id', '=', 'image_rating_views.image_id')
        ->where('user_images.status', '1')
        ->orderBy('user_images.id', 'desc')
        ->select('users.name as user_name', 'users.slug as user_slug', 'users.photo as user_profile_photo', 'users.total_followers as total_followers', 'user_rating_views.average_rating as user_rating', 'user_rating_views.total_number_of_photos as total_number_of_rated_photos', 'image_rating_views.average_rating as photo_rating', 'image_rating_views.total_number_of_users as total_number_of_rated_users', 'image_ratings.content_composition as content_composition_rating', 'image_ratings.image_quality as image_quality_rating', 'image_ratings.professionalism as professionalism_rating', 'image_ratings.excellent as excellent_rating', 'image_ratings.world_class as world_class_rating', 'user_images.*')
        ->paginate($paginationLimit);
        
        $dataArray=$imageData->toArray();
        if($dataArray){

            if(!empty($dataArray['data'])){
                foreach ($dataArray['data'] as $key => $val) {
                    $userReactionOnLike=0;
                    $getUserReactionData=$this->imageLikes->where('user_id', $currentUser->id)->where('image_id', $val['id'])->first();
                    if($getUserReactionData)
                        $userReactionOnLike=$getUserReactionData->status;

                    $dataArray['data'][$key]['is_liked']=$userReactionOnLike;

                    $isFollowing=0;
                    $usersFollowingData=$this->userFollowers->where('follower_user_id', $currentUser->id)->where('following_user_id', $val['user_id'])->first();
                    if($usersFollowingData)
                        $isFollowing=1;

                    $dataArray['data'][$key]['is_following']=$isFollowing;
                }
            }
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


    /**
     * Replaces spaces with full text search wildcards
     *
     * @param string $term
     * @return string
     */
    protected function fullTextWildcards($term)
    {
        // removing symbols used by MySQL
        $reservedSymbols = ['-', '+', '<', '>', '@', '(', ')', '~'];
        $term = str_replace($reservedSymbols, '', $term);

        $words = explode(' ', $term);

        foreach($words as $key => $word) {
            /*
             * applying + operator (required word) only big words
             * because smaller ones are not indexed by mysql
             */
            if(strlen($word) >= 3) {
                $words[$key] = '+' . $word . '*';
            }
        }

        $searchTerm = implode( ' ', $words);

        return $searchTerm;
    }


    /**
    * Fetch search data
    **/
    public function search(Request $request){
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

        $searchType="users";
        if(isset($input['search_type']) && $input['search_type'] !="")
            $searchType=$input['search_type'];

        switch ($searchType) {
            case "categories":
                /* Serach by category query start */
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
                ->where('user_images.status', '1');
                //->where('user_images.user_id', '=', $logedInUser)
                if(isset($input['search_query']) && $input['search_query']!=""){
                    $query=$query->whereRaw("MATCH(user_images.title,user_images.description) AGAINST(? IN BOOLEAN MODE)", array($input['search_query']));
                }
                if(isset($input['search_categories']) && $input['search_categories']!=""){
                    $trimedCategories=trim($input['search_categories']);
                    if($trimedCategories!="all"){
                        $cleanArr=explode(",", $trimedCategories);
                        $query=$query->where(function($q) use ($cleanArr){
                            foreach ($cleanArr as $key => $val) {
                                if($key==0)
                                {
                                    $q->where('user_images.categories', 'like', '%' . $val . '%');
                                }
                                else
                                {
                                    $q->orWhere('user_images.categories', 'like', '%' . $val . '%');
                                }
                            }
                        });
                    }else{
                        $categories=config('constants.categories');
                        $query=$query->where(function($q) use ($categories){
                            $catCnt=0;
                            foreach ($categories as $key => $val) {
                                if($catCnt==0)
                                {
                                    $q->where('user_images.categories', 'like', '%' . $val . '%');
                                }
                                else
                                {
                                    $q->orWhere('user_images.categories', 'like', '%' . $val . '%');
                                }
                                $catCnt++;
                            }
                        });
                    }
                }
                $query=$query->orderBy('image_rating_views.average_rating', 'desc')
                ->orderBy('user_images.id', 'desc')
                ->select('users.name as user_name', 'users.slug as user_slug', 'users.photo as user_profile_photo', 'users.city as user_city', 'users.country as user_country', 'users.total_followers as total_followers', 'user_rating_views.average_rating as user_rating', 'user_rating_views.total_number_of_photos as total_number_of_rated_photos', 'image_rating_views.average_rating as photo_rating', 'image_rating_views.total_number_of_users as total_number_of_rated_users', 'image_ratings.content_composition as content_composition_rating', 'image_ratings.image_quality as image_quality_rating', 'image_ratings.professionalism as professionalism_rating', 'image_ratings.excellent as excellent_rating', 'image_ratings.world_class as world_class_rating', 'image_likes.status as is_liked', DB::raw('(CASE WHEN user_followers.follower_user_id = '. $logedInUser .' THEN 1 ELSE 0 END) as is_following'), 'user_images.*');
                /* Serach by category query end */
                break;
            case "users":
                /* Serach by user query start */
                $query = $this->user->query();
                $query=$query->leftJoin('user_followers', function ($join) use ($logedInUser) {
                    $join->on('users.id', '=', 'user_followers.following_user_id')
                    ->where('user_followers.follower_user_id', $logedInUser);
                })
                ->leftJoin('user_rating_views', 'users.id', '=', 'user_rating_views.user_id');
                if(isset($input['search_query']) && $input['search_query']!=""){
                    $query=$query->whereRaw("MATCH(users.name,users.first_name,users.last_name) AGAINST(? IN BOOLEAN MODE)", array($input['search_query']));
                }
                $query=$query->orderBy('user_rating_views.average_rating', 'desc')
                ->orderBy('users.id', 'desc')
                ->select('users.id as id', 'users.slug as slug', 'users.name as name', 'users.photo as user_profile_photo', 'users.first_name as first_name', 'users.last_name as last_name', 'users.email as email', 'users.location as location', 'users.city as city', 'users.country as country', 'users.contact_number as contact_number', 'users.what_best_describes_you as what_best_describes_you', 'users.skills as skills', 'users.is_available_for_paid_photography as is_available_for_paid_photography', 'users.about_yourself as about_yourself', 'users.circle_photo as user_circle_photo', 'users.created_at as created_at', 'users.updated_at as updated_at', 'users.total_followers as total_followers', 'user_rating_views.average_rating as user_rating', 'user_rating_views.total_number_of_photos as total_number_of_rated_photos', DB::raw('(CASE WHEN user_followers.follower_user_id = '. $logedInUser .' THEN 1 ELSE 0 END) as is_following'));
                /* Serach by user query end */
                break;
            default:
                /* Serach by category query start */
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
                ->where('user_images.status', '1');
                //->where('user_images.user_id', '=', $logedInUser)
                if(isset($input['search_query']) && $input['search_query']!=""){
                    $query=$query->whereRaw("MATCH(user_images.title,user_images.description) AGAINST(? IN BOOLEAN MODE)", array($input['search_query']));
                }
                if(isset($input['search_categories']) && $input['search_categories']!=""){
                    $trimedCategories=trim($input['search_categories']);
                    if($trimedCategories!="all"){
                        $cleanArr=explode(",", $trimedCategories);
                        $query=$query->where(function($q) use ($cleanArr){
                            foreach ($cleanArr as $key => $val) {
                                if($key==0)
                                {
                                    $q->where('user_images.categories', 'like', '%' . $val . '%');
                                }
                                else
                                {
                                    $q->orWhere('user_images.categories', 'like', '%' . $val . '%');
                                }
                            }
                        });
                    }else{
                        $categories=config('constants.categories');
                        $query=$query->where(function($q) use ($categories){
                            $catCnt=0;
                            foreach ($categories as $key => $val) {
                                if($catCnt==0)
                                {
                                    $q->where('user_images.categories', 'like', '%' . $val . '%');
                                }
                                else
                                {
                                    $q->orWhere('user_images.categories', 'like', '%' . $val . '%');
                                }
                                $catCnt++;
                            }
                        });
                    }
                }
                $query=$query->orderBy('image_rating_views.average_rating', 'desc')
                ->orderBy('user_images.id', 'desc')
                ->select('users.name as user_name', 'users.slug as user_slug', 'users.photo as user_profile_photo', 'users.city as user_city', 'users.country as user_country', 'users.total_followers as total_followers', 'user_rating_views.average_rating as user_rating', 'user_rating_views.total_number_of_photos as total_number_of_rated_photos', 'image_rating_views.average_rating as photo_rating', 'image_rating_views.total_number_of_users as total_number_of_rated_users', 'image_ratings.content_composition as content_composition_rating', 'image_ratings.image_quality as image_quality_rating', 'image_ratings.professionalism as professionalism_rating', 'image_ratings.excellent as excellent_rating', 'image_ratings.world_class as world_class_rating', 'image_likes.status as is_liked', DB::raw('(CASE WHEN user_followers.follower_user_id = '. $logedInUser .' THEN 1 ELSE 0 END) as is_following'), 'user_images.*');
                /* Serach by category query end */
                break;
        }

        $imageData = $query->paginate($paginationLimit);
        $dataArray=$imageData->toArray();
        if($dataArray['data']){
            $response=[
                'data' => $dataArray['data'],
                'total' => $dataArray['total'],
                'limit' => $dataArray['per_page'],
                'search_type' => $searchType,
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
    * Get all categories
    **/
    public function getCategories(){
        $categories=config('constants.categories');
        if(isset($categories) && !empty($categories)){
            $returnArr['status']=2;
            $returnArr['content']=$categories;
            $returnArr['message']="Data fetched successfully.";
        }else{
            $returnArr['status']=4;
            $returnArr['content']="";
            $returnArr['message']="No data found.";
        }
        return $returnArr;
    }

    /**
    * Get all Photographer types
    **/
    public function getAllPhotographerTypes(){
        $photographerTypes=config('constants.photographer_types');
        if(isset($photographerTypes) && !empty($photographerTypes)){
            $returnArr['status']=2;
            $returnArr['content']=$photographerTypes;
            $returnArr['message']="Data fetched successfully.";
        }else{
            $returnArr['status']=4;
            $returnArr['content']="";
            $returnArr['message']="No data found.";
        }
        return $returnArr;
    }

    /**
    * Get all Photographer skills
    **/
    public function getPhotographersSkills(){
        $photographerSkills=config('constants.photographer_skills');
        if(isset($photographerSkills) && !empty($photographerSkills)){
            $returnArr['status']=2;
            $returnArr['content']=$photographerSkills;
            $returnArr['message']="Data fetched successfully.";
        }else{
            $returnArr['status']=4;
            $returnArr['content']="";
            $returnArr['message']="No data found.";
        }
        return $returnArr;
    }

    /**
    * Like Photo
    **/
    public function likePhoto(Request $request){
        $input=$request->all();

        $currentUser = \Auth::user();
        if(!isset($currentUser->id) || $currentUser->id==""){
            $returnArr['status']=1;
            $returnArr['content']="";
            $returnArr['message']="Could not found the user.";
            return $returnArr;
        }

        if(isset($input['image_id']) && $input['image_id'] != ""){
            $checkImageInDatabase=$this->userImages->find($input['image_id']);
            if (!$checkImageInDatabase) {
                $returnArr['status']=4;
                $returnArr['content']="";
                $returnArr['message']="Image not found in database.";
                return $returnArr;
            }

            $likedData=$this->imageLikes->where('user_id', $currentUser->id)->where('image_id', $input['image_id'])->first();
            if(!$likedData){

                $insertData['user_id']=$currentUser->id;
                $insertData['image_id']=$input['image_id'];
                $insertData['status']='1';
                $result=$this->imageLikes->create($insertData);

                $newLikesData=$checkImageInDatabase->total_likes+1;

                $updateData['total_likes']=$newLikesData;
                $updres=$this->userImages->where('id', $input['image_id'])->update($updateData);

                $updatedImageData=$this->userImages->find($input['image_id']);
                $updatedImageDataArray=$updatedImageData->toArray();
                $updatedImageDataArray['like_unlike_status']=1;
                if($updres){
                    $returnArr['status']=2;
                    $returnArr['content']=$updatedImageDataArray;
                    $returnArr['message']="Liked successfully.";
                }else{
                    $returnArr['status']=3;
                    $returnArr['content']="";
                    $returnArr['message']="Something went wrong! operation failed.";
                }

            }else{
                switch ($likedData->status) {
                    case "0":
                        $updateImageLikesData['status']='1';
                        $updImageLikesRes=$this->imageLikes->where('id', $likedData->id)->update($updateImageLikesData);

                        $newLikesData=$checkImageInDatabase->total_likes+1;

                        $updateData['total_likes']=$newLikesData;
                        $updres=$this->userImages->where('id', $input['image_id'])->update($updateData);

                        $updatedImageData=$this->userImages->find($input['image_id']);
                        $updatedImageDataArray=$updatedImageData->toArray();
                        $updatedImageDataArray['like_unlike_status']=1;
                        if($updres){
                            $returnArr['status']=2;
                            $returnArr['content']=$updatedImageDataArray;
                            $returnArr['message']="Liked successfully.";
                        }else{
                            $returnArr['status']=3;
                            $returnArr['content']="";
                            $returnArr['message']="Something went wrong! operation failed.";
                        }
                        break;
                    case "1":
                        $updateImageLikesData['status']='0';
                        $updImageLikesRes=$this->imageLikes->where('id', $likedData->id)->update($updateImageLikesData);
                        $newLikesData=$checkImageInDatabase->total_likes-1;
                        $updateData['total_likes']=$newLikesData;
                        $updres=$this->userImages->where('id', $input['image_id'])->update($updateData);

                        $updatedImageData=$this->userImages->find($input['image_id']);
                        $updatedImageDataArray=$updatedImageData->toArray();
                        $updatedImageDataArray['like_unlike_status']=0;
                        if($updres){
                            $returnArr['status']=2;
                            $returnArr['content']=$updatedImageDataArray;
                            $returnArr['message']="Unliked successfully.";
                        }else{
                            $returnArr['status']=3;
                            $returnArr['content']="";
                            $returnArr['message']="Something went wrong! operation failed.";
                        }
                        break;
                    default:
                        $returnArr['status']=3;
                        $returnArr['content']="";
                        $returnArr['message']="Something went wrong! operation failed.";
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
    * Follow user
    **/
    public function followUser(Request $request){
        $input=$request->all();

        $currentUser = \Auth::user();
        if(!isset($currentUser->id) || $currentUser->id==""){
            $returnArr['status']=1;
            $returnArr['content']="";
            $returnArr['message']="Could not found the user.";
            return $returnArr;
        }

        if(isset($input['following_user_id']) && $input['following_user_id'] != ""){

            $checkFollowingUserExistance=$this->user->find($input['following_user_id']);
            if(!$checkFollowingUserExistance){
                $returnArr['status']=4;
                $returnArr['content']="";
                $returnArr['message']="Could not found the user you want to follow.";
                return $returnArr;
            }

            if($input['following_user_id'] == $currentUser->id){
                $returnArr['status']=6;
                $returnArr['content']="";
                $returnArr['message']="You can not follow your self.";
                return $returnArr;
            }

            $followingData=$this->userFollowers->where('follower_user_id', $currentUser->id)->where('following_user_id', $input['following_user_id'])->first();
            if(!$followingData){

                $insertData['follower_user_id']=$currentUser->id;
                $insertData['following_user_id']=$input['following_user_id'];
                $result=$this->userFollowers->create($insertData);

                $newFollowersData=$checkFollowingUserExistance->total_followers+1;

                $updateData['total_followers']=$newFollowersData;
                $updres=$this->user->where('id', $input['following_user_id'])->update($updateData);

                $updatedFollowingUserData=$this->user->find($input['following_user_id']);
                if($updres){
                    $returnArr['status']=2;
                    $returnArr['content']=$updatedFollowingUserData;
                    $returnArr['message']="Followed successfully.";
                }else{
                    $returnArr['status']=3;
                    $returnArr['content']="";
                    $returnArr['message']="Something went wrong! operation failed.";
                }

            }else{
                $returnArr['status']=7;
                $returnArr['content']="";
                $returnArr['message']="You are already following this user.";
            }

        }else{
            $returnArr['status']=5;
            $returnArr['content']="";
            $returnArr['message']="Required data not provided.";
        }

        return $returnArr;
    }
    
}
