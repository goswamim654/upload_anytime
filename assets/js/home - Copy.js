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
				  		if(rowData.title !== null && rowData.title !=""){
				  			if (rowData.title.length > 18)
				  				imageTitle=rowData.title.substring(0,18) + '...';
				  			else
				  				imageTitle=rowData.title;
				  		}
				  		if(rowData.user_name !== null && rowData.user_name !=""){
				  			if (rowData.user_name.length > 12)
				  				userName=rowData.user_name.substring(0,12) + '...';
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
        				html+='				<li data-toggle="tooltip" data-placement="bottom" title="Followers" id="topTotalFollowing'+rowData.id+'" class="like-num cursor-pointer">'+rowData.total_followers+'</li>';
	        			html+='				<li data-toggle="tooltip" data-placement="bottom" title="'+rowData.user_name+'" class="cursor-pointer"><img alt="pic" src="'+rowData.user_profile_photo+'"></li>';
	        			html+='			</ul>';
        				html+='			<a href="'+BASE_URL+'photo?id='+rowData.id+'"><img id="image'+rowData.id+'" class="setImage" src="'+rowData.image_medium+'" alt="'+rowData.title+'" title="'+rowData.title+'"></a>';
        				html+='			<!-- Hover section start -->';
						html+='			<div class="hoverContainer">';
						html+='				<div class="likeContainer">';
						html+='					<span class="pull-left"><i data-toggle="tooltip" onclick="maximize('+rowData.id+')" data-placement="right" title="Expand" class="fal fa-expand cursor-pointer"></i></span>';
	        			html+='					<span class="pull-right"><i class="fas fa-thumbs-up"></i> <e id="totalLike'+rowData.id+'">'+rowData.total_likes+'</e></span>';
						html+='				</div>';
						html+='				<div class="detailsContainer">';
						html+='					<div class="userInfo">';
						html+='						<h3>'+imageTitle+'</h3>';
	        			html+='						<a class="userName" href="javascript:void(0)">'+userName+'</a>';
	        			html+='						<span class="homeUserfollowingLable"><e id="totalFollowing'+rowData.id+'">'+rowData.total_followers+'</e> Following</span>';
        				html+='					</div>';
        				html+='					<div class="socilaContent">';
        				html+='					<span>5 Following</span>';
        				html+='						<ul>';
	        			html+='							<!-- <li class="pull-left"><i class="fas fa-expand-arrows-alt"></i></li> -->';
			        	html+='							<!-- <li class="green"><i data-toggle="tooltip" data-placement="top" title="Mail" class="fas fa-envelope"></i></li> -->';
			        	
			        	html+='							<li class="purple dropup"><a data-toggle="dropdown" href="#" id="shareMenu" class="dropdown-toggle"><i onclick="shareTooltipToggle(this)" data-toggle="tooltip" data-placement="top" title="Share" class="fas fa-share-alt share-toggle"></i></a>';
			        	html+='								<ul class="dropdown-menu" id="shareMenu">';
			        	html+='									<li><a class="social-share" href="https://www.facebook.com/sharer/sharer.php?u='+rowData.image_medium+'" target="_blank"><i class="fab fa-facebook-f facebook"></i></a></li>';
			        	html+='									<li><a class="social-share" href="https://twitter.com/intent/tweet?url='+rowData.image_medium+'" target="_blank"><i class="fab fa-twitter twitter"></i></a></li>';
			        	html+='									<li><a class="social-share" href="https://plus.google.com/share?url='+rowData.image_medium+'" target="_blank"><i class="fab fa-google-plus-g gplus"></i></a></li>';
			        	html+='								</ul>';
			        	html+='							</li>';



			        	html+='							<li class="yellow"><a href="javascript:void(0)" onclick="prepareDownloadHref(this, '+rowData.id+')" download><i data-toggle="tooltip" data-placement="top" title="Download" class="fas fa-download"></i></a></li>';
			        	html+='							<li class="red" id="followBtnContainer'+rowData.id+'"><i data-toggle="tooltip" data-placement="top" title="'+followHoverTitle+'" onclick="followUser(this, '+rowData.id+', '+rowData.user_id+')" class="fas fa-user-plus"></i></li>';
			        	//html+='							<li class="blue" id="likeBtnContainer'+rowData.id+'"><i data-toggle="tooltip" data-placement="top" title="'+likeHoverTitle+'" onclick="likePhoto(this, '+rowData.id+')" class="'+likeIconClass+' fa-thumbs-up"></i></li>';
		        		html+='						</ul>';
        				html+='					</div>';
						html+='				</div>';
						html+='			</div>';
						html+='			<!-- Hover section end -->';
        				html+='		</div>';
        				html+='	</div>';
        				html+='</div>';

						$("#homeImageContainer").append(html);
						/*setTimeout(function(){ 
							$("#image"+rowData.id).on("load", function(){
					    		$("#image"+rowData.id).parent().addClass('image-div-no-before');
					    	});
						 }, 3000);*/

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
				$('[data-toggle="tooltip"]').tooltip();
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

	/* Check image load start*/
    // setTimeout(function () {
    // var imgs = $(".mainImageBox img.setImage");
    // $.each(imgs, function () {

    //     var $this = $(this);
    //     var im = new Image();
        
    //     $this.on("load", function(){
    //     	$this.parent().addClass('image-div-no-before');
    //     	//$this.parent('.image-div::before').css('display','none');
    //     	//alert(8);
    //     });
        /*im.onload = function () {
        	alert(11);
            var theImage = $this;
            $this.hide("slow");
            theImage[0].src = im.src;
            $this.show('fast');
            $this.parent('.image-div:after').css('display','none');
        };
        im.src = $this.data("mainsrc");*/
    // });}, 3000);
    /* Check image load end*/

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
	   if($(window).scrollTop() + $(window).height() > $(document).height() - 200) {
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
								  		if(rowData.title !== null && rowData.title !=""){
								  			if (rowData.title.length > 18)
								  				imageTitle=rowData.title.substring(0,18) + '...';
								  			else
								  				imageTitle=rowData.title;
								  		}
								  		if(rowData.user_name !== null && rowData.user_name !=""){
								  			if (rowData.user_name.length > 12)
								  				userName=rowData.user_name.substring(0,12) + '...';
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
				        				html+='				<li data-toggle="tooltip" data-placement="bottom" title="Followers" id="topTotalFollowing'+rowData.id+'" class="like-num cursor-pointer">'+rowData.total_followers+'</li>';
					        			html+='				<li data-toggle="tooltip" data-placement="bottom" title="'+rowData.user_name+'" class="cursor-pointer"><img alt="pic" src="'+rowData.user_profile_photo+'"></li>';
					        			html+='			</ul>';
				        				html+='			<a href="'+BASE_URL+'photo?id='+rowData.id+'"><img id="image'+rowData.id+'" class="setImage" src="'+rowData.image_medium+'" alt="'+rowData.title+'" title="'+rowData.title+'"></a>';
				        				html+='			<!-- Hover section start -->';
										html+='			<div class="hoverContainer">';
										html+='				<div class="likeContainer">';
										html+='					<span class="pull-left"><i data-toggle="tooltip" data-placement="right" title="Expand" onclick="maximize('+rowData.id+')" class="fal fa-expand cursor-pointer"></i></span>';
					        			html+='					<span class="pull-right"><i class="fas fa-thumbs-up"></i><e id="totalLike'+rowData.id+'">'+rowData.total_likes+'</e></span>';
										html+='				</div>';
										html+='				<div class="detailsContainer">';
										html+='					<div class="userInfo">';
										html+='						<h3>'+imageTitle+'</h3>';
					        			html+='						<a class="userName" href="javascript:void(0)">'+userName+'</a>';
					        			html+='						<span class="homeUserfollowingLable"><e id="totalFollowing'+rowData.id+'">'+rowData.total_followers+'</e> Following</span>';
				        				html+='					</div>';
				        				html+='					<div class="socilaContent">';
				        				html+='						<ul>';
					        			html+='							<!-- <li class="pull-left"><i class="fas fa-expand-arrows-alt"></i></li> -->';
							        	html+='							<!-- <li class="green"><i data-toggle="tooltip" data-placement="top" title="Mail" class="fas fa-envelope"></i></li> -->';
							        	
							        	html+='							<li class="purple dropup"><a data-toggle="dropdown" href="#" id="shareMenu" class="dropdown-toggle"><i onclick="shareTooltipToggle(this)" data-toggle="tooltip" data-placement="top" title="Share" class="fas fa-share-alt share-toggle"></i></a>';
							        	html+='								<ul class="dropdown-menu" id="shareMenu">';
							        	html+='									<li><a class="social-share" href="https://www.facebook.com/sharer/sharer.php?u='+rowData.image_medium+'" target="_blank"><i class="fab fa-facebook-f facebook"></i></a></li>';
							        	html+='									<li><a class="social-share" href="https://twitter.com/intent/tweet?url='+rowData.image_medium+'" target="_blank"><i class="fab fa-twitter twitter"></i></a></li>';
							        	html+='									<li><a class="social-share" href="https://plus.google.com/share?url='+rowData.image_medium+'" target="_blank"><i class="fab fa-google-plus-g gplus"></i></a></li>';
							        	html+='								</ul>';
							        	html+='							</li>';
							        	
							        	html+='							<li class="yellow"><a href="javascript:void(0)" onclick="prepareDownloadHref(this, '+rowData.id+')" download><i data-toggle="tooltip" data-placement="top" title="Download" class="fas fa-download"></i></a></li>';
							        	html+='							<li class="red" id="followBtnContainer'+rowData.id+'"><i data-toggle="tooltip" data-placement="top" title="'+followHoverTitle+'" onclick="followUser(this, '+rowData.id+', '+rowData.user_id+')" class="fas fa-user-plus"></i></li>';
							        	html+='							<li class="blue" id="likeBtnContainer'+rowData.id+'"><i data-toggle="tooltip" data-placement="top" title="'+likeHoverTitle+'" onclick="likePhoto(this, '+rowData.id+')" class="'+likeIconClass+' fa-thumbs-up"></i></li>';
							        	html+='							<!-- <li class="pull-right"><i class="fa fa-comment"></i></li> -->';
						        		html+='						</ul>';
				        				html+='					</div>';
										html+='				</div>';
										html+='			</div>';
										html+='			<!-- Hover section end -->';
				        				html+='		</div>';
				        				html+='	</div>';
				        				html+='</div>';

				        				$("#homeImageContainer").append(html);
										

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
							    $('[data-toggle="tooltip"]').tooltip();
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
					$("#likeBtnContainer"+id).html('<i data-toggle="tooltip" data-placement="top" title="Liked" onclick="likePhoto(this, '+id+')" class="fas fa-thumbs-up"></i>');
				}else{
					$("#likeBtnContainer"+id).html('<i data-toggle="tooltip" data-placement="top" title="Like" onclick="likePhoto(this, '+id+')" class="far fa-thumbs-up"></i>');
				}
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
				$("#followBtnContainer"+id).html('<i data-toggle="tooltip" data-placement="top" title="Following" onclick="followUser(this, '+id+', '+userId+')" class="fas fa-user-plus"></i>');
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
				$("#followBtnContainer"+id).html('<i data-toggle="tooltip" data-placement="top" title="You can not Follow yourself" onclick="followUser(this, '+id+', '+userId+')" class="fas fa-user-plus"></i>');
				$('[data-toggle="tooltip"]').tooltip();
				break;
			case 7: 
				$("#followBtnContainer"+id).html('<i data-toggle="tooltip" data-placement="top" title="You are already following this user" onclick="followUser(this, '+id+', '+userId+')" class="fas fa-user-plus"></i>');
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