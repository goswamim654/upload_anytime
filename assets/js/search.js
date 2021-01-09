/**
* Fetch search result START
**/
var request = $.ajax({
    url: BASE_URL+"live/public/api/v1/search",
    headers: {
        "Authorization" : "Bearer "+token
    },
    type: "POST",
    data: {
    	"search_query" : searchQuery,
    	"search_type" : searchType,
    	"search_categories" : searchCategories,
    	"pagination_limit" : "25"
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
	switch (status) { 
		case 1: 
			console.log(responseData.message);
			break;
		case 2: 
			$("#emptyMessage").addClass('hidden');
			console.log(responseData.content.data);
			if(typeof responseData.content.pagination.next_page !== "undefined" && responseData.content.pagination.next_page != null){
				$("#next_page").val(responseData.content.pagination.next_page);
			}

			if(responseData.content.search_type=="users"){
				$("#categoriesSearchResultContainer").hide();
				$("#usersSearchResultContainer").show();
			}else{
				$("#usersSearchResultContainer").hide();
				$("#categoriesSearchResultContainer").show();
			}

			$.each( responseData.content.data, function( key, value ) {
				var rowData = null;
		      	try {
		          	rowData = JSON.parse(value); 
		      	} catch (e) {
		          	rowData = value;
		      	}
			  	if(rowData.id){

			  		switch(responseData.content.search_type) {
					    case "categories":
					    	var userSlugInCategorySearch="";
					  		var photoSlugInCategorySearch="";
					  		if(rowData.user_slug !== null && rowData.user_slug !=""){
					  			userSlugInCategorySearch=rowData.user_slug;
					  		}else{
					  			userSlugInCategorySearch=rowData.user_id;
					  		}
					  		if(rowData.slug !== null && rowData.slug !=""){
					  			photoSlugInCategorySearch=rowData.slug;
					  		}else{
					  			photoSlugInCategorySearch=rowData.id;
					  		}
					        var categoryHtml = '';
					  		categoryHtml+= '<li class="searchUserPhotoBox">';
					  		categoryHtml+= '	<a href="'+BASE_URL+'photo/'+photoSlugInCategorySearch+'"><img id="photo'+rowData.id+'" class="searchPhoto" src="'+rowData.image_medium+'" alt="'+rowData.title+'" title="'+rowData.title+'"></a>';
					  		categoryHtml+= '</li>';

							$("#categoriesSearchResultContainer").append(categoryHtml);
					        break;
					    case "users":
					    	var locationTextFull="";
					    	var locationText="";
					    	var nameText="";
					    	var userSlugInUsersSearch="";
					  		if(rowData.slug !== null && rowData.slug !=""){
					  			userSlugInUsersSearch=rowData.slug;
					  		}else{
					  			userSlugInUsersSearch=rowData.id;
					  		}
					  		if(rowData.city !== null && rowData.city !=""){
					      		locationTextFull+=rowData.city+', ';
					      	}
					      	if(rowData.country !== null && rowData.country !=""){
					      		locationTextFull+=rowData.country;
					      	}
					      	if(locationTextFull!=""){
					      		locationTextFull=locationTextFull.replace(/,\s*$/, "");
					      	}
					    	if(locationTextFull !== null && locationTextFull !=""){
					  			if (locationTextFull.length > 30)
					  				locationText=locationTextFull.substring(0,30) + '..';
					  			else
					  				locationText=locationTextFull;
					  		}
					  		if(rowData.name !== null && rowData.name !=""){
					  			if (rowData.name.length > 13)
					  				nameText=rowData.name.substring(0,13) + '..';
					  			else
					  				nameText=rowData.name;
					  		}
					        var userHtml = '';
					  		userHtml+= '<li class="searchUserPhotoBox">';
					  		userHtml+= '	<a href="'+BASE_URL+'profile/'+userSlugInUsersSearch+'"><img id="userPhoto'+rowData.id+'" class="searchPhoto" src="'+rowData.user_profile_photo+'" alt="'+rowData.name+'" title="'+rowData.name+'"></a>';
					  		userHtml+= '	<div class="usersDetails">';
					  		userHtml+= '		<a href="'+BASE_URL+'profile/'+userSlugInUsersSearch+'" title="'+rowData.name+'"><h3>'+nameText+'</h3></a>';
					  		userHtml+= '		<p title="'+locationTextFull+'"><i>'+locationText+'</i></p>';
					  		userHtml+= '	</div>';
					  		userHtml+= '</li>';
					  		$("#usersSearchResultContainer").append(userHtml);
					        break;
					    default:
					        console.log("Something went wrong! Could not fetch the data.");
					}
			  	}else{
			  		console.log("Something went wrong : "+rowData);
			  	}
			  	
			});

			// Check image load start
		    setTimeout(function () { 
		    var imgs = $(".searchUserPhotoBox img.searchPhoto");
		    $.each(imgs, function () {
		        var $this = $(this);
		        var im = new Image();
		        im.src = $this.attr('src') ;
			    im.onload = function() {
			        $this.parent().parent().addClass('searchUserPhotoBox-no-before');
			    };
		    }); }, 3000);
		    // Check image load end 
			break;
		case 3: 
			console.log(responseData.message);
			break;
		case 4: 
			$("#usersSearchResultContainer").hide();
			$("#categoriesSearchResultContainer").hide();
			$("#emptyMessage").html('<p>No match found.</p>');
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
/**
* Fetch search result END
**/



/**
* Loade more search result on page scroll bottom START
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
					    type: "POST",
					    data: {
					    	"search_query" : searchQuery,
					    	"search_type" : searchType,
					    	"search_categories" : searchCategories,
					    	"pagination_limit" : "25"
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
								//alert('2');
								console.log(responseData.content.data);			
								$.each( responseData.content.data, function( key, value ) {
									var rowData = null;
							      	try {
							          	rowData = JSON.parse(value); 
							      	} catch (e) {
							          	rowData = value;
							      	}
								  	if(rowData.id){

								  		switch(responseData.content.search_type) {
										    case "categories":
										    	var userSlugInCategorySearch="";
										  		var photoSlugInCategorySearch="";
										  		if(rowData.user_slug !== null && rowData.user_slug !=""){
										  			userSlugInCategorySearch=rowData.user_slug;
										  		}else{
										  			userSlugInCategorySearch=rowData.user_id;
										  		}
										  		if(rowData.slug !== null && rowData.slug !=""){
										  			photoSlugInCategorySearch=rowData.slug;
										  		}else{
										  			photoSlugInCategorySearch=rowData.id;
										  		}
										        var categoryHtml = '';
										  		categoryHtml+= '<li class="searchUserPhotoBox">';
										  		categoryHtml+= '	<a href="'+BASE_URL+'photo/'+photoSlugInCategorySearch+'"><img id="photo'+rowData.id+'" class="searchPhoto" src="'+rowData.image_medium+'" alt="'+rowData.title+'" title="'+rowData.title+'"></a>';
										  		categoryHtml+= '</li>';

												$("#categoriesSearchResultContainer").append(categoryHtml);
										        break;
										    case "users":
										        var locationText="";
										    	var nameText="";
										    	var userSlugInUsersSearch="";
										  		if(rowData.slug !== null && rowData.slug !=""){
										  			userSlugInUsersSearch=rowData.slug;
										  		}else{
										  			userSlugInUsersSearch=rowData.id;
										  		}	
										    	if(rowData.location !== null && rowData.location !=""){
										  			if (rowData.location.length > 30)
										  				locationText=rowData.location.substring(0,30) + '..';
										  			else
										  				locationText=rowData.location;
										  		}
										  		if(rowData.name !== null && rowData.name !=""){
										  			if (rowData.name.length > 13)
										  				nameText=rowData.name.substring(0,13) + '..';
										  			else
										  				nameText=rowData.name;
										  		}
										        var userHtml = '';
										  		userHtml+= '<li class="searchUserPhotoBox">';
										  		userHtml+= '	<a href="'+BASE_URL+'profile/'+userSlugInUsersSearch+'"><img id="userPhoto'+rowData.id+'" class="searchPhoto" src="'+rowData.user_profile_photo+'" alt="'+rowData.name+'" title="'+rowData.name+'"></a>';
										  		userHtml+= '	<div class="usersDetails">';
										  		userHtml+= '		<a href="'+BASE_URL+'profile/'+userSlugInUsersSearch+'" title="'+rowData.name+'"><h3>'+nameText+'</h3></a>';
										  		userHtml+= '		<p><i>'+locationText+'</i></p>';
										  		userHtml+= '	</div>';
										  		userHtml+= '</li>';
										  		$("#usersSearchResultContainer").append(userHtml);
										        break;
										    default:
										        console.log("Something went wrong! Could not fetch the data.");
										}
								  	}else{
								  		console.log("Something went wrong : "+rowData);
								  	}
								  	
								});

								// Check image load start
							    setTimeout(function () { 
							    var imgs = $(".searchUserPhotoBox img.searchPhoto");
							    $.each(imgs, function () {
							        var $this = $(this);
							        var im = new Image();
							        im.src = $this.attr('src') ;
								    im.onload = function() {
								        $this.parent().parent().addClass('searchUserPhotoBox-no-before');
								    };
							    }); }, 3000);
							    // Check image load end 
							    if(typeof responseData.content.pagination.next_page !== "undefined" && responseData.content.pagination.next_page != null){
									$("#next_page").val(responseData.content.pagination.next_page);
								}else{
									$("#next_page").val("");
								}
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
	   				/* Loading new images in ajax end */
	   			}
	   		}
	   }
	});
	/* Detect the bottom of the to load more images end */
});
/**
* Loade more search result on page scroll bottom END
**/