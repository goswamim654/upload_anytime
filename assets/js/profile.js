/**
* Loade Profile Page Data START
**/
var userId = getUrlParameter('id');
if(typeof userId == "undefined" || userId==""){
  userId="";
}

/*Get Last Slug*/
var userSlug=getUrlSlug(1); // parameter 1 is the position 1= last parameter, 2= second last parameter
if(typeof userSlug == "undefined" || userSlug=="" || userSlug=="profile"){
  userSlug="";
}
console.log("SLUG : "+userSlug);

var imagesPaginationLink=[];
var followersPaginationLink=[];
var followingsPaginationLink=[];
$(document).ready(function () {
	var request = $.ajax({
	    url: BASE_URL+"live/public/api/v1/users/profile",
	    headers: {
	        "Authorization" : "Bearer "+token
	    },
	    type: "GET",
	    data: {
	    	"user_id" : userSlug
	    },
	    beforeSend:function(){
	        showLoader();
	        //$('#signinErrorMsg').html('');
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
		switch (status) { 
			case 1: 
				console.log(responseData.message);
				break;
			case 2: 
				console.log(responseData.content.data);
				var rowData = null;
		      	try {
		          	rowData = JSON.parse(responseData.content.data); 
		      	} catch (e) {
		          	rowData = responseData.content.data;
		      	}
		      	var userRating=0;
		      	var aboutYourselfText="N/A";
		      	var locationText="";
		      	var whatBestDescribesYouText="N/A";
		      	var skillsText="N/A";
		      	var isAvailableForPaidPhotographyText="Not available for paid photography";

		      	if(rowData.about_yourself !== null && rowData.about_yourself !=""){
		      		aboutYourselfText=rowData.about_yourself;
		      	}
		      	if(rowData.city !== null && rowData.city !=""){
		      		locationText+=rowData.city+', ';
		      	}
		      	if(rowData.country !== null && rowData.country !=""){
		      		locationText+=rowData.country;
		      	}
		      	if(locationText!=""){
		      		locationText=locationText.replace(/,\s*$/, "");
		      	}else{
		      		locationText="N/A";
		      	}
		      	if(rowData.what_best_describes_you !== null && rowData.what_best_describes_you !=""){
		      		whatBestDescribesYouText=rowData.what_best_describes_you;
		      	}
		      	if(rowData.skills !== null && rowData.skills !=""){
		      		skillsText=rowData.skills;
		      	}
		      	if(rowData.is_available_for_paid_photography !== null && rowData.is_available_for_paid_photography !="" && rowData.is_available_for_paid_photography == "1"){
		      		isAvailableForPaidPhotographyText="Available for paid photography";
		      	}
		      	if(rowData.user_rating !== null && rowData.user_rating !=""){
		  			userRating=rowData.user_rating.toFixed(1);
		  		}


		  		$("#snapsWholeContainer").removeClass('hidden');
				var profileInfoLeftContainerHtml="";
				var profileInfoRightHalfContainerHtml="";

				profileInfoLeftContainerHtml+='	<div class="profilePhotoBox profilePicContainer profileView">';
				profileInfoLeftContainerHtml+='		<img class="profilePhoto" src="'+rowData.user_profile_photo+'" alt="'+rowData.name+'" title="'+rowData.name+'">';
				profileInfoLeftContainerHtml+='		<div class="uploadBtnContainer">';
				profileInfoLeftContainerHtml+='			<div class="btn btn-white">Follow '+rowData.name+'</div>';
				profileInfoLeftContainerHtml+='		</div>';
				profileInfoLeftContainerHtml+='	</div>';
				profileInfoLeftContainerHtml+='	<div class="aboutContainer">';
				profileInfoLeftContainerHtml+='		<h3>About</h3>';
				profileInfoLeftContainerHtml+='		<p>'+aboutYourselfText+'</p>';
				profileInfoLeftContainerHtml+='	</div>';
				profileInfoLeftContainerHtml+='	<div class="socialInfoConatiner">';
				profileInfoLeftContainerHtml+='		<ul>';
				profileInfoLeftContainerHtml+='			<li>';
				profileInfoLeftContainerHtml+='				<div class="pull-left"><a href="javascript:void(0)" onclick="allFollowers('+rowData.id+')">FOLLOWERS</a></div>';
				profileInfoLeftContainerHtml+='				<div class="pull-right"><strong>'+rowData.total_followers+'</strong></div>';
				profileInfoLeftContainerHtml+='			</li>';
				profileInfoLeftContainerHtml+='			<li>';
				profileInfoLeftContainerHtml+='				<div class="pull-left"><a href="javascript:void(0)" onclick="allFollowings('+rowData.id+')">FOLLOWING</a></div>';
				profileInfoLeftContainerHtml+='				<div class="pull-right"><strong>'+rowData.total_followings+'</strong></div>';
				profileInfoLeftContainerHtml+='			</li>';
				profileInfoLeftContainerHtml+='			<li>';
				profileInfoLeftContainerHtml+='				<div class="pull-left"><a href="javascript:void(0)">SNAPS</a></div>';
				profileInfoLeftContainerHtml+='				<div class="pull-right"><strong>'+rowData.total_snaps+'</strong></div>';
				profileInfoLeftContainerHtml+='			</li>';
				profileInfoLeftContainerHtml+='		</ul>';
				profileInfoLeftContainerHtml+='	</div>';

				$("#profileInfoLeftContainer").html(profileInfoLeftContainerHtml);

				profileInfoRightHalfContainerHtml+='		<div class="infoSet">';
				if(responseData.content.is_current_logged_user==1){
					profileInfoRightHalfContainerHtml+='			<h2>'+rowData.name+'<a href="https://www.snaplava.com/edit-profile" data-toggle="tooltip" data-placement="right" title="Edit profile">Edit Profile</a></h2>';
				}else{
					profileInfoRightHalfContainerHtml+='			<h2>'+rowData.name+'</h2>';
				}		
				profileInfoRightHalfContainerHtml+='			<i class="fas fa-map-marker-alt"></i>';
				profileInfoRightHalfContainerHtml+='			<small>'+locationText+'</small>';
				profileInfoRightHalfContainerHtml+='		</div>';
				profileInfoRightHalfContainerHtml+='		<div class="infoSet">';
				profileInfoRightHalfContainerHtml+='			<h3>Profession</h3>';
				profileInfoRightHalfContainerHtml+='			<p>'+whatBestDescribesYouText+'</p>';
				profileInfoRightHalfContainerHtml+='		</div>';
				profileInfoRightHalfContainerHtml+='		<div class="infoSet">';
				profileInfoRightHalfContainerHtml+='			<h3>Skills</h3>';
				profileInfoRightHalfContainerHtml+='			<p>'+skillsText+'</p>';
				profileInfoRightHalfContainerHtml+='		</div>';
				profileInfoRightHalfContainerHtml+='		<div class="infoSet">';
				profileInfoRightHalfContainerHtml+='			<h3>Rating</h3>';
				profileInfoRightHalfContainerHtml+='			<div class="profileRatingContent">';
				profileInfoRightHalfContainerHtml+='				<strong>'+userRating+'</strong>';
				profileInfoRightHalfContainerHtml+='				<div id="userStars"></div>';
				profileInfoRightHalfContainerHtml+='			</div>';
				profileInfoRightHalfContainerHtml+='		</div>';
				profileInfoRightHalfContainerHtml+='		<div class="infoSet">';
				profileInfoRightHalfContainerHtml+='			<div class="infoButtonsContainer">';
				profileInfoRightHalfContainerHtml+='				<span class="icon"><i class="fas fa-camera-alt"></i></span>';
				profileInfoRightHalfContainerHtml+='				<p>'+isAvailableForPaidPhotographyText+'</p>';
				profileInfoRightHalfContainerHtml+='			</div>';
				profileInfoRightHalfContainerHtml+='			<div class="infoButtonsContainer">';
				profileInfoRightHalfContainerHtml+='				<a class="btn btn-white" href="javascript:void(0)"><i class="fas fa-comment"></i>&nbsp; SEND MESSAGE</a>';
				profileInfoRightHalfContainerHtml+='			</div>';
				profileInfoRightHalfContainerHtml+='		</div>';

				$("#profileInfoRightHalfContainer").html(profileInfoRightHalfContainerHtml);

				/* Load User Rating stars start */
			   	$('#userStars').rating({
			      size:18,                      //this option defines the size of the star
			      primaryColor:"none",         //this color code defines the primary color of stars
			      hoverColor:"#e44c3e",        //this color code defines the hover state of stars    
			      count:5,                      //defines the number of stars you want in a rater   
			      rate:userRating,
			      scale:10,
				  readonly:"true",
				  borderColor:"#e44c3e"    
			   	});
			   	/* Load User Rating stars end */

				/* Check image load start*/
			    setTimeout(function () { 
			    var imgs = $(".profilePhotoBox img.profilePhoto");
			    $.each(imgs, function () {
			        var $this = $(this);
			        var im = new Image();
			        im.src = $this.attr('src') ;
				    im.onload = function() {
				        $this.parent().addClass('profilePhotoBox-no-before');
				    };
			    }); }, 3000);
			    /* Check image load end*/
				
				break;
			case 3: 
				console.log(responseData.message);
				break;
			case 4: 
				$("#emptyMessage").html('<p>'+responseData.message+'</p>');
				$("#emptyMessage").removeClass('hidden');
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
	

    /* Load user SNAPS satrt */
    var request = $.ajax({
	    url: BASE_URL+"live/public/api/v1/users/popular-photos",
	    headers: {
	        "Authorization" : "Bearer "+token
	    },
	    type: "GET",
	    data: {
	    	"user_id" : userSlug,
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
					loadMoreBtnHtml+='<div id="snapsLoadMoreBtn" class="modalLoadMoreBtnContainer">';
					loadMoreBtnHtml+='	<a class="btn btn-block btn-default" onclick="loadMoreUsersSnaps(\''+userSlug+'\')" href="javascript:void(0)">LOAD MORE</a>';
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
				  		var snapTitleText="";
				  		var userSlugEach="";
				  		var photoSlug="";
				  		if(rowData.user_slug !== null && rowData.user_slug !=""){
				  			userSlugEach=rowData.user_slug;
				  		}else{
				  			userSlugEach=rowData.user_id;
				  		}
				  		if(rowData.slug !== null && rowData.slug !=""){
				  			photoSlug=rowData.slug;
				  		}else{
				  			photoSlug=rowData.id;
				  		}
				    	if(rowData.title !== null && rowData.title !=""){
				  			snapTitleText=rowData.title;
				  		}
				  		var html = '';
				  		html+= '<li>';
				  		html+= '	<div class="userSnapBox">';
				  		html+= '		<a href="'+BASE_URL+'photo/'+photoSlug+'"><img class="userSnap" src="'+rowData.image_thumbnail+'" alt="'+snapTitleText+'" title="'+snapTitleText+'"></a>';
				  		html+= '	</div>';
				  		html+= '</li>';

						$("#userSnapsContainer").append(html);
				  	}else{
				  		console.log("Something went wrong : "+rowData);
				  	}
				});

				$("#userSnapsContainer").append(loadMoreBtnHtml);

				/* Check image load start*/
			    setTimeout(function () { 
			    var imgs = $(".userSnapBox img.userSnap");
			    $.each(imgs, function () {
			        var $this = $(this);
			        var im = new Image();
			        im.src = $this.attr('src') ;
				    im.onload = function() {
				        $this.parent().parent().addClass('userSnapBox-no-before');
				    };
			    }); }, 3000);
			    /* Check image load end*/
				break;
			case 3: 
				console.log(responseData.message);
				break;
			case 4: 
				$("#userSnapsContainer").html('<li class="emptyText"><p>No snaps available yet!</p></li>');
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
    /* Load user SNAPS end */


});
/**
* Loade Profile Page Data END
**/


/**
* All followers Satrt
**/
function allFollowers(userId){
	$('#viewAllFollowersModal').modal('show');
	$('#viewAllFollowersModalTitle').html('All followers');
	var isOpened=$('#isOpenedFollowers').val();
	if(isOpened==""){
		$('#isOpenedFollowers').val(1);
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
		        $('#viewAllFollowersContainer').addClass('hidden');
		        $('#FollowersloadingText').removeClass('hidden');
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
					$('#FollowersloadingText').addClass('hidden');
					$('#viewAllFollowersContainer').removeClass('hidden');
					console.log(responseData.message);
					break;
				case 2: 
					//alert('2');
					console.log(responseData.content.data);
					var loadMoreBtnHtml="";
					if(typeof responseData.content.pagination.next_page !== "undefined" && responseData.content.pagination.next_page != null){
						$("#viewall_followers_next_page").val(responseData.content.pagination.next_page);
						loadMoreBtnHtml+='<div id="modalLoadMoreFollowersBtn" class="modalLoadMoreBtnContainer">';
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

							$("#viewAllFollowersContainer").append(html);
					  	}else{
					  		console.log("Something went wrong : "+rowData);
					  	}
					  	
					});
					$('#FollowersloadingText').addClass('hidden');
					$('#viewAllFollowersContainer').removeClass('hidden');

					$("#viewAllFollowersContainer").append(loadMoreBtnHtml);

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
					$('#FollowersloadingText').addClass('hidden');
					$('#viewAllFollowersContainer').removeClass('hidden');
					console.log(responseData.message);
					break;
				case 4: 
					$('#FollowersloadingText').html('No data found');
					console.log(responseData.message);
					break;
				case 5: 
					$('#FollowersloadingText').addClass('hidden');
					$('#viewAllFollowersContainer').removeClass('hidden');
					console.log(responseData.message);
					break;	
				default:
					$('#FollowersloadingText').addClass('hidden');
					$('#viewAllFollowersContainer').removeClass('hidden');
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
	$("#modalLoadMoreFollowersBtn").remove();
	var next_page=$("#viewall_followers_next_page").val();
	if(next_page!=""){
		if($.inArray(next_page, followersPaginationLink) == -1){
			followersPaginationLink.push(next_page);
			console.log(followersPaginationLink);

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
	    	$("#viewall_followers_next_page").val("");
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

							$("#viewAllFollowersContainer").append(html);
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
						$("#viewall_followers_next_page").val(responseData.content.pagination.next_page);
						loadMoreBtnHtml+='<div id="modalLoadMoreFollowersBtn" class="modalLoadMoreBtnContainer">';
						loadMoreBtnHtml+='	<a class="btn btn-block btn-default" onclick="loadMoreFollowers('+userId+')" href="javascript:void(0)">LOAD MORE</a>';
						loadMoreBtnHtml+='</div>';
					}else{
						$("#viewall_followers_next_page").val("");
					}
					$("#viewAllFollowersContainer").append(loadMoreBtnHtml);
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
* All followings Satrt
**/
function allFollowings(userId){
	$('#viewAllFollowingsModal').modal('show');
	$('#viewAllFollowingsModalTitle').html('All followings');
	var isOpened=$('#isOpenedFollowings').val();
	if(isOpened==""){
		$('#isOpenedFollowings').val(1);
		var request = $.ajax({
		    url: BASE_URL+"live/public/api/v1/users/followings",
		    headers: {
		        "Authorization" : "Bearer "+token
		    },
		    type: "GET",
		    data: {
		    	'user_id' : userId,
		    	"pagination_limit" : 20
		    },
		    beforeSend:function(){
		    	$('#viewAllFollowingsContainer').addClass('hidden');
		        $("#FollowingsloadingText").removeClass('hidden');
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
					$('#viewAllFollowingsContainer').removeClass('hidden');
					$("#FollowingsloadingText").addClass('hidden'); 
					console.log(responseData.message);
					break;
				case 2: 
					//alert('2');
					console.log(responseData.content.data);
					var loadMoreBtnHtml="";
					if(typeof responseData.content.pagination.next_page !== "undefined" && responseData.content.pagination.next_page != null){
						$("#viewall_followings_next_page").val(responseData.content.pagination.next_page);
						loadMoreBtnHtml+='<div id="modalLoadMoreFollowingsBtn" class="modalLoadMoreBtnContainer">';
						loadMoreBtnHtml+='	<a class="btn btn-block btn-default" onclick="loadMoreFollowings('+userId+')" href="javascript:void(0)">LOAD MORE</a>';
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

							$("#viewAllFollowingsContainer").append(html);
					  	}else{
					  		console.log("Something went wrong : "+rowData);
					  	}
					  	
					});
					$('#viewAllFollowingsContainer').removeClass('hidden');
					$("#FollowingsloadingText").addClass('hidden');

					$("#viewAllFollowingsContainer").append(loadMoreBtnHtml);

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
					$('#viewAllFollowingsContainer').removeClass('hidden');
					$("#FollowingsloadingText").addClass('hidden');
					console.log(responseData.message);
					break;
				case 4: 
					$("#FollowingsloadingText").html('No data found');
					console.log(responseData.message);
					break;
				case 5: 
					$('#viewAllFollowingsContainer').removeClass('hidden');
					$("#FollowingsloadingText").addClass('hidden');
					console.log(responseData.message);
					break;	
				default:
					$('#viewAllFollowingsContainer').removeClass('hidden');
					$("#FollowingsloadingText").addClass('hidden');
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


function loadMoreFollowings(userId){
	$("#modalLoadMoreFollowingsBtn").remove();
	var next_page=$("#viewall_followings_next_page").val();
	if(next_page!=""){
		if($.inArray(next_page, followingsPaginationLink) == -1){
			followingsPaginationLink.push(next_page);
			console.log(followingsPaginationLink);

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
	    	$("#viewall_followings_next_page").val("");
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

							$("#viewAllFollowingsContainer").append(html);
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
						$("#viewall_followings_next_page").val(responseData.content.pagination.next_page);
						loadMoreBtnHtml+='<div id="modalLoadMoreFollowingsBtn" class="modalLoadMoreBtnContainer">';
						loadMoreBtnHtml+='	<a class="btn btn-block btn-default" onclick="loadMoreFollowings('+userId+')" href="javascript:void(0)">LOAD MORE</a>';
						loadMoreBtnHtml+='</div>';
					}else{
						$("#viewall_followings_next_page").val("");
					}
					$("#viewAllFollowingsContainer").append(loadMoreBtnHtml);
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
* View all Followings end
**/





/** 
* Load more users SNAPS on load more click Start
**/
function loadMoreUsersSnaps(userId){
	$("#snapsLoadMoreBtn").remove();
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
		    	"user_id" : userId,
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
					  		var snapTitleText="";
					  		var userSlugEach="";
					  		var photoSlug="";
					  		if(rowData.user_slug !== null && rowData.user_slug !=""){
					  			userSlugEach=rowData.user_slug;
					  		}else{
					  			userSlugEach=rowData.user_id;
					  		}
					  		if(rowData.slug !== null && rowData.slug !=""){
					  			photoSlug=rowData.slug;
					  		}else{
					  			photoSlug=rowData.id;
					  		}
					    	if(rowData.title !== null && rowData.title !=""){
					  			snapTitleText=rowData.title;
					  		}
					  		var html = '';
					  		html+= '<li>';
					  		html+= '	<div class="userSnapBox">';
					  		html+= '		<a href="'+BASE_URL+'photo/'+photoSlug+'"><img class="userSnap" src="'+rowData.image_thumbnail+'" alt="'+snapTitleText+'" title="'+snapTitleText+'"></a>';
					  		html+= '	</div>';
					  		html+= '</li>';

							$("#userSnapsContainer").append(html);
					  	}else{
					  		console.log("Something went wrong : "+rowData);
					  	}
					  	
					});
					/* Check image load start*/
				    setTimeout(function () { 
				    var imgs = $(".userSnapBox img.userSnap");
				    $.each(imgs, function () {
				        var $this = $(this);
				        var im = new Image();
				        im.src = $this.attr('src') ;
					    im.onload = function() {
					        $this.parent().parent().addClass('userSnapBox-no-before');
					    };
				    }); }, 3000);
				    /* Check image load end*/
				    var loadMoreBtnHtml="";
				    if(typeof responseData.content.pagination.next_page !== "undefined" && responseData.content.pagination.next_page != null){
						$("#next_page").val(responseData.content.pagination.next_page);
						loadMoreBtnHtml+='<div id="snapsLoadMoreBtn" class="modalLoadMoreBtnContainer">';
						loadMoreBtnHtml+='	<a class="btn btn-block btn-default" onclick="loadMoreUsersSnaps(\''+userId+'\')" href="javascript:void(0)">LOAD MORE</a>';
						loadMoreBtnHtml+='</div>';
					}else{
						$("#next_page").val("");
					}
					$("#userSnapsContainer").append(loadMoreBtnHtml);
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
* Load more users SNAPS on load more click End
**/