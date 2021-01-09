/**
* Loade images on page url first hit START
**/
$(document).ready(function () {
	var userId=getCookie('userId');
	/* Get All Images Start */
	var request = $.ajax({
	    url: BASE_URL+"live/public/api/v1/home/images",
	    headers: {
	        "Authorization" : "Bearer "+token
	    },
	    type: "GET",
	    data: {
	    	"pagination_limit" : "15"
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

      	//console.log(responseData);
      	var status = responseData.status;
		switch (status) { 
			case 1: 
				console.log(responseData.message);
				break;
			case 2: 
				//alert('2');
				console.log(responseData.content.data);
				if(typeof responseData.content.pagination.next_page !== "undefined" && responseData.content.pagination.next_page != null){
					$("#next_page").val(responseData.content.pagination.next_page);
				}
				$.each( responseData.content.data, function( key, value ) {
					var rowData = null;
			      	try {
			          	rowData = JSON.parse(value); 
			      	} catch (e) {
			          	rowData = value;
			      	}
				  	//alert( key + ": " + rowData.image );
				  	if(rowData.id){
				  		/*if(rowData.user_primary_profile_photo !== null && rowData.user_primary_profile_photo !=""){
				  			var userProfilePhoto=rowData.user_primary_profile_photo;
				  		}else{
				  			var userProfilePhoto=rowData.user_secondary_profile_photo;
				  		}*/
				  		var imageTitle="";
				  		var userName="";
				  		var likeIconClass="far";
				  		var likeHoverTitle="Like";
				  		var followHoverTitle="Follow";
				  		var categoriesText="";
				  		var userRating=0;
				  		var photoRating=0;
				  		var userSlug="";
				  		var photoSlug="";
				  		if(rowData.user_slug !== null && rowData.user_slug !=""){
				  			userSlug=rowData.user_slug;
				  		}else{
				  			userSlug=rowData.user_id;
				  		}
				  		if(rowData.slug !== null && rowData.slug !=""){
				  			photoSlug=rowData.slug;
				  		}else{
				  			photoSlug=rowData.id;
				  		}
				  		if(rowData.title !== null && rowData.title !=""){
				  			if (rowData.title.length > 18)
				  				imageTitle=rowData.title.substring(0,18) + '..';
				  			else
				  				imageTitle=rowData.title;
				  		}
				  		if(rowData.user_name !== null && rowData.user_name !=""){
				  			if (rowData.user_name.length > 8)
				  				userName=rowData.user_name.substring(0,8) + '..';
				  			else
				  				userName=rowData.user_name;
				  		}
				  		if(rowData.categories !== null && rowData.categories !=""){
				  			if (rowData.categories.length > 12)
				  				categoriesText=rowData.categories.substring(0,12) + '..';
				  			else
				  				categoriesText=rowData.categories;
				  		}
				  		
				  		/* rating section start*/
				  		if(rowData.user_rating !== null && rowData.user_rating !=""){
				  			userRating=rowData.user_rating.toFixed(1);
				  		}
				  		if(rowData.photo_rating !== null && rowData.photo_rating !=""){
				  			photoRating=rowData.photo_rating.toFixed(1);
				  		}
				  		/* rating section end */
				  		if(categoriesText=="" && rowData.user_name.length > 9){
				  			if (rowData.user_name.length > 18)
				  				userName=rowData.user_name.substring(0,18) + '..';
				  			else
				  				userName=rowData.user_name;
				  		}

				  		if(rowData.is_liked == "1"){
				  			likeIconClass="fas";
				  			likeHoverTitle="You have already liked it";
				  		}
				  		if(rowData.is_following == 1){
				  			followHoverTitle="Following";
				  		}

				  		var html = '';
				  		html+='<div class="mainImageBox">';
        				html+='	<div class="imageBox">';
        				html+='		<div class="image-div">';
        				html+='			<ul class="user-section">';
        				//html+='				<li data-container="body" data-toggle="tooltip" data-placement="bottom" title="Followers" id="topTotalFollowing'+rowData.id+'" class="like-num cursor-pointer">'+rowData.total_followers+'</li>';
        				html+='				<li data-container="body" data-toggle="tooltip" data-placement="left" title="'+userRating+' Stars" id="overAlluserRatings'+rowData.id+'" class="like-num cursor-pointer"><span>'+userRating+'</span></li>';
	        			html+='				<li data-container="body" data-toggle="tooltip" data-placement="left" title="'+rowData.user_name+'" class="cursor-pointer"><a href="'+BASE_URL+'profile/'+userSlug+'"><img alt="pic" src="'+rowData.user_profile_photo+'"></a></li>';
	        			html+='			</ul>';
        				html+='			<a href="'+BASE_URL+'photo/'+photoSlug+'"><img id="image'+rowData.id+'" class="setImage" src="'+rowData.image_medium+'" alt="'+rowData.title+'" title="'+rowData.title+'"></a>';
        				html+='			<!-- Hover section start -->';
						html+='			<div class="hoverContainer">';
						html+='				<div class="likeContainer">';
						html+='					<span class="pull-left"><i data-container="body" data-toggle="tooltip" onclick="maximize('+rowData.id+')" data-placement="right" title="Expand" class="fal fa-expand cursor-pointer"></i></span>';
	        			//html+='					<span class="pull-right"><i class="fas fa-thumbs-up"></i> <e id="totalLike'+rowData.id+'">'+rowData.total_likes+'</e></span>';
	        			html+='					<a id="photoStars'+rowData.id+'" href="#" data-toggle="modal" data-target="#ratingModal'+rowData.id+'">';
	        			html+='					<span data-container="body" data-toggle="tooltip" data-placement="left" title="'+photoRating+' Stars, what\'s your take" id="starsDisplayContainer'+rowData.id+'" class="pull-right">';
	        			html+='						<div id="stars'+rowData.id+'"></div>';
	        			html+='					</span>';
	        			html+='					</a>';
						html+='				</div>';
						html+='				<div class="detailsContainer">';
						html+='					<div class="userInfo">';
						html+='						<h3>'+imageTitle+'</h3>';
						//html+='						<span class="categories">'+imageTitle+' by </span>';
						html+='						<span class="categories">'+categoriesText+' by </span>';
	        			html+='						<a data-container="body" data-toggle="tooltip" data-placement="top" title="'+rowData.user_name+'" class="userName" href="'+BASE_URL+'profile/'+userSlug+'">'+userName+'</a>';
	        			//html+='						<span class="homeUserfollowingLable"><e id="totalFollowing'+rowData.id+'">'+rowData.total_followers+'</e> Following</span>';
        				html+='					</div>';
        				html+='					<div class="socilaContent">';
        				html+='					<span>'+rowData.total_followers+' Following</span>';
        				html+='						<ul>';
	        			html+='							<!-- <li class="pull-left"><i class="fas fa-expand-arrows-alt"></i></li> -->';
			        	html+='							<!-- <li class="green"><i data-container="body" data-toggle="tooltip" data-placement="top" title="Mail" class="fas fa-envelope"></i></li> -->';
			        	
			        	html+='							<li class="purple dropup"><a data-toggle="dropdown" href="#" id="shareMenu" class="dropdown-toggle"><i onclick="shareTooltipToggle(this)" data-container="body" data-toggle="tooltip" data-placement="top" title="Share" class="fas fa-share-alt share-toggle"></i></a>';
			        	html+='								<ul class="dropdown-menu" id="shareMenu">';
			        	html+='									<li><a class="social-share" href="https://www.facebook.com/sharer/sharer.php?u='+BASE_URL+'photo/'+photoSlug+'" target="_blank"><i class="fab fa-facebook-f facebook"></i></a></li>';
			        	html+='									<li><a class="social-share" href="https://twitter.com/intent/tweet?url='+BASE_URL+'photo/'+photoSlug+'" target="_blank"><i class="fab fa-twitter twitter"></i></a></li>';
			        	html+='									<li><a class="social-share" href="https://plus.google.com/share?url='+BASE_URL+'photo/'+photoSlug+'" target="_blank"><i class="fab fa-google-plus-g gplus"></i></a></li>';
			        	html+='								</ul>';
			        	html+='							</li>';
			        	html+='							<li class="yellow"><a href="javascript:void(0)" onclick="prepareDownloadHref(this, '+rowData.id+')" download><i data-container="body" data-toggle="tooltip" data-placement="top" title="Download" class="fas fa-download"></i></a></li>';
			        	html+='							<li class="red" id="followBtnContainer'+rowData.id+'"><i data-container="body" data-toggle="tooltip" data-placement="top" title="'+followHoverTitle+'" onclick="followUser(this, '+rowData.id+', '+rowData.user_id+')" class="fas fa-user-plus"></i></li>';
			        	//html+='							<li class="blue" id="likeBtnContainer'+rowData.id+'"><i data-container="body" data-toggle="tooltip" data-placement="top" title="'+likeHoverTitle+'" onclick="likePhoto(this, '+rowData.id+')" class="'+likeIconClass+' fa-thumbs-up"></i></li>';
		        		html+='						</ul>';
        				html+='					</div>';
						html+='				</div>';
						html+='			</div>';
						html+='			<!-- Hover section end -->';
        				html+='		</div>';
        				html+='	</div>';
        				/* View Model Strat */
				  		html+='			<div class="modal fade ratingModal" id="ratingModal'+rowData.id+'" role="dialog">';
				  		html+='				<div class="modal-dialog modal-sm">';
				  		html+='					<div class="modal-content">';
				  		html+='						<div class="modal-header">';
				  		html+='							<button onclick="closeStarModal('+rowData.id+')" type="button" class="close">&times;</button>';
				  		html+='							<h4 class="modal-title">Give your valuable rating</h4>';
				  		html+='						</div>';
				  		html+='						<div class="modal-body">';
				  		html+='							<p id="ratingModelMsgContainer'+rowData.id+'" class="text-center hidden"></p>';
				  		html+='							<table id="ratingModalTable'+rowData.id+'">';
				  		html+='								<tr>';
				  		html+='									<td><h5>Content & Composition<h5></td>';
				  		html+='									<td>';
				  		html+='										<div id="content_composition_rating_'+rowData.id+'"></div>';
				  		html+='									</td>';
				  		html+='								</tr>';
				  		html+='								<tr>';
				  		html+='									<td><h5>Image Quality<h5></td>';
				  		html+='									<td>';
				  		html+='										<div id="image_quality_rating_'+rowData.id+'"></div>';
				  		html+='									</td>';
				  		html+='								</tr>';
				  		html+='								<tr>';
				  		html+='									<td><h5>Professionalism<h5></td>';
				  		html+='									<td>';
				  		html+='										<div id="professionalism_rating_'+rowData.id+'"></div>';
				  		html+='									</td>';
				  		html+='								</tr>';
				  		html+='								<tr>';
				  		html+='									<td><h5>Excellent<h5></td>';
				  		html+='									<td>';
				  		html+='										<div id="excellent_rating_'+rowData.id+'"></div>';
				  		html+='									</td>';
				  		html+='								</tr>';
				  		html+='								<tr>';
				  		html+='									<td><h5>World Class<h5></td>';
				  		html+='									<td>';
				  		html+='										<div id="world_class_rating_'+rowData.id+'"></div>';
				  		html+='									</td>';
				  		html+='								</tr>';
				  		html+='							</table>';
				  		html+='						</div>';
				  		html+='						<div class="modal-footer">';
				  		html+='							<button onclick="closeStarModal('+rowData.id+')" type="button" class="btn btn-default">Cancel</button>';
				  		html+='							<button onclick="savePhotoRating('+rowData.id+', '+rowData.user_id+')" type="button" class="btn btn-success">Save</button>';
				  		html+='						</div>';
				  		html+='					</div>';
				  		html+='				</div>';
				  		html+='			</div>';
				  		/* View Model End */
        				html+='</div>';

						$("#homeImageContainer").append(html);

						/* Loding Photo's given stars start */
						$('#stars'+rowData.id).rating({
					      size:20,                      //this option defines the size of the star
					      primaryColor:"none",         //this color code defines the primary color of stars
					      hoverColor:"#e44c3e",        //this color code defines the hover state of stars    
					      count:5,                      //defines the number of stars you want in a rater   
					      rate:photoRating,
					      scale:10,
         				  readonly:"true",
         				  borderColor:"#FFFFFF"   
					   	});
						/* Loding Photo's given stars end */

						/* Load Rating stars strat */
						$('#content_composition_rating_'+rowData.id).rating({
					      size:20,                      //this option defines the size of the star
					      primaryColor:"none",         //this color code defines the primary color of stars
					      hoverColor:"#e44c3e",        //this color code defines the hover state of stars    
					      count:5,                      //defines the number of stars you want in a rater   
					      rate:rowData.content_composition_rating,
					      scale:2,
         				  readonly:"false",
         				  borderColor:"#e44c3e"
					   	});
						$('#image_quality_rating_'+rowData.id).rating({
					      size:20,                      //this option defines the size of the star
					      primaryColor:"none",         //this color code defines the primary color of stars
					      hoverColor:"#e44c3e",        //this color code defines the hover state of stars    
					      count:5,                      //defines the number of stars you want in a rater   
					      rate:rowData.image_quality_rating,
					      scale:2,
         				  readonly:"false",
         				  borderColor:"#e44c3e"
					   	});
						$('#professionalism_rating_'+rowData.id).rating({
					      size:20,                      //this option defines the size of the star
					      primaryColor:"none",         //this color code defines the primary color of stars
					      hoverColor:"#e44c3e",        //this color code defines the hover state of stars    
					      count:5,                      //defines the number of stars you want in a rater   
					      rate:rowData.professionalism_rating,
					      scale:2,
         				  readonly:"false",
         				  borderColor:"#e44c3e"    
					   	});
						$('#excellent_rating_'+rowData.id).rating({
					      size:20,                      //this option defines the size of the star
					      primaryColor:"none",         //this color code defines the primary color of stars
					      hoverColor:"#e44c3e",        //this color code defines the hover state of stars    
					      count:5,                      //defines the number of stars you want in a rater   
					      rate:rowData.excellent_rating,
					      scale:2,
         				  readonly:"false" ,
         				  borderColor:"#e44c3e"   
					   	});
						$('#world_class_rating_'+rowData.id).rating({
					      size:20,                      //this option defines the size of the star
					      primaryColor:"none",         //this color code defines the primary color of stars
					      hoverColor:"#e44c3e",        //this color code defines the hover state of stars    
					      count:5,                      //defines the number of stars you want in a rater   
					      rate:rowData.world_class_rating,
					      scale:2,
         				  readonly:"false",
         				  borderColor:"#e44c3e"    
					   	});
						/* Load Rating stars end */
				  	}else{
				  		console.log("Something went wrong : "+rowData);
				  	}
				  	
				});

				/* Check image load start*/
			    setTimeout(function () { 
			    var imgs = $(".mainImageBox img.setImage");
			    $.each(imgs, function () {
			        var $this = $(this);
			        var im = new Image();
			        im.src = $this.attr('src') ;
				    im.onload = function() {
				        $this.parent().parent().addClass('image-div-no-before');
				    };
			    }); }, 3000);
			    /* Check image load end*/
				$(".user-section").css('opacity', '1');
				//$('[rel=tooltip]').tooltip({container: 'body'});
				$('[data-toggle="tooltip"]').tooltip();
				$(".modal-body").mCustomScrollbar({
				    theme: "minimal"
				});
				break;
			case 3: 
				console.log(responseData.message);
				break;
			case 4: 
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

	/* Get All Images End */
});
/**
* Loade images on page url first hit END
**/


/**
* Loade more images on page scroll bottom START
**/
$(window).on("load", function (e) {
	var imagesPaginationLink=[];
	/* Detect the bottom of the to load more images satrt */
	$(window).scroll(function() {
	   if($(window).scrollTop() + $(window).height() > $(document).height() - 280) {
	   		var next_page=$("#next_page").val();
	   		if(next_page!=""){
	   			if($.inArray(next_page, imagesPaginationLink) == -1){
	   				imagesPaginationLink.push(next_page);
	   				console.log(imagesPaginationLink);

	   				/* Loading new images in ajax start */
	   				var request = $.ajax({
					    url: next_page,
					    headers: {
					        "Authorization" : "Bearer "+token
					    },
					    type: "GET",
					    data: {
					    	"pagination_limit" : "15"
					    },
					    beforeSend:function(){
					        $("#loadingIndicator").removeClass("hidden");
					    },
					    complete:function(jqXHR, status){
					        $("#loadingIndicator").addClass("hidden");
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
								alert(responseData.message);
								break;
							case 2: 
								//alert('2');
								console.log(responseData.content.data);			
								$.each( responseData.content.data, function( key, value ) {
									var rowData = null;
							      	try {
							          	rowData = JSON.parse(value); 
							      	} catch (e) {
							          	rowData = value;
							      	}
								  	//alert( key + ": " + rowData.image );
								  	if(rowData.id){
								  		/*if(rowData.user_primary_profile_photo !== null && rowData.user_primary_profile_photo !=""){
								  			var userProfilePhoto=rowData.user_primary_profile_photo;
								  		}else{
								  			var userProfilePhoto=rowData.user_secondary_profile_photo;
								  		}*/
								  		var imageTitle="";
								  		var userName="";
								  		var likeIconClass="far";
								  		var likeHoverTitle="Like";
								  		var followHoverTitle="Follow";
								  		var categoriesText="";
								  		var userRating=0;
								  		var photoRating=0;
								  		var userSlug="";
								  		var photoSlug="";
								  		if(rowData.user_slug !== null && rowData.user_slug !=""){
								  			userSlug=rowData.user_slug;
								  		}else{
								  			userSlug=rowData.user_id;
								  		}
								  		if(rowData.slug !== null && rowData.slug !=""){
								  			photoSlug=rowData.slug;
								  		}else{
								  			photoSlug=rowData.id;
								  		}
								  		if(rowData.title !== null && rowData.title !=""){
								  			if (rowData.title.length > 18)
								  				imageTitle=rowData.title.substring(0,18) + '..';
								  			else
								  				imageTitle=rowData.title;
								  		}
								  		if(rowData.user_name !== null && rowData.user_name !=""){
								  			if (rowData.user_name.length > 8)
								  				userName=rowData.user_name.substring(0,8) + '..';
								  			else
								  				userName=rowData.user_name;
								  		}
								  		if(rowData.categories !== null && rowData.categories !=""){
								  			if (rowData.categories.length > 12)
								  				categoriesText=rowData.categories.substring(0,12) + '..';
								  			else
								  				categoriesText=rowData.categories;
								  		}
								  		if(rowData.user_rating !== null && rowData.user_rating !=""){
								  			userRating=rowData.user_rating.toFixed(1);
								  		}
								  		if(rowData.photo_rating !== null && rowData.photo_rating !=""){
								  			photoRating=rowData.photo_rating.toFixed(1);
								  		}

								  		if(categoriesText=="" && rowData.user_name.length > 9){
								  			if (rowData.user_name.length > 18)
								  				userName=rowData.user_name.substring(0,18) + '..';
								  			else
								  				userName=rowData.user_name;
								  		}

								  		if(rowData.is_liked == "1"){
								  			likeIconClass="fas";
								  			likeHoverTitle="You have already liked it";
								  		}
								  		if(rowData.is_following == 1){
								  			followHoverTitle="Following";
								  		}

								  		var html = '';
								  		html+='<div class="mainImageBox">';
				        				html+='	<div class="imageBox">';
				        				html+='		<div class="image-div">';
				        				html+='			<ul class="user-section">';
				        				//html+='				<li data-container="body" data-toggle="tooltip" data-placement="bottom" title="Followers" id="topTotalFollowing'+rowData.id+'" class="like-num cursor-pointer">'+rowData.total_followers+'</li>';
				        				html+='				<li data-container="body" data-toggle="tooltip" data-placement="left" title="'+userRating+' Stars" id="overAlluserRatings'+rowData.id+'" class="like-num cursor-pointer"><span>'+userRating+'</span></li>';
					        			html+='				<li data-container="body" data-toggle="tooltip" data-placement="left" title="'+rowData.user_name+'" class="cursor-pointer"><a href="'+BASE_URL+'profile/'+userSlug+'"><img alt="pic" src="'+rowData.user_profile_photo+'"></a></li>';
					        			html+='			</ul>';
				        				html+='			<a href="'+BASE_URL+'photo/'+photoSlug+'"><img id="image'+rowData.id+'" class="setImage" src="'+rowData.image_medium+'" alt="'+rowData.title+'" title="'+rowData.title+'"></a>';
				        				html+='			<!-- Hover section start -->';
										html+='			<div class="hoverContainer">';
										html+='				<div class="likeContainer">';
										html+='					<span class="pull-left"><i data-container="body" data-toggle="tooltip" onclick="maximize('+rowData.id+')" data-placement="right" title="Expand" class="fal fa-expand cursor-pointer"></i></span>';
					        			//html+='					<span class="pull-right"><i class="fas fa-thumbs-up"></i> <e id="totalLike'+rowData.id+'">'+rowData.total_likes+'</e></span>';
					        			html+='					<a id="photoStars'+rowData.id+'" href="#" data-toggle="modal" data-target="#ratingModal'+rowData.id+'">';
					        			html+='					<span data-container="body" data-toggle="tooltip" data-placement="left" title="'+photoRating+' Stars, what\'s your take" id="starsDisplayContainer'+rowData.id+'" class="pull-right">';
					        			html+='						<div id="stars'+rowData.id+'"></div>';
					        			html+='					</span>';
					        			html+='					</a>';
										html+='				</div>';
										html+='				<div class="detailsContainer">';
										html+='					<div class="userInfo">';
										html+='						<h3>'+imageTitle+'</h3>';
										//html+='						<span class="categories">'+imageTitle+' by </span>';
										html+='						<span class="categories">'+categoriesText+' by </span>';
					        			html+='						<a data-container="body" data-toggle="tooltip" data-placement="top" title="'+rowData.user_name+'" class="userName" href="'+BASE_URL+'profile/'+userSlug+'">'+userName+'</a>';
					        			//html+='						<span class="homeUserfollowingLable"><e id="totalFollowing'+rowData.id+'">'+rowData.total_followers+'</e> Following</span>';
				        				html+='					</div>';
				        				html+='					<div class="socilaContent">';
				        				html+='					<span>'+rowData.total_followers+' Following</span>';
				        				html+='						<ul>';
					        			html+='							<!-- <li class="pull-left"><i class="fas fa-expand-arrows-alt"></i></li> -->';
							        	html+='							<!-- <li class="green"><i data-container="body" data-toggle="tooltip" data-placement="top" title="Mail" class="fas fa-envelope"></i></li> -->';
							        	
							        	html+='							<li class="purple dropup"><a data-toggle="dropdown" href="#" id="shareMenu" class="dropdown-toggle"><i onclick="shareTooltipToggle(this)" data-container="body" data-toggle="tooltip" data-placement="top" title="Share" class="fas fa-share-alt share-toggle"></i></a>';
							        	html+='								<ul class="dropdown-menu" id="shareMenu">';
							        	html+='									<li><a class="social-share" href="https://www.facebook.com/sharer/sharer.php?u='+BASE_URL+'photo/'+photoSlug+'" target="_blank"><i class="fab fa-facebook-f facebook"></i></a></li>';
							        	html+='									<li><a class="social-share" href="https://twitter.com/intent/tweet?url='+BASE_URL+'photo/'+photoSlug+'" target="_blank"><i class="fab fa-twitter twitter"></i></a></li>';
							        	html+='									<li><a class="social-share" href="https://plus.google.com/share?url='+BASE_URL+'photo/'+photoSlug+'" target="_blank"><i class="fab fa-google-plus-g gplus"></i></a></li>';
							        	html+='								</ul>';
							        	html+='							</li>';
							        	html+='							<li class="yellow"><a href="javascript:void(0)" onclick="prepareDownloadHref(this, '+rowData.id+')" download><i data-container="body" data-toggle="tooltip" data-placement="top" title="Download" class="fas fa-download"></i></a></li>';
							        	html+='							<li class="red" id="followBtnContainer'+rowData.id+'"><i data-container="body" data-toggle="tooltip" data-placement="top" title="'+followHoverTitle+'" onclick="followUser(this, '+rowData.id+', '+rowData.user_id+')" class="fas fa-user-plus"></i></li>';
							        	//html+='							<li class="blue" id="likeBtnContainer'+rowData.id+'"><i data-container="body" data-toggle="tooltip" data-placement="top" title="'+likeHoverTitle+'" onclick="likePhoto(this, '+rowData.id+')" class="'+likeIconClass+' fa-thumbs-up"></i></li>';
						        		html+='						</ul>';
				        				html+='					</div>';
										html+='				</div>';
										html+='			</div>';
										html+='			<!-- Hover section end -->';
				        				html+='		</div>';
				        				html+='	</div>';
				        				/* View Model Strat */
								  		html+='			<div class="modal fade ratingModal" id="ratingModal'+rowData.id+'" role="dialog">';
								  		html+='				<div class="modal-dialog modal-sm">';
								  		html+='					<div class="modal-content">';
								  		html+='						<div class="modal-header">';
								  		html+='							<button onclick="closeStarModal('+rowData.id+')" type="button" class="close">&times;</button>';
								  		html+='							<h4 class="modal-title">Give your valuable rating</h4>';
								  		html+='						</div>';
								  		html+='						<div class="modal-body">';
								  		html+='							<p id="ratingModelMsgContainer'+rowData.id+'" class="text-center hidden"></p>';
								  		html+='							<table id="ratingModalTable'+rowData.id+'">';
								  		html+='								<tr>';
								  		html+='									<td><h5>Content & Composition<h5></td>';
								  		html+='									<td>';
								  		html+='										<div id="content_composition_rating_'+rowData.id+'"></div>';
								  		html+='									</td>';
								  		html+='								</tr>';
								  		html+='								<tr>';
								  		html+='									<td><h5>Image Quality<h5></td>';
								  		html+='									<td>';
								  		html+='										<div id="image_quality_rating_'+rowData.id+'"></div>';
								  		html+='									</td>';
								  		html+='								</tr>';
								  		html+='								<tr>';
								  		html+='									<td><h5>Professionalism<h5></td>';
								  		html+='									<td>';
								  		html+='										<div id="professionalism_rating_'+rowData.id+'"></div>';
								  		html+='									</td>';
								  		html+='								</tr>';
								  		html+='								<tr>';
								  		html+='									<td><h5>Excellent<h5></td>';
								  		html+='									<td>';
								  		html+='										<div id="excellent_rating_'+rowData.id+'"></div>';
								  		html+='									</td>';
								  		html+='								</tr>';
								  		html+='								<tr>';
								  		html+='									<td><h5>World Class<h5></td>';
								  		html+='									<td>';
								  		html+='										<div id="world_class_rating_'+rowData.id+'"></div>';
								  		html+='									</td>';
								  		html+='								</tr>';
								  		html+='							</table>';
								  		html+='						</div>';
								  		html+='						<div class="modal-footer">';
								  		html+='							<button onclick="closeStarModal('+rowData.id+')" type="button" class="btn btn-default">Cancel</button>';
								  		html+='							<button onclick="savePhotoRating('+rowData.id+', '+rowData.user_id+')" type="button" class="btn btn-success">Save</button>';
								  		html+='						</div>';
								  		html+='					</div>';
								  		html+='				</div>';
								  		html+='			</div>';
								  		/* View Model End */
				        				html+='</div>';

										$("#homeImageContainer").append(html);

										/* Loding Photo's given stars start */
										$('#stars'+rowData.id).rating({
									      size:20,                      //this option defines the size of the star
									      primaryColor:"none",         //this color code defines the primary color of stars
									      hoverColor:"#e44c3e",        //this color code defines the hover state of stars    
									      count:5,                      //defines the number of stars you want in a rater   
									      rate:photoRating,
									      scale:10,
				         				  readonly:"true",
         				  				  borderColor:"#FFFFFF"    
									   	});
										/* Loding Photo's given stars end */

										/* Load Rating stars strat */
										$('#content_composition_rating_'+rowData.id).rating({
									      size:20,                      //this option defines the size of the star
									      primaryColor:"none",         //this color code defines the primary color of stars
									      hoverColor:"#e44c3e",        //this color code defines the hover state of stars    
									      count:5,                      //defines the number of stars you want in a rater   
									      rate:rowData.content_composition_rating,
									      scale:2,
				         				  readonly:"false",
         				  				  borderColor:"#e44c3e"
									   	});
										$('#image_quality_rating_'+rowData.id).rating({
									      size:20,                      //this option defines the size of the star
									      primaryColor:"none",         //this color code defines the primary color of stars
									      hoverColor:"#e44c3e",        //this color code defines the hover state of stars    
									      count:5,                      //defines the number of stars you want in a rater   
									      rate:rowData.image_quality_rating,
									      scale:2,
				         				  readonly:"false",
         				  				  borderColor:"#e44c3e"
									   	});
										$('#professionalism_rating_'+rowData.id).rating({
									      size:20,                      //this option defines the size of the star
									      primaryColor:"none",         //this color code defines the primary color of stars
									      hoverColor:"#e44c3e",        //this color code defines the hover state of stars    
									      count:5,                      //defines the number of stars you want in a rater   
									      rate:rowData.professionalism_rating,
									      scale:2,
				         				  readonly:"false",
         				  				  borderColor:"#e44c3e"    
									   	});
										$('#excellent_rating_'+rowData.id).rating({
									      size:20,                      //this option defines the size of the star
									      primaryColor:"none",         //this color code defines the primary color of stars
									      hoverColor:"#e44c3e",        //this color code defines the hover state of stars    
									      count:5,                      //defines the number of stars you want in a rater   
									      rate:rowData.excellent_rating,
									      scale:2,
				         				  readonly:"false",
         				  				  borderColor:"#e44c3e"    
									   	});
										$('#world_class_rating_'+rowData.id).rating({
									      size:20,                      //this option defines the size of the star
									      primaryColor:"none",         //this color code defines the primary color of stars
									      hoverColor:"#e44c3e",        //this color code defines the hover state of stars    
									      count:5,                      //defines the number of stars you want in a rater   
									      rate:rowData.world_class_rating,
									      scale:2,
				         				  readonly:"false",
         				  				  borderColor:"#e44c3e"    
									   	});
										/* Load Rating stars end */
								  	}else{
								  		console.log("Something went wrong : "+rowData);
								  	}
								  	
								});

								/* Check image load start*/
								setTimeout(function () { 
								var imgs = $(".mainImageBox img.setImage");
							    $.each(imgs, function () {
							        var $this = $(this);
							        var im = new Image();
							        im.src = $this.attr('src') ;
								    im.onload = function() {
								        $this.parent().parent().addClass('image-div-no-before');
								    };
							    }); }, 3000);
							    /* Check image load end*/
							    $(".user-section").css('opacity', '1');
							    //$('[rel=tooltip]').tooltip({container: 'body'});
							    $('[data-toggle="tooltip"]').tooltip();
							    $(".modal-body").mCustomScrollbar({
								    theme: "minimal"
								});
							    if(typeof responseData.content.pagination.next_page !== "undefined" && responseData.content.pagination.next_page != null){
									$("#next_page").val(responseData.content.pagination.next_page);
								}else{
									$("#next_page").val("");
								}
								break;
							case 3: 
								alert(responseData.message);
								break;
							case 4: 
								alert(responseData.message);
								break;	
							default:
								alert('Something went wrong! please try again later');
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
	   				/* Loading new images in ajax end */
	   			}
	   		}
	   }
	});
	/* Detect the bottom of the to load more images end */
});
/**
* Loade more images on page scroll bottom END
**/


/**
* Save photo rating STRAT
**/
function savePhotoRating(photoId, userId){
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
	        //showLoader();
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
				$("#ratingModelMsgContainer"+photoId).html("Could not store your ratings. Please try again later.");
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
    			html+='	<div id="stars'+photoId+'"></div>';
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
function prepareDownloadHref(el, id){
    el.href = $('#image'+id).attr('src');
}
/**
* Download image script with HTML5 end
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
	var featuredimg = document.getElementById("image"+id);
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
*	Like photo Strat 
**/
function likePhoto(el, id){
	var request = $.ajax({
	    url: BASE_URL+"live/public/api/v1/image/like-unlike",
	    headers: {
	        "Authorization" : "Bearer "+token
	    },
	    type: "POST",
	    data: {
	    	"image_id" : id
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
				if(responseData.content.like_unlike_status==1){
					$("#likeBtnContainer"+id).html('<i data-container="body" data-toggle="tooltip" data-placement="top" title="Liked" onclick="likePhoto(this, '+id+')" class="fas fa-thumbs-up"></i>');
				}else{
					$("#likeBtnContainer"+id).html('<i data-container="body" data-toggle="tooltip" data-placement="top" title="Like" onclick="likePhoto(this, '+id+')" class="far fa-thumbs-up"></i>');
				}
				//$('[rel=tooltip]').tooltip({container: 'body'});
				$('[data-toggle="tooltip"]').tooltip();
				$("#totalLike"+id).html(responseData.content.total_likes);
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
/**
* Like photo End 
**/

/**
* follow user Strat 
**/
function followUser(el, id, userId){
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
				/*if(responseData.content.like_unlike_status==1){
					$(el).removeClass('far');
					$(el).addClass('fas');	
				}else{
					$(el).removeClass('fas');
					$(el).addClass('far');
				}*/
				$("#followBtnContainer"+id).html('<i data-container="body" data-toggle="tooltip" data-placement="top" title="Following" onclick="followUser(this, '+id+', '+userId+')" class="fas fa-user-plus"></i>');
				//$('[rel=tooltip]').tooltip({container: 'body'});
				$('[data-toggle="tooltip"]').tooltip();
				$("#totalFollowing"+id).html(responseData.content.total_followers);
				$("#topTotalFollowing"+id).html(responseData.content.total_followers);
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
				$("#followBtnContainer"+id).html('<i data-container="body" data-toggle="tooltip" data-placement="top" title="You can not Follow yourself" onclick="followUser(this, '+id+', '+userId+')" class="fas fa-user-plus"></i>');
				//$('[rel=tooltip]').tooltip({container: 'body'});
				$('[data-toggle="tooltip"]').tooltip();
				break;
			case 7: 
				$("#followBtnContainer"+id).html('<i data-container="body" data-toggle="tooltip" data-placement="top" title="You are already following this user" onclick="followUser(this, '+id+', '+userId+')" class="fas fa-user-plus"></i>');
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