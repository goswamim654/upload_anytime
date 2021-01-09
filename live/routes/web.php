<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It is a breeze. Simply tell Lumen the URIs it should respond to
| and give it the Closure to call when that URI is requested.
|
*/

$router->get('/', function () use ($router) {
    return $router->app->version();
});

$api=app("Dingo\Api\Routing\Router");

$api->version('v1', ['prefix' => 'api/v1'], function($api){
	
	$api->group(['prefix' => 'oauth'], function($api){
		$api->post('token', '\Laravel\Passport\Http\Controllers\AccessTokenController@issueToken');
		$api->post('uses', '\App\Http\Controllers\Auth\CustomAccessTokenController@issueUserToken');

		$api->get('tokens', '\Laravel\Passport\Http\Controllers\AuthorizedAccessTokenController@forUser');

		$api->get('clients', '\Laravel\Passport\Http\Controllers\ClientController@forUser');
	});

	//Routes that can only be access by admin users
	$api->group(['namespace' => 'App\Http\Controllers\V1', 'middleware' => ['auth:admin', 'cors']], function($api){
		$api->get('admin/details', 'AdminHomeController@getAdminDetails');
		$api->get('admin/home', 'AdminHomeController@home');
		$api->post('admin/photo/approve', 'AdminHomeController@approvePhoto');
		$api->post('admin/photo/decline', 'AdminHomeController@declinePhoto');
		$api->post('admin/photo/delete', 'AdminHomeController@deletePhoto');
		//$api->get('admin/token-user-id', 'AdminHomeController@getTokenUser');
		
	});


	//Routes that can only be access with Authentication
	$api->group(['namespace' => 'App\Http\Controllers\V1', 'middleware' => ['auth:api', 'cors']], function($api){
		//Controller route
		$api->get('users', 'UserController@index');
		$api->post('users/image-upload', 'UserController@imageUpload');
		$api->get('users/less-detailed-images', 'UserController@getUsersLessDetailedImages');
		$api->post('users/store-image-details', 'UserController@storeUsersImageDetails');
		$api->get('users/last-updated-image', 'UserController@getUsersLastUpDatedImage');
		$api->get('users/images', 'UserController@getUserImages');
		$api->get('users/details', 'UserController@getUserDetails');
		$api->get('logedin-user-info', 'UserController@logedinUserInfo');
		//$api->get('logedin-user', 'UserController@getTokenUser');


		$api->get('home/images', 'HomeController@getAllImages');
		$api->post('image/like-unlike', 'HomeController@likePhoto');
		$api->post('follow/user', 'HomeController@followUser');
		
		$api->post('users/profile/update', 'UserController@userProfileUpdate');
		$api->post('users/profile/upload-square-image', 'UserController@uploadProfileSquareImage');
		$api->post('users/change-password', 'UserController@changePassword');

		$api->get('photo/details', 'PhotoController@getPhotoDetails');
		$api->post('photo/save-ratings', 'PhotoController@savePhotoRating');
		
		$api->post('search', 'HomeController@search');
		
		$api->get('users/popular-photos', 'PhotoController@getUserPopularPhotos');
		$api->get('users/followers', 'UserController@getUserFollowers');
		$api->get('users/followings', 'UserController@getUserFollowings');
		$api->get('users/toprated', 'UserController@getTopRatedUsers');
		
		$api->get('users/profile', 'UserController@getUserProfileInfo');
		$api->post('users/photo/delete', 'PhotoController@deleteUserPhotos');
		$api->get('users/photo/edit', 'PhotoController@editUserPhotos');
		$api->post('users/photo/update', 'PhotoController@updateUserPhotos');
	});

	//Routes that can be access without Authentication
	$api->group(['namespace' => 'App\Http\Controllers\V1'], function($api){

		$api->post('users/register', 'UserController@store');
		$api->post('login', 'UserController@login');
		$api->post('users/send-reset-password-link', 'UserController@sendResetPasswordLink');
		$api->post('users/reset-password', 'UserController@resetPassword');
		//$api->post('facebook-users', 'UserController@facebookUsers');
		// $api->get('twitter-login-url', 'TwitterAuthController@getUrl');
		// $api->post('twitter-user-information', 'TwitterAuthController@getTwitterUserInformation');
		$api->get('login/twitter', 'Auth\LoginController@redirectToTwitter');
		$api->get('login/twitter/callback', 'Auth\LoginController@handleTwitterCallback');
		$api->post('login/twitter/android', 'Auth\LoginController@handleTwillerAndroidCallback');

		$api->get('login/facebook', 'Auth\LoginController@redirectToFacebook');
		$api->get('login/facebook/callback', 'Auth\LoginController@handleFacebookCallback');
		$api->post('login/facebook/android', 'Auth\LoginController@handleFacebookAndroidCallback');

		$api->get('categories', 'HomeController@getCategories');
		$api->get('types-of-photographers', 'HomeController@getAllPhotographerTypes');
		$api->get('photographer-skills', 'HomeController@getPhotographersSkills');
		
		$api->post('save/collage', 'UserController@saveCollageImage');


		/*Admin Routes Start */
		$api->post('admin/login', 'AdminHomeController@login');
		$api->get('test/mail', 'AdminHomeController@testMail');
		/*Admin Routes End */


		
	
	});
	
});