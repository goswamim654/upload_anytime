/* Loading photo data strat */
var photoId = getUrlParameter('id');
if(typeof photoId == "undefined" || photoId==""){
  photoId="";
}

/*Get Last Slug*/
var photoSlug=getUrlSlug(1); // parameter 1 is the position 1= last parameter, 2= second last parameter
if(typeof photoSlug == "undefined" || photoSlug=="" || photoSlug=="photo"){
  photoSlug="";
}

var request = $.ajax({
    url: BASE_URL+"live/public/api/v1/photo/details",
    headers: {
        "Authorization" : "Bearer "+token
    },
    type: "GET",
    data: {
    	'id' : photoSlug
    },
    beforeSend:function(){
        showLoader();
    },
    complete:function(jqXHR, status){
        hideLoader();
    }
});

request.done(function(response) {
  	var responseData = null;
  	try {
      	responseData = JSON.parse(response); 
  	} catch (e) {
      	responseData = response;
  	}

  	console.log(responseData);
  	var status = responseData.status;
  	var $this = $('#mainPhoto');
	switch (status) { 
		case 1: 
			var errorData=null;
	        var errorMsg="";
	        try {
	              errorData = JSON.parse(responseData.content); 
	        } catch (e) {
	              errorData = responseData.content;
	        }
	        $this.parent().addClass('photoContainerNoBefore');
	        $("#emptyMessage").html('<p>Sorry something went wrong! could not load the photo.</p>');
			$("#emptyMessage").removeClass('hidden');
			$("#wholeContainer").hide();
	        console.log("Status 1 : "+responseData);
			break;
		case 2: 
			$("#wholeContainer").removeClass('hidden');
			var successData = null;
	      	try {
	          	successData = JSON.parse(responseData.content.data); 
	      	} catch (e) {
	          	successData = responseData.content.data;
	      	}
	      	var photoRating=0;
	      	var userRating=0;
	      	var photoTitleText="N/A";
	      	var photoDescriptionText="N/A";
	      	var photoOwnerNameText="N/A";
	      	var userLocationText="";
	      	var userWhatBestDescribesYouText="N/A";
	      	var userProfilePhotoHtml='<img title="Profile photo not available" alt="Profile photo" src='+BASE_URL+'"live/public/thumbnail_upload/avatar.png">';
	      	var userIsAvailableForPaid='';
	      	var userSlug="";
	  		var photoSlug="";
	  		if(successData.user_slug !== null && successData.user_slug !=""){
	  			userSlug=successData.user_slug;
	  		}else{
	  			userSlug=successData.user_id;
	  		}
	  		if(successData.slug !== null && successData.slug !=""){
	  			photoSlug=successData.slug;
	  		}else{
	  			photoSlug=successData.id;
	  		}
	      	if(successData.title !== null && successData.title !=""){
	      		photoTitleText=successData.title;
	      	}
	      	if(successData.description !== null && successData.description !=""){
	      		photoDescriptionText=successData.description;
	      	}
	      	if(successData.user_name !== null && successData.user_name !=""){
	      		photoOwnerNameText=successData.user_name;
	      	}
	      	if(successData.user_city !== null && successData.user_city !=""){
	      		userLocationText+=successData.user_city+', ';
	      	}
	      	if(successData.user_country !== null && successData.user_country !=""){
	      		userLocationText+=successData.user_country;
	      	}
	      	if(userLocationText!=""){
	      		userLocationText=userLocationText.replace(/,\s*$/, "");
	      	}else{
	      		userLocationText="N/A";
	      	}
	      	if(successData.user_what_best_describes_you !== null && successData.user_what_best_describes_you !=""){
	      		userWhatBestDescribesYouText=successData.user_what_best_describes_you;
	      	}
	      	if(successData.user_profile_photo !== null && successData.user_profile_photo !=""){
	      		userProfilePhotoHtml='<img title="'+successData.user_name+'" alt="'+successData.user_name+'" src='+successData.user_profile_photo+'>';
	      	}
	      	if(successData.photo_rating !== null && successData.photo_rating !=""){
	  			photoRating=successData.photo_rating.toFixed(1);
	  		}
	  		if(successData.user_rating !== null && successData.user_rating !=""){
	  			userRating=successData.user_rating.toFixed(1);
	  		}
	  		if(successData.user_is_available_for_paid_photography == 1){
	      		// userIsAvailableForPaid='<span class="icon"><i class="fas fa-camera-alt"></i></span><p>Available for paid photography</p>';
	      		// $("#isAvailableForPaidContainer").html(userIsAvailableForPaid);
	      		$("#isAvailableForPaidText").html('Available for paid photography');
	      	}else{
	      		$("#isAvailableForPaidText").html('Not available for paid photography');
	      	}

	      	if(successData.is_following == 1){
	      		var followNProfileBtnHtml='<li id="followBtnContainer"><a data-container="body" data-toggle="tooltip" data-placement="bottom" title="You are following '+successData.user_name+'" class="btn btn-gray" href="javascript:void(0)">FOLLOWING</a></li>';
	      		followNProfileBtnHtml+='<li><a data-container="body" data-toggle="tooltip" data-placement="bottom" title="'+successData.user_name+'\'s profile" class="btn btn-gray" href="'+BASE_URL+'profile/'+userSlug+'">PROFILE</a></li>';
	      	}else{
	      		var followNProfileBtnHtml='<li id="followBtnContainer"><a data-container="body" data-toggle="tooltip" data-placement="bottom" title="Follow '+successData.user_name+'" onclick="photoDetailFollowUser('+successData.id+', '+successData.user_id+')" class="btn btn-gray" href="javascript:void(0)">FOLLOW</a></li>';
	      		followNProfileBtnHtml+='<li><a data-container="body" data-toggle="tooltip" data-placement="bottom" title="'+successData.user_name+'\'s profile" class="btn btn-gray" href="'+BASE_URL+'profile/'+userSlug+'">PROFILE</a></li>';
	      	}

	      	var shareNdownloadHtml='<li class="purple dropup">';
	      	shareNdownloadHtml+='	<a data-toggle="dropdown" href="#" id="shareMenu" class="dropdown-toggle"><i onclick="shareTooltipToggle(this)" data-toggle="tooltip" data-placement="top" title="Share" class="fas fa-share-alt share-toggle"></i></a>';
	      	shareNdownloadHtml+='	<ul class="dropdown-menu" id="shareMenu">';
	      	shareNdownloadHtml+='		<li><a class="social-share" href="https://www.facebook.com/sharer/sharer.php?u='+BASE_URL+'photo/'+photoSlug+'" target="_blank"><i class="fab fa-facebook-f facebook"></i></a></li>';
	      	shareNdownloadHtml+='		<li><a class="social-share" href="https://twitter.com/intent/tweet?url='+BASE_URL+'photo/'+photoSlug+'" target="_blank"><i class="fab fa-twitter twitter"></i></a></li>';
	      	shareNdownloadHtml+='		<li><a class="social-share" href="https://plus.google.com/share?url='+BASE_URL+'photo/'+photoSlug+'" target="_blank"><i class="fab fa-google-plus-g gplus"></i></a></li>';
	      	shareNdownloadHtml+='	</ul>';
	      	shareNdownloadHtml+='</li>';
	      	shareNdownloadHtml+='<li class="yellow">';
	      	shareNdownloadHtml+='	<a href="javascript:void(0)" onclick="photoDetailPrepareDownloadHref(this, '+successData.id+')" download=""><i data-toggle="tooltip" data-placement="top" title="Download" class="fas fa-download"></i></a>';
	      	shareNdownloadHtml+='</li>';

			$("#shareNdownloadContainer").html(shareNdownloadHtml);
	      	
	      	$("#followNProfileBtn").html(followNProfileBtnHtml);
	      	$this.attr('src', successData.image_medium);
	      	$("#photoTitle").html(photoTitleText);
	      	$("#photoDescription").html(photoDescriptionText);
	      	$("#photoOwnerName").html(photoOwnerNameText);
	      	$("#userPhoto").attr("href", BASE_URL+"profile/"+userSlug);
	      	$("#userPhoto").html(userProfilePhotoHtml);
	      	$("#userStarNumeric").html(userRating);
	      	$("#whatBestDescribesUser").html(userWhatBestDescribesYouText);
	      	$("#userLocation").html(userLocationText);


	      	var photoStarsHtml='<a id="photoStars'+successData.id+'" href="#" data-toggle="modal" data-target="#ratingModal'+successData.id+'">';
	      	photoStarsHtml+='		<span data-container="body" data-toggle="tooltip" data-placement="left" title="'+photoRating+' Stars, what\'s your take" id="starsDisplayContainer'+successData.id+'" class="pull-right">';
	        photoStarsHtml+='			<div id="stars'+successData.id+'"></div>';
	        photoStarsHtml+='		</span>';
	      	photoStarsHtml+='</a>';

	      	/* View Model Strat */
	  		photoStarsHtml+='			<div class="modal fade ratingModal" id="ratingModal'+successData.id+'" role="dialog">';
	  		photoStarsHtml+='				<div class="modal-dialog modal-sm">';
	  		photoStarsHtml+='					<div class="modal-content">';
	  		photoStarsHtml+='						<div class="modal-header">';
	  		photoStarsHtml+='							<button onclick="closeStarModal('+successData.id+')" type="button" class="close">&times;</button>';
	  		photoStarsHtml+='							<h4 class="modal-title">Give your valuable rating</h4>';
	  		photoStarsHtml+='						</div>';
	  		photoStarsHtml+='						<div class="modal-body">';
	  		photoStarsHtml+='							<p id="ratingModelMsgContainer'+successData.id+'" class="text-center hidden"></p>';
	  		photoStarsHtml+='							<table id="ratingModalTable'+successData.id+'">';
	  		photoStarsHtml+='								<tr>';
	  		photoStarsHtml+='									<td><h5>Content & Composition<h5></td>';
	  		photoStarsHtml+='									<td>';
	  		photoStarsHtml+='										<div id="content_composition_rating_'+successData.id+'"></div>';
	  		photoStarsHtml+='									</td>';
	  		photoStarsHtml+='								</tr>';
	  		photoStarsHtml+='								<tr>';
	  		photoStarsHtml+='									<td><h5>Image Quality<h5></td>';
	  		photoStarsHtml+='									<td>';
	  		photoStarsHtml+='										<div id="image_quality_rating_'+successData.id+'"></div>';
	  		photoStarsHtml+='									</td>';
	  		photoStarsHtml+='								</tr>';
	  		photoStarsHtml+='								<tr>';
	  		photoStarsHtml+='									<td><h5>Professionalism<h5></td>';
	  		photoStarsHtml+='									<td>';
	  		photoStarsHtml+='										<div id="professionalism_rating_'+successData.id+'"></div>';
	  		photoStarsHtml+='									</td>';
	  		photoStarsHtml+='								</tr>';
	  		photoStarsHtml+='								<tr>';
	  		photoStarsHtml+='									<td><h5>Excellent<h5></td>';
	  		photoStarsHtml+='									<td>';
	  		photoStarsHtml+='										<div id="excellent_rating_'+successData.id+'"></div>';
	  		photoStarsHtml+='									</td>';
	  		photoStarsHtml+='								</tr>';
	  		photoStarsHtml+='								<tr>';
	  		photoStarsHtml+='									<td><h5>World Class<h5></td>';
	  		photoStarsHtml+='									<td>';
	  		photoStarsHtml+='										<div id="world_class_rating_'+successData.id+'"></div>';
	  		photoStarsHtml+='									</td>';
	  		photoStarsHtml+='								</tr>';
	  		photoStarsHtml+='							</table>';
	  		photoStarsHtml+='						</div>';
	  		photoStarsHtml+='						<div class="modal-footer">';
	  		photoStarsHtml+='							<button onclick="closeStarModal('+successData.id+')" type="button" class="btn btn-default">Cancel</button>';
	  		photoStarsHtml+='							<button onclick="photoDetailSavePhotoRating('+successData.id+', '+successData.user_id+')" type="button" class="btn btn-success">Save</button>';
	  		photoStarsHtml+='						</div>';
	  		photoStarsHtml+='					</div>';
	  		photoStarsHtml+='				</div>';
	  		photoStarsHtml+='			</div>';
	  		/* View Model End */
	  		$("#photoRatingContainer").html(photoStarsHtml);
	  		/* Loding Photo's given stars start */
	      	$('#stars'+successData.id).rating({
		      size:20,                      //this option defines the size of the star
		      primaryColor:"none",         //this color code defines the primary color of stars
		      hoverColor:"#e44c3e",        //this color code defines the hover state of stars    
		      count:5,                      //defines the number of stars you want in a rater   
		      rate:photoRating,
		      scale:10,
			  readonly:"true",
			  borderColor: "#FFFFFF"    
		   	});
		   	/* Loding Photo's given stars end */

		   	/* Load Rating stars strat */
			$('#content_composition_rating_'+successData.id).rating({
		      size:20,                      //this option defines the size of the star
		      primaryColor:"none",         //this color code defines the primary color of stars
		      hoverColor:"#e44c3e",        //this color code defines the hover state of stars    
		      count:5,                      //defines the number of stars you want in a rater   
		      rate:successData.content_composition_rating,
		      scale:2,
			  readonly:"false",
			  borderColor:"#e44c3e"
		   	});
			$('#image_quality_rating_'+successData.id).rating({
		      size:20,                      //this option defines the size of the star
		      primaryColor:"none",         //this color code defines the primary color of stars
		      hoverColor:"#e44c3e",        //this color code defines the hover state of stars    
		      count:5,                      //defines the number of stars you want in a rater   
		      rate:successData.image_quality_rating,
		      scale:2,
			  readonly:"false",
			  borderColor:"#e44c3e"
		   	});
			$('#professionalism_rating_'+successData.id).rating({
		      size:20,                      //this option defines the size of the star
		      primaryColor:"none",         //this color code defines the primary color of stars
		      hoverColor:"#e44c3e",        //this color code defines the hover state of stars    
		      count:5,                      //defines the number of stars you want in a rater   
		      rate:successData.professionalism_rating,
		      scale:2,
			  readonly:"false",
			  borderColor:"#e44c3e"    
		   	});
			$('#excellent_rating_'+successData.id).rating({
		      size:20,                      //this option defines the size of the star
		      primaryColor:"none",         //this color code defines the primary color of stars
		      hoverColor:"#e44c3e",        //this color code defines the hover state of stars    
		      count:5,                      //defines the number of stars you want in a rater   
		      rate:successData.excellent_rating,
		      scale:2,
			  readonly:"false",
			  borderColor:"#e44c3e"   
		   	});
			$('#world_class_rating_'+successData.id).rating({
		      size:20,                      //this option defines the size of the star
		      primaryColor:"none",         //this color code defines the primary color of stars
		      hoverColor:"#e44c3e",        //this color code defines the hover state of stars    
		      count:5,                      //defines the number of stars you want in a rater   
		      rate:successData.world_class_rating,
		      scale:2,
			  readonly:"false",
			  borderColor:"#e44c3e"    
		   	});
			/* Load Rating stars end */

			/* Load User Rating stars start */
		   	$('#userStars').rating({
		      size:20,                      //this option defines the size of the star
		      primaryColor:"none",         //this color code defines the primary color of stars
		      hoverColor:"#e44c3e",        //this color code defines the hover state of stars    
		      count:5,                      //defines the number of stars you want in a rater   
		      rate:userRating,
		      scale:10,
			  readonly:"true",
			  borderColor:"#e44c3e"    
		   	});
		   	/* Load User Rating stars end */
		   	
	      	setTimeout(function () { 
		        var im = new Image();
		        im.src = $this.attr('src');
			    im.onload = function() {
			        $this.parent().addClass('photoContainerNoBefore');
			    };
		     }, 3000);


	      	/*Popular Photo Load section start*/
	      	$("#popularPhotoHeading").html("Popular snaps by "+successData.user_name);
	      	$.each( responseData.content.user_popular_photos, function( key, value ) {
				var rowData = null;
		      	try {
		          	rowData = JSON.parse(value); 
		      	} catch (e) {
		          	rowData = value;
		      	}
		      	if(rowData.id){
		      		var userSlugPopularPhoto="";
			  		var photoSlugPopularPhoto="";
			  		if(rowData.user_slug !== null && rowData.user_slug !=""){
			  			userSlugPopularPhoto=rowData.user_slug;
			  		}else{
			  			userSlugPopularPhoto=rowData.user_id;
			  		}
			  		if(rowData.slug !== null && rowData.slug !=""){
			  			photoSlugPopularPhoto=rowData.slug;
			  		}else{
			  			photoSlugPopularPhoto=rowData.id;
			  		}
			  		var popularPhotoHtml = '';
			  		popularPhotoHtml+= '<li class="popularPhotoBox">';
			  		popularPhotoHtml+= '	<a href="'+BASE_URL+'photo/'+photoSlugPopularPhoto+'"><img src="'+rowData.image_medium+'" class="popularPhoto" alt="'+rowData.title+'" title="'+rowData.title+'"></a>';
			  		popularPhotoHtml+= '</li>';

					$("#popularPhotoContainer").append(popularPhotoHtml);
			  	}else{
			  		console.log("Something went wrong with Popular photo : "+rowData);
			  	}
		    });
	      	/*Popular Photo Load section end*/

	      	/* Follower or top rated strat */

	      	if(responseData.content.user_followers !== null && responseData.content.user_followers !=""){

	      		$("#followersOrTopratedTitle").html(successData.user_name+'\'s Follower(s)');
	      		var followersOrTopRatedHtml = '<ul>';
	      		var cnt=1;
	      		$.each( responseData.content.user_followers, function( key, value ) {
					var rowData = null;
			      	try {
			          	rowData = JSON.parse(value); 
			      	} catch (e) {
			          	rowData = value;
			      	}
			      	if(rowData.id){
			      		var userSlugFollowersOrTopRated="";
				  		if(rowData.slug !== null && rowData.slug !=""){
				  			userSlugFollowersOrTopRated=rowData.slug;
				  		}else{
				  			userSlugFollowersOrTopRated=rowData.id;
				  		}
				  		followersOrTopRatedHtml+= '<li class="child-'+cnt+'">';
				  		followersOrTopRatedHtml+= '	<a href="'+BASE_URL+'profile/'+userSlugFollowersOrTopRated+'"><img src="'+rowData.user_profile_photo+'" class="popularPhoto" alt="'+rowData.name+'" title="'+rowData.name+'"></a>';
				  		followersOrTopRatedHtml+= '</li>';
				  	}else{
				  		console.log("Something went wrong with Follower photo : "+rowData);
				  	}
				  	cnt++;
			    });
			    followersOrTopRatedHtml+='<li class="followers-count-'+cnt+'">'+successData.total_followers+' Follower(s)</li>';
			    //followersOrTopRatedHtml+='<li onclick="getUserfollowers('+successData.user_id+')" class="view-all-btn">View all</li>';
			    followersOrTopRatedHtml+='<li class="view-all-btn">';
			    followersOrTopRatedHtml+='	<a title="View all" onclick="getUserfollowers('+successData.user_id+')" class="btn btn-gray" href="javascript:void(0)">VIEW All</a>';
			    followersOrTopRatedHtml+='</li>';
	      		followersOrTopRatedHtml+='</ul>';

	      		$("#followersOrTopratedContainer").html(followersOrTopRatedHtml);

	      	}else{
	      		$("#followersOrTopratedTitle").html('Top rated photographers');
	      		var followersOrTopRatedHtml = '<ul>';
	      		var cnt=1;
	      		$.each( responseData.content.top_rated_users, function( key, value ) {
	      			var userRating=0;
					var rowData = null;
			      	try {
			          	rowData = JSON.parse(value); 
			      	} catch (e) {
			          	rowData = value;
			      	}
			      	if(rowData.user_rating !== null && rowData.user_rating !=""){
			  			userRating=rowData.user_rating.toFixed(1);
			  		}
			      	if(rowData.id){
			      		var userSlugFollowersOrTopRated="";
				  		if(rowData.slug !== null && rowData.slug !=""){
				  			userSlugFollowersOrTopRated=rowData.slug;
				  		}else{
				  			userSlugFollowersOrTopRated=rowData.id;
				  		}
				  		followersOrTopRatedHtml+= '<li class="child-'+cnt+'">';
				  		followersOrTopRatedHtml+= '	<a href="'+BASE_URL+'profile/'+userSlugFollowersOrTopRated+'"><img src="'+rowData.user_profile_photo+'" class="popularPhoto" alt="'+rowData.name+'" title="'+rowData.name+' '+userRating+' Stars"></a>';
				  		followersOrTopRatedHtml+= '</li>';
				  	}else{
				  		console.log("Something went wrong with Top rated photographers photo : "+rowData);
				  	}
				  	cnt++;
			    });
			    followersOrTopRatedHtml+='<li class="view-all-btn">';
			    followersOrTopRatedHtml+='	<a title="View all" onclick="getTopRatedUsers()" class="btn btn-gray" href="javascript:void(0)">VIEW All</a>';
			    followersOrTopRatedHtml+='</li>';
	      		followersOrTopRatedHtml+= '</ul>';

	      		$("#followersOrTopratedContainer").html(followersOrTopRatedHtml);
	      	}
	      	/* Follower or top rated end */

	      	/* Check image load start*/
		    setTimeout(function () { 
		    var imgs = $(".popularPhotoBox img.popularPhoto");
		    $.each(imgs, function () {
		        var $this = $(this);
		        var im = new Image();
		        im.src = $this.attr('src') ;
			    im.onload = function() {
			        $this.parent().parent().addClass('popularPhotoBox-no-before');
			    };
		    }); }, 3000);
		    /* Check image load end*/


	      	$('[rel=tooltip]').tooltip({container: 'body'});
	      	$('[data-toggle="tooltip"]').tooltip();
	      	console.log(responseData);
			break;
		case 3: 
			$this.parent().addClass('photoContainerNoBefore');
			$("#emptyMessage").html('<p>Sorry something went wrong! could not load the photo.</p>');
			$("#emptyMessage").removeClass('hidden');
			$("#wholeContainer").hide();
			console.log(responseData.message);
			break;	
		case 4: 
			$this.parent().addClass('photoContainerNoBefore');
			$("#emptyMessage").html('<p>The photo you are requesting is not available.</p>');
			$("#emptyMessage").removeClass('hidden');
			$("#wholeContainer").hide();
			console.log(responseData.message);
			break;
		case 5: 
			$this.parent().addClass('photoContainerNoBefore');
			$("#emptyMessage").html('<p>The photo you are requesting may no longer available in our system or you are might using a wrong page url. please chcek again!</p>');
			$("#emptyMessage").removeClass('hidden');
			$("#wholeContainer").hide();
			console.log(responseData.message);
			break;	
		default:
			$this.parent().addClass('photoContainerNoBefore');
			$("#emptyMessage").html('<p>Sorry something went wrong! could not load the photo.</p>');
			$("#emptyMessage").removeClass('hidden');
			$("#wholeContainer").hide();
			console.log('Something went wrong! please try again later');
	}
});

request.fail(function(jqXHR, textStatus) {
  	var errorData = null;
  	try {
      	errorData = JSON.parse(jqXHR); 
  	} catch (e) {
      	errorData = jqXHR;
  	}
  	$this.parent().addClass('photoContainerNoBefore');
  	$("#emptyMessage").html('<p>Sorry something went wrong! could not load the photo.</p>');
	$("#emptyMessage").removeClass('hidden');
	$("#wholeContainer").hide();
  	console.log("Error : "+errorData);
});
/* Loading photo data end */


/**
*Close Photo rating modal START
**/
function closeStarModal(photoId){
	// setTimeout(function(){ 
		/*setTimeout(function () {
         	$("#ratingModelMsgContainer"+photoId).addClass('hidden');
            $("#ratingModelMsgContainer"+photoId).html('Loading..');
            $("#ratingModalTable"+photoId).removeClass('hidden');
         }, 0);*/
		$('#ratingModal'+photoId).delay(500).fadeOut('slow');
		setTimeout(function () {
             $('#ratingModal'+photoId).modal('hide');
         }, 1000);
	// }, 2000);
} 
/**
*Close Photo rating modal END
**/


var imagesPaginationLink=[];

/** 
* View all top rated Users 
**/
function getTopRatedUsers(){
	$('#viewAllModal').modal('show');
	$('#viewAllModalTitle').html('Top rated photographers');
	var isOpened=$('#isOpened').val();
	if(isOpened==""){
		$('#isOpened').val(1);
		var request = $.ajax({
		    url: BASE_URL+"live/public/api/v1/users/toprated",
		    headers: {
		        "Authorization" : "Bearer "+token
		    },
		    type: "GET",
		    data: {
		    	"pagination_limit" : 20
		    },
		    beforeSend:function(){
		        //showLoader();
		        //$('#signinErrorMsg').html('');
		    },
		    complete:function(jqXHR, status){
		        $("#viewAllLoading").addClass('hidden');
		    }
		});

		request.done(function(response) {
	      	var responseData = null;
	      	try {
	          	responseData = JSON.parse(response); 
	      	} catch (e) {
	          	responseData = response;
	      	}

	      	console.log(responseData);
	      	var status = responseData.status;
			switch (status) { 
				case 1: 
					console.log(responseData.message);
					break;
				case 2: 
					//alert('2');
					console.log(responseData.content.data);
					var loadMoreBtnHtml="";
					if(typeof responseData.content.pagination.next_page !== "undefined" && responseData.content.pagination.next_page != null){
						$("#next_page").val(responseData.content.pagination.next_page);
						loadMoreBtnHtml+='<div id="modalLoadMoreBtn" class="modalLoadMoreBtnContainer">';
						loadMoreBtnHtml+='	<a class="btn btn-block btn-default" onclick="loadMoreTopRatedUsers()" href="javascript:void(0)">LOAD MORE</a>';
						loadMoreBtnHtml+='</div>';
					}
					$.each( responseData.content.data, function( key, value ) {
						var rowData = null;
				      	try {
				          	rowData = JSON.parse(value); 
				      	} catch (e) {
				          	rowData = value;
				      	}
					  	if(rowData.id){
					  		var locationText="";
					    	var nameText="";
					    	var userRating=0;
					    	var userSlug="";
					  		if(rowData.slug !== null && rowData.slug !=""){
					  			userSlug=rowData.slug;
					  		}else{
					  			userSlug=rowData.id;
					  		}
					    	if(rowData.location !== null && rowData.location !=""){
					  			if (rowData.location.length > 15)
					  				locationText=rowData.location.substring(0,15) + '..';
					  			else
					  				locationText=rowData.location;
					  		}
					  		if(rowData.name !== null && rowData.name !=""){
					  			if (rowData.name.length >= 10)
					  				nameText=rowData.name.substring(0,10) + '..';
					  			else
					  				nameText=rowData.name;
					  		}
					  		if(rowData.user_rating !== null && rowData.user_rating !=""){
					  			userRating=rowData.user_rating.toFixed(1);
					  		}
					  		var html = '';
					  		html+= '<li>';
					  		html+= '	<div class="userThumbBox">';
					  		html+= '		<a href="'+BASE_URL+'profile/'+userSlug+'"><img class="userPhoto" src="'+rowData.user_profile_photo+'" alt="'+rowData.name+'" title="'+rowData.name+'"></a>';
					  		html+= '		<div class="usersDetails">';
					  		html+= '			<h4><a href="'+BASE_URL+'profile/'+userSlug+'" title="'+rowData.name+'">'+nameText+'</a></h4>';
					  		html+= '			<p title="'+userRating+' Stars">';
					  		html+= '				<span class="ratingNumeric">'+userRating+'</span>';
					  		html+= '				<span id="stars'+rowData.id+'"></span>';
					  		html+= '			</p>';
					  		html+= '		</div>';
					  		html+= '	</div>';
					  		html+= '</li>';

							$("#viewAllContainer").append(html);

							/* Loding user's stars start */
							$('#stars'+rowData.id).rating({
						      size:16,                      //this option defines the size of the star
						      primaryColor:"none",         //this color code defines the primary color of stars
						      hoverColor:"#e44c3e",        //this color code defines the hover state of stars    
						      count:5,                      //defines the number of stars you want in a rater   
						      rate:userRating,
						      scale:10,
		     				  readonly:"true",
			  				  borderColor:"#e44c3e"    
						   	});
							/* Loding user's stars end */
					  	}else{
					  		console.log("Something went wrong : "+rowData);
					  	}
					});

					$("#viewAllContainer").append(loadMoreBtnHtml);

					/* Check image load start*/
				    setTimeout(function () { 
				    var imgs = $(".userThumbBox img.userPhoto");
				    $.each(imgs, function () {
				        var $this = $(this);
				        var im = new Image();
				        im.src = $this.attr('src') ;
					    im.onload = function() {
					        $this.parent().parent().addClass('myPhotoBox-no-before');
					    };
				    }); }, 3000);
				    /* Check image load end*/
					break;
				case 3: 
					console.log(responseData.message);
					break;
				case 4: 
					console.log(responseData.message);
					break;
				case 5: 
					console.log(responseData.message);
					break;	
				default:
					console.log('Something went wrong! please try again later');
			}
	    });

		request.fail(function(jqXHR, textStatus) {
		  	var errorData = null;
		  	try {
		      	errorData = JSON.parse(jqXHR); 
		  	} catch (e) {
		      	errorData = jqXHR;
		  	}
		  	console.log("Error : "+errorData);
		});
	}
}

// Load more top rated users on click
function loadMoreTopRatedUsers(){
	$("#modalLoadMoreBtn").remove();
	var next_page=$("#next_page").val();
	if(next_page!=""){
		if($.inArray(next_page, imagesPaginationLink) == -1){
			imagesPaginationLink.push(next_page);
			console.log(imagesPaginationLink);

			/* Loading new followers in ajax start */
			var request = $.ajax({
		    url: next_page,
		    headers: {
		        "Authorization" : "Bearer "+token
		    },
		    type: "GET",
		    data: {
		    	"pagination_limit" : 20
		    },
		    beforeSend:function(){
		        //showLoader();
		        //$('#signinErrorMsg').html('');
		    },
		    complete:function(jqXHR, status){
		        //hideLoader();
		    }
	    });

	    request.done(function(response) {
	    	$("#next_page").val("");
	      	var responseData = null;
	      	try {
	          	responseData = JSON.parse(response); 
	      	} catch (e) {
	          	responseData = response;
	      	}

	      	//console.log(responseData);
	      	var status = responseData.status;
			switch (status) { 
				case 1: 
					console.log(responseData.message);
					break;
				case 2: 
					$.each( responseData.content.data, function( key, value ) {
						var rowData = null;
				      	try {
				          	rowData = JSON.parse(value); 
				      	} catch (e) {
				          	rowData = value;
				      	}
					  	if(rowData.id){
					  		var locationText="";
					    	var nameText="";
					    	var userRating=0;
					    	var userSlug="";
					  		if(rowData.slug !== null && rowData.slug !=""){
					  			userSlug=rowData.slug;
					  		}else{
					  			userSlug=rowData.id;
					  		}
					    	if(rowData.location !== null && rowData.location !=""){
					  			if (rowData.location.length > 15)
					  				locationText=rowData.location.substring(0,15) + '..';
					  			else
					  				locationText=rowData.location;
					  		}
					  		if(rowData.name !== null && rowData.name !=""){
					  			if (rowData.name.length >= 10)
					  				nameText=rowData.name.substring(0,10) + '..';
					  			else
					  				nameText=rowData.name;
					  		}
					  		if(rowData.user_rating !== null && rowData.user_rating !=""){
					  			userRating=rowData.user_rating.toFixed(1);
					  		}
					  		var html = '';
					  		html+= '<li>';
					  		html+= '	<div class="userThumbBox">';
					  		html+= '		<a href="'+BASE_URL+'profile/'+userSlug+'"><img class="userPhoto" src="'+rowData.user_profile_photo+'" alt="'+rowData.name+'" title="'+rowData.name+'"></a>';
					  		html+= '		<div class="usersDetails">';
					  		html+= '			<h4><a href="'+BASE_URL+'profile/'+userSlug+'" title="'+rowData.name+'">'+nameText+'</a></h4>';
					  		html+= '			<p title="'+userRating+' Stars">';
					  		html+= '				<span class="ratingNumeric">'+userRating+'</span>';
					  		html+= '				<span id="stars'+rowData.id+'"></span>';
					  		html+= '			</p>';
					  		html+= '		</div>';
					  		html+= '	</div>';
					  		html+= '</li>';

							$("#viewAllContainer").append(html);

							/* Loding user's stars start */
							$('#stars'+rowData.id).rating({
						      size:16,                      //this option defines the size of the star
						      primaryColor:"none",         //this color code defines the primary color of stars
						      hoverColor:"#e44c3e",        //this color code defines the hover state of stars    
						      count:5,                      //defines the number of stars you want in a rater   
						      rate:userRating,
						      scale:10,
		     				  readonly:"true",
			  				  borderColor:"#e44c3e"    
						   	});
							/* Loding user's stars end */
					  	}else{
					  		console.log("Something went wrong : "+rowData);
					  	}
					  	
					});
					/* Check image load start*/
				    setTimeout(function () { 
				    var imgs = $(".userThumbBox img.userPhoto");
				    $.each(imgs, function () {
				        var $this = $(this);
				        var im = new Image();
				        im.src = $this.attr('src') ;
					    im.onload = function() {
					        $this.parent().parent().addClass('myPhotoBox-no-before');
					    };
				    }); }, 3000);
				    /* Check image load end*/
				    var loadMoreBtnHtml="";
				    if(typeof responseData.content.pagination.next_page !== "undefined" && responseData.content.pagination.next_page != null){
						$("#next_page").val(responseData.content.pagination.next_page);
						loadMoreBtnHtml+='<div id="modalLoadMoreBtn" class="modalLoadMoreBtnContainer">';
						loadMoreBtnHtml+='	<a class="btn btn-block btn-default" onclick="loadMoreTopRatedUsers()" href="javascript:void(0)">LOAD MORE</a>';
						loadMoreBtnHtml+='</div>';
					}else{
						$("#next_page").val("");
					}
					$("#viewAllContainer").append(loadMoreBtnHtml);
					break;
				case 3: 
					console.log(responseData.message);
					break;
				case 4: 
					console.log(responseData.message);
					break;
				case 5: 
					console.log(responseData.message);
					break;	
				default:
					console.log('Something went wrong! please try again later');
			}
	    });

	    request.fail(function(jqXHR, textStatus) {
	      	var errorData = null;
	      	try {
	          	errorData = JSON.parse(jqXHR); 
	      	} catch (e) {
	          	errorData = jqXHR;
	      	}
	      	console.log("Error : "+errorData);
	    });
		/* Loading new followers in ajax end */
		}
	}
}


/**
* View all top rated Users end
**/



/**
* View all Followers strat
**/
function getUserfollowers(userId){
	$('#viewAllModal').modal('show');
	$('#viewAllModalTitle').html('All followers');
	var isOpened=$('#isOpened').val();
	if(isOpened==""){
		$('#isOpened').val(1);
		var request = $.ajax({
		    url: BASE_URL+"live/public/api/v1/users/followers",
		    headers: {
		        "Authorization" : "Bearer "+token
		    },
		    type: "GET",
		    data: {
		    	'user_id' : userId,
		    	"pagination_limit" : 20
		    },
		    beforeSend:function(){
		    },
		    complete:function(jqXHR, status){
		        $("#viewAllLoading").addClass('hidden');
		    }
		});

		request.done(function(response) {
	      	var responseData = null;
	      	try {
	          	responseData = JSON.parse(response); 
	      	} catch (e) {
	          	responseData = response;
	      	}

	      	console.log(responseData);
	      	var status = responseData.status;
			switch (status) { 
				case 1: 
					console.log(responseData.message);
					break;
				case 2: 
					//alert('2');
					console.log(responseData.content.data);
					var loadMoreBtnHtml="";
					if(typeof responseData.content.pagination.next_page !== "undefined" && responseData.content.pagination.next_page != null){
						$("#next_page").val(responseData.content.pagination.next_page);
						loadMoreBtnHtml+='<div id="modalLoadMoreBtn" class="modalLoadMoreBtnContainer">';
						loadMoreBtnHtml+='	<a class="btn btn-block btn-default" onclick="loadMoreFollowers('+userId+')" href="javascript:void(0)">LOAD MORE</a>';
						loadMoreBtnHtml+='</div>';
					}
					$.each( responseData.content.data, function( key, value ) {
						var rowData = null;
				      	try {
				          	rowData = JSON.parse(value); 
				      	} catch (e) {
				          	rowData = value;
				      	}
					  	if(rowData.id){
					  		var locationText="";
					    	var nameText="";
					    	var userSlug="";
					  		if(rowData.slug !== null && rowData.slug !=""){
					  			userSlug=rowData.slug;
					  		}else{
					  			userSlug=rowData.id;
					  		}
					    	if(rowData.location !== null && rowData.location !=""){
					  			if (rowData.location.length > 15)
					  				locationText=rowData.location.substring(0,15) + '..';
					  			else
					  				locationText=rowData.location;
					  		}
					  		if(rowData.name !== null && rowData.name !=""){
					  			if (rowData.name.length >= 10)
					  				nameText=rowData.name.substring(0,10) + '..';
					  			else
					  				nameText=rowData.name;
					  		}
					  		var html = '';
					  		html+= '<li>';
					  		html+= '	<div class="userThumbBox">';
					  		html+= '		<a href="'+BASE_URL+'profile/'+userSlug+'"><img class="userPhoto" src="'+rowData.user_profile_photo+'" alt="'+rowData.name+'" title="'+rowData.name+'"></a>';
					  		html+= '		<div class="usersDetails">';
					  		html+= '			<h4><a href="'+BASE_URL+'profile/'+userSlug+'" title="'+rowData.name+'">'+nameText+'</a></h4>';
					  		html+= '			<p title="'+rowData.location+'"><i>'+locationText+'</i></p>';
					  		html+= '		</div>';
					  		html+= '	</div>';
					  		html+= '</li>';

							$("#viewAllContainer").append(html);
					  	}else{
					  		console.log("Something went wrong : "+rowData);
					  	}
					  	
					});
					
					$("#viewAllContainer").append(loadMoreBtnHtml);

					/* Check image load start*/
				    setTimeout(function () { 
				    var imgs = $(".userThumbBox img.userPhoto");
				    $.each(imgs, function () {
				        var $this = $(this);
				        var im = new Image();
				        im.src = $this.attr('src') ;
					    im.onload = function() {
					        $this.parent().parent().addClass('myPhotoBox-no-before');
					    };
				    }); }, 3000);
				    /* Check image load end*/
					break;
				case 3: 
					console.log(responseData.message);
					break;
				case 4: 
					console.log(responseData.message);
					break;
				case 5: 
					console.log(responseData.message);
					break;	
				default:
					console.log('Something went wrong! please try again later');
			}
	    });

		request.fail(function(jqXHR, textStatus) {
		  	var errorData = null;
		  	try {
		      	errorData = JSON.parse(jqXHR); 
		  	} catch (e) {
		      	errorData = jqXHR;
		  	}
		  	console.log("Error : "+errorData);
		});
	}
}

// Load More followers onclick
function loadMoreFollowers(userId){
	$("#modalLoadMoreBtn").remove();
	var next_page=$("#next_page").val();
	if(next_page!=""){
		if($.inArray(next_page, imagesPaginationLink) == -1){
			imagesPaginationLink.push(next_page);
			console.log(imagesPaginationLink);

			/* Loading new followers in ajax start */
			var request = $.ajax({
		    url: next_page,
		    headers: {
		        "Authorization" : "Bearer "+token
		    },
		    type: "GET",
		    data: {
		    	'user_id' : userId,
		    	"pagination_limit" : 20
		    },
		    beforeSend:function(){
		        //showLoader();
		        //$('#signinErrorMsg').html('');
		    },
		    complete:function(jqXHR, status){
		        //hideLoader();
		    }
	    });

	    request.done(function(response) {
	    	$("#next_page").val("");
	      	var responseData = null;
	      	try {
	          	responseData = JSON.parse(response); 
	      	} catch (e) {
	          	responseData = response;
	      	}

	      	//console.log(responseData);
	      	var status = responseData.status;
			switch (status) { 
				case 1: 
					console.log(responseData.message);
					break;
				case 2: 
					$.each( responseData.content.data, function( key, value ) {
						var rowData = null;
				      	try {
				          	rowData = JSON.parse(value); 
				      	} catch (e) {
				          	rowData = value;
				      	}
					  	if(rowData.id){
					  		var locationText="";
					    	var nameText="";
					    	var userSlug="";
					  		if(rowData.slug !== null && rowData.slug !=""){
					  			userSlug=rowData.slug;
					  		}else{
					  			userSlug=rowData.id;
					  		}
					    	if(rowData.location !== null && rowData.location !=""){
					  			if (rowData.location.length > 15)
					  				locationText=rowData.location.substring(0,15) + '..';
					  			else
					  				locationText=rowData.location;
					  		}
					  		if(rowData.name !== null && rowData.name !=""){
					  			if (rowData.name.length >= 10)
					  				nameText=rowData.name.substring(0,10) + '..';
					  			else
					  				nameText=rowData.name;
					  		}
					  		var html = '';
					  		html+= '<li>';
					  		html+= '	<div class="userThumbBox">';
					  		html+= '		<a href="'+BASE_URL+'profile/'+userSlug+'"><img class="userPhoto" src="'+rowData.user_profile_photo+'" alt="'+rowData.name+'" title="'+rowData.name+'"></a>';
					  		html+= '		<div class="usersDetails">';
					  		html+= '			<h4><a href="'+BASE_URL+'profile/'+userSlug+'" title="'+rowData.name+'">'+nameText+'</a></h4>';
					  		html+= '			<p title="'+rowData.location+'"><i>'+locationText+'</i></p>';
					  		html+= '		</div>';
					  		html+= '	</div>';
					  		html+= '</li>';

							$("#viewAllContainer").append(html);
					  	}else{
					  		console.log("Something went wrong : "+rowData);
					  	}
					  	
					});
					/* Check image load start*/
				    setTimeout(function () { 
				    var imgs = $(".userThumbBox img.userPhoto");
				    $.each(imgs, function () {
				        var $this = $(this);
				        var im = new Image();
				        im.src = $this.attr('src') ;
					    im.onload = function() {
					        $this.parent().parent().addClass('myPhotoBox-no-before');
					    };
				    }); }, 3000);
				    /* Check image load end*/
				    var loadMoreBtnHtml="";
				    if(typeof responseData.content.pagination.next_page !== "undefined" && responseData.content.pagination.next_page != null){
						$("#next_page").val(responseData.content.pagination.next_page);
						loadMoreBtnHtml+='<div id="modalLoadMoreBtn" class="modalLoadMoreBtnContainer">';
						loadMoreBtnHtml+='	<a class="btn btn-block btn-default" onclick="loadMoreFollowers('+userId+')" href="javascript:void(0)">LOAD MORE</a>';
						loadMoreBtnHtml+='</div>';
					}else{
						$("#next_page").val("");
					}
					$("#viewAllContainer").append(loadMoreBtnHtml);
					break;
				case 3: 
					console.log(responseData.message);
					break;
				case 4: 
					console.log(responseData.message);
					break;
				case 5: 
					console.log(responseData.message);
					break;	
				default:
					console.log('Something went wrong! please try again later');
			}
	    });

	    request.fail(function(jqXHR, textStatus) {
	      	var errorData = null;
	      	try {
	          	errorData = JSON.parse(jqXHR); 
	      	} catch (e) {
	          	errorData = jqXHR;
	      	}
	      	console.log("Error : "+errorData);
	    });
		/* Loading new followers in ajax end */
		}
	}
}
/**
* View all Followers end
**/


/**
* Photo fullscreen view Maximize/Minimize on click strat
**/
function getreqfullscreen(){
    var root = document.documentElement
    return root.requestFullscreen || root.webkitRequestFullscreen || root.mozRequestFullScreen || root.msRequestFullscreen
}

function getfullscreenelement(){
    return document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement
}

function getexitfullscreen(){
    return document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen
}

var globalreqfullscreen = getreqfullscreen() // get supported version of requestFullscreen()
var globalexitfullscreen = getexitfullscreen() // get supported version of document.exitFullscreen()

document.addEventListener('click', function(e){
  /* Adding share icon tooltip which gets on it's own click satrt */
  if(!$('.share-toggle').parents('.open').length){
    $('.share-toggle').attr("data-original-title", "Share");
    //$('.share-toggle').parent().children('.tooltip').show();
  }
  /* Adding share icon tooltip which gets on it's own click end */
  var target = e.target
    if (target.tagName == "IMG" && target.classList.contains('setImage')){
      if (getfullscreenelement() == null){ // if browser is currently not in full screen
          //globalreqfullscreen.call(target)
      }
      else{
        e.preventDefault();
          globalexitfullscreen.call(document)
      }
    }
}, false)

function maximize(id){
  //alert(11);
  var featuredimg = document.getElementById("mainPhoto");
  if (getfullscreenelement() == null){ // if browser is currently not in full screen
        globalreqfullscreen.call(featuredimg)
    }
    else{
        globalexitfullscreen.call(document)
    }
}
/**
* Photo fullscreen view Maximize/Minimize on click end
**/


/**
* follow user Strat 
**/
function photoDetailFollowUser(id, userId){
	//alert(id);
	var request = $.ajax({
	    url: BASE_URL+"live/public/api/v1/follow/user",
	    headers: {
	        "Authorization" : "Bearer "+token
	    },
	    type: "POST",
	    data: {
	    	"following_user_id" : userId
	    },
	    beforeSend:function(){
	        //showLoader();
	        //$('#signinErrorMsg').html('');
	    },
	    complete:function(jqXHR, status){
	        //hideLoader();
	    }
    });

    request.done(function(response) {
      	var responseData = null;
      	try {
          	responseData = JSON.parse(response); 
      	} catch (e) {
          	responseData = response;
      	}

      	//console.log(responseData);
      	var status = responseData.status;
		switch (status) { 
			case 1: 
				console.log(responseData.message);
				break;
			case 2:
				console.log(responseData.content);
				$("#followBtnContainer").html('<a data-container="body" data-toggle="tooltip" data-placement="bottom" title="You are following '+responseData.content.name+'" class="btn btn-gray" href="javascript:void(0)">FOLLOWING</a>');
				//$('[rel=tooltip]').tooltip({container: 'body'});
				$('[data-toggle="tooltip"]').tooltip();
				break;
			case 3: 
				console.log(responseData.message);
				break;
			case 4: 
				console.log(responseData.message);
				break;
			case 5: 
				console.log(responseData.message);
				break;	
			case 6: 
				$("#followBtnContainer").html('<a data-container="body" data-toggle="tooltip" data-placement="bottom" title="You can not follow yourself" class="btn btn-gray" href="javascript:void(0)">FOLLOW</a>');
				//$('[rel=tooltip]').tooltip({container: 'body'});
				$('[data-toggle="tooltip"]').tooltip();
				break;
			case 7: 
				("#followBtnContainer").html('<a data-container="body" data-toggle="tooltip" data-placement="bottom" title="You are following '+responseData.content.name+'" class="btn btn-gray" href="javascript:void(0)">FOLLOWING</a>');
				//$('[rel=tooltip]').tooltip({container: 'body'});
				$('[data-toggle="tooltip"]').tooltip();
				break;	
			default:
				console.log('Something went wrong! please try again later');
		}
    });

    request.fail(function(jqXHR, textStatus) {
      	var errorData = null;
      	try {
          	errorData = JSON.parse(jqXHR); 
      	} catch (e) {
          	errorData = jqXHR;
      	}
      	console.log("Error : "+errorData);
    });
}
/**
* follow user End 
**/


/**
* Shareing popup Window script strat
**/
var popupSize = {
    width: 780,
    height: 550
};

$(document).on('click', '.social-share', function(e){

    var
        verticalPos = Math.floor(($(window).width() - popupSize.width) / 2),
        horisontalPos = Math.floor(($(window).height() - popupSize.height) / 2);

    var popup = window.open($(this).prop('href'), 'social',
        'width='+popupSize.width+',height='+popupSize.height+
        ',left='+verticalPos+',top='+horisontalPos+
        ',location=0,menubar=0,toolbar=0,status=0,scrollbars=1,resizable=1');

    if (popup) {
        popup.focus();
        e.preventDefault();
    }

});
/**
* Shareing popup Window script end
**/


/**
* Download image script with HTML5 Start
**/
function photoDetailPrepareDownloadHref(el, id){
    el.href = $('#mainPhoto').attr('src');
}
/**
* Download image script with HTML5 end
**/



/**
* Save photo rating STRAT
**/
function photoDetailSavePhotoRating(photoId, userId){
  var content_composition_rating="",
  image_quality_rating="",
  professionalism_rating="",
  excellent_rating="",
  world_class_rating="";
  
  if($('#content_composition_rating_'+photoId).children('.simple-rater-holder').length > 0){
    content_composition_rating_pre=$('#content_composition_rating_'+photoId).children('.simple-rater-holder').attr('data-selected');
    if(typeof content_composition_rating_pre !== "undefined" && content_composition_rating_pre!=""){
      if(content_composition_rating_pre > 5){
        content_composition_rating=5;
      }else{
        content_composition_rating=content_composition_rating_pre;
      }
    }
  }
  if($('#image_quality_rating_'+photoId).children('.simple-rater-holder').length > 0){
    image_quality_rating_pre=$('#image_quality_rating_'+photoId).children('.simple-rater-holder').attr('data-selected');
    if(typeof image_quality_rating_pre !== "undefined" && image_quality_rating_pre!=""){
      if(image_quality_rating_pre > 5){
        image_quality_rating=5;
      }else{
        image_quality_rating=image_quality_rating_pre;
      }
    }
  }
  if($('#professionalism_rating_'+photoId).children('.simple-rater-holder').length > 0){
    professionalism_rating_pre=$('#professionalism_rating_'+photoId).children('.simple-rater-holder').attr('data-selected');
    if(typeof professionalism_rating_pre !== "undefined" && professionalism_rating_pre!=""){
      if(professionalism_rating_pre > 5){
        professionalism_rating=5;
      }else{
        professionalism_rating=professionalism_rating_pre;
      }
    }
  }
  if($('#excellent_rating_'+photoId).children('.simple-rater-holder').length > 0){
    excellent_rating_pre=$('#excellent_rating_'+photoId).children('.simple-rater-holder').attr('data-selected');
    if(typeof excellent_rating_pre !== "undefined" && excellent_rating_pre!=""){
      if(excellent_rating_pre > 5){
        excellent_rating=5;
      }else{
        excellent_rating=excellent_rating_pre;
      }
    }
  }
  if($('#world_class_rating_'+photoId).children('.simple-rater-holder').length > 0){
    world_class_rating_pre=$('#world_class_rating_'+photoId).children('.simple-rater-holder').attr('data-selected');
    if(typeof world_class_rating_pre !== "undefined" && world_class_rating_pre!=""){
      if(world_class_rating_pre > 5){
        world_class_rating=5;
      }else{
        world_class_rating=world_class_rating_pre;  
      }
    }
  }

  var request = $.ajax({
      url: BASE_URL+"live/public/api/v1/photo/save-ratings",
      headers: {
          "Authorization" : "Bearer "+token
      },
      type: "POST",
      data: {
          'photo_id' : photoId,
          'photo_owner_id' : userId,
          'content_composition_rating' : content_composition_rating,
          'image_quality_rating' : image_quality_rating,
          'professionalism_rating' : professionalism_rating,
          'excellent_rating' : excellent_rating,
          'world_class_rating' : world_class_rating,
      },
      beforeSend:function(){
          	$("#ratingModalTable"+photoId).addClass('hidden');
	        $("#ratingModelMsgContainer"+photoId).html('Loading..');
	        $("#ratingModelMsgContainer"+photoId).removeClass('hidden');
      },
      complete:function(jqXHR, status){
          //hideLoader();
      }
    });

    request.done(function(response) {
        var responseData = null;
        try {
            responseData = JSON.parse(response); 
        } catch (e) {
            responseData = response;
        }

        console.log(responseData);
        var status = responseData.status;
    switch (status) { 
      case 1: 
        $("#ratingModelMsgContainer"+photoId).html("Could not store your ratings. Plaease try again later.");
		setTimeout(function(){ 
			setTimeout(function () {
             	$("#ratingModelMsgContainer"+photoId).addClass('hidden');
                $("#ratingModelMsgContainer"+photoId).html('Loading..');
                $("#ratingModalTable"+photoId).removeClass('hidden');
             }, 0);
		}, 2000);
        break;
      case 2: 
        var successData = null;
            try {
                successData = JSON.parse(responseData.content); 
            } catch (e) {
                successData = responseData.content;
            }
            var newTitleRating=successData.photo_rating.toFixed(1);
            var html='<span data-container="body" data-toggle="tooltip" data-placement="left" title="'+newTitleRating+' Stars, what\'s your take" id="starsDisplayContainer'+photoId+'" class="pull-right">';
          	html+=' <div id="stars'+photoId+'"></div>';
          	html+='</span>';
            //var html='<span data-container="body" data-toggle="tooltip" data-placement="left" title="'+newTitleRating+' Stars, what\'s your take" id="stars'+photoId+'" class="stars">'+newTitleRating+'</span>';
            //$('#stars'+photoId).attr('data-original-title', 'hello');
            $('#photoStars'+photoId).html(html);
            // Loding Photo's given stars start 
	        //$('#stars'+photoId).stars();
	        $('[data-toggle="tooltip"]').tooltip();
	        $('#stars'+photoId).rating({
	            size:20,                      //this option defines the size of the star
	            primaryColor:"none",         //this color code defines the primary color of stars
	            hoverColor:"#e44c3e",        //this color code defines the hover state of stars    
	            count:5,                      //defines the number of stars you want in a rater   
	            rate:newTitleRating,
	            scale:10,
	            readonly:"true",
				borderColor:"#FFFFFF"    
	        });
	        // Loding Photo's given stars end 
            $("#ratingModelMsgContainer"+photoId).html("Thank you, your ratings stored successfully.");
			setTimeout(function(){ 
				setTimeout(function () {
                 	$("#ratingModelMsgContainer"+photoId).addClass('hidden');
                    $("#ratingModelMsgContainer"+photoId).html('Loading..');
                    $("#ratingModalTable"+photoId).removeClass('hidden');
                 }, 0);
				$('#ratingModal'+photoId).delay(400).fadeOut('slow');
				setTimeout(function () {
                     $('#ratingModal'+photoId).modal('hide');
                 }, 1000);
			}, 2000);
        break;
      case 3: 
        $("#ratingModelMsgContainer"+photoId).html("Could not store your ratings. Plaease try again later.");
		setTimeout(function(){ 
			setTimeout(function () {
             	$("#ratingModelMsgContainer"+photoId).addClass('hidden');
                $("#ratingModelMsgContainer"+photoId).html('Loading..');
                $("#ratingModalTable"+photoId).removeClass('hidden');
             }, 0);
		}, 2000);
        break;  
      case 4: 
        setTimeout(function(){ 
			setTimeout(function () {
             	$("#ratingModelMsgContainer"+photoId).addClass('hidden');
                $("#ratingModelMsgContainer"+photoId).html('Loading..');
                $("#ratingModalTable"+photoId).removeClass('hidden');
             }, 0);
		}, 2000);
        break;  
      case 5: 
        $("#ratingModelMsgContainer"+photoId).html("Could not store your ratings. Plaease try again later.");
		setTimeout(function(){ 
			setTimeout(function () {
             	$("#ratingModelMsgContainer"+photoId).addClass('hidden');
                $("#ratingModelMsgContainer"+photoId).html('Loading..');
                $("#ratingModalTable"+photoId).removeClass('hidden');
             }, 0);
		}, 2000);
        break;  
      default:
        $("#ratingModelMsgContainer"+photoId).html("Could not store your ratings. Plaease try again later.");
		setTimeout(function(){ 
			setTimeout(function () {
             	$("#ratingModelMsgContainer"+photoId).addClass('hidden');
                $("#ratingModelMsgContainer"+photoId).html('Loading..');
                $("#ratingModalTable"+photoId).removeClass('hidden');
             }, 0);
		}, 2000);
    }
    });

    request.fail(function(jqXHR, textStatus) {
        var errorData = null;
        try {
            errorData = JSON.parse(jqXHR); 
        } catch (e) {
            errorData = jqXHR;
        }
        console.log("Error : "+errorData);
    });
}
/**
* Save photo rating END
**/

