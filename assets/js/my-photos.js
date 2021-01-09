/**
* Check a photo START
**/
function selectPhoto(el){
	var selectedPhotosValue="";
	if($(el).prop("checked")){
		$(el).parent().addClass('active');
		$("#photoActionContainer").removeClass('hidden');
		$('.photo-check').each(function () {
	        if($(this).prop("checked")){
	          isAnyChecked=1;
	          selectedPhotosValue+=$(this).val()+',';
	        }
	    });
	}else{
		$(el).parent().removeClass('active');
		var isAnyChecked=0;
	    $('.photo-check').each(function () {
	        if($(this).prop("checked")){
	          isAnyChecked=1;
	          selectedPhotosValue+=$(this).val()+',';
	        }
	    });
	    if (isAnyChecked == 0)
    	{
    		$("#photoActionContainer").addClass('hidden');
    	}
	}
	selectedPhotosValue = selectedPhotosValue.replace(/,\s*$/, "");
    $('#selectedPhotos').val(selectedPhotosValue);
}
/**
* Check a photo END
**/

/**
* Save Editable photos data STRAT
**/
function savePhotos(){
	/* validation part is blocked for now will be implemented in future */
	/*var values = $("input[name='imageIds[]']").map(function(){return $(this).val();}).get();
	var flag="";
	$.each( values, function( key, value ) {
		//alert(value);
		var imageTitle="";
		imageTitle=$("#imageTitle"+value).val();
		if(imageTitle==""){
			$("#imageTitle"+value).addClass('focus-danger');
			flag=1;
		}
	});

	if(flag!=""){
		return false;
	}*/

	var formData = $('#editPhotosForm').serializeArray();
	/*formData.push({name: 'userId', value: userId});*/


	var imageTitle=$("#imageTitle").val();
	var request = $.ajax({
	    url: BASE_URL+"live/public/api/v1/users/photo/update",
	    headers: {
	        "Authorization" : "Bearer "+token
	    },
	    type: "POST",
	    data: formData,
	    beforeSend:function(){
	        $('#editablePhotosContainer').addClass('hidden');
	        $('#loadingText').removeClass('hidden');
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
				console.log('Image title field(s) can not be blank.');
				break;
			case 2: 
				//alert('2');
				var successData = null;
		      	try {
		          	successData = JSON.parse(responseData.content); 
		      	} catch (e) {
		          	successData = responseData.content;
		      	}
		      	$('#loadingText').html('Photo(s) saved successfully.');
      			setTimeout(function () {
                     setTimeout(function () {
                     	$('#loadingText').addClass('hidden');
	                    $('#loadingText').html('Loading..');
	                    $('#editablePhotosContainer').removeClass('hidden');
	                 }, 0);
	                 $('#editPhotoModal').delay(400).fadeOut('slow');
	                 setTimeout(function () {
	                     $('#editPhotoModal').modal('hide');
	                 }, 1000);
                 }, 2000);
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
* Save Editable photos data END
**/



/**
* Load Editable photos data STRAT
**/
function editPhotos(){
	$('#editPhotoModal').modal('show');
	var photoIds=$('#selectedPhotos').val();
	var request = $.ajax({
	    url: BASE_URL+"live/public/api/v1/users/photo/edit",
	    headers: {
	        "Authorization" : "Bearer "+token
	    },
	    type: "GET",
	    data: {
	    	"photo_ids" : photoIds
	    },
	    beforeSend:function(){
	    	$('#editablePhotosContainer').addClass('hidden');
	        $('#loadingText').removeClass('hidden');
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
				var arrayLenght=responseData.content.length;
				var cnt=1;
				var html='';
				
				$.each( responseData.content, function( key, value ) {
					var categories=[];
					if(value.categories !== null && value.categories !=""){
			      		var categoriesVal=value.categories;
			      		categories=categoriesVal.split(',');
			      	}
					html+='<div class="editablePhotoRow">';
					html+='	<div class="editableLeft">';
					html+='		<img src="'+value.image_thumbnail+'" title="'+value.title+'" alt="'+value.title+'">';
					html+='	</div>';
					html+='	<div class="editableRight">';
					html+='		<div class="form-group">';
					html+='     	<input type="text" class="form-control" placeholder="Title" value="'+value.title+'" id="imageTitle'+value.id+'" name="imageTitle'+value.id+'">';
				    html+='			<input type="hidden" name="imageId'+cnt+'" value="'+value.id+'">';
					html+='		</div>';
					html+='		<div class="form-group">';
					html+='			<select class="form-control imageDetailsCategories" id="imageCategory'+value.id+'" name="imageCategory'+value.id+'[]" multiple="multiple">';
							        $.each( categorySelectOptions, function( catKey, catVal ) {
							        	if($.inArray(catKey, categories) !== -1){
							        		html+='<option value="'+catKey+'" selected>'+catVal+'</option>';
							        	}else{
							        		html+='<option value="'+catKey+'">'+catVal+'</option>';
							        	}
							        });
					html+='			</select>';
			        html+='			<div id="selectedCategory">';
			        html+='     	</div>';
			        html+='     </div>';
					html+='		<div class="form-group">';
					html+='			<textarea class="form-control" id="imageDescription'+value.id+'" name="imageDescription'+value.id+'" placeholder="Description">'+value.description+'</textarea>';
					html+='		</div>';
					html+='	</div>';
					html+='</div>';
					cnt++;
				});
				$("#editablePhotosContainer").html(html);
				$.each( responseData.content, function( key, value ) {
					$("#imageCategory"+value.id).select2({ 
			    		placeholder: "Select Categories",
			    		maximumSelectionLength: 3
			    	});
				});
				var numHtml='<input type="hidden" name="totalNumberOfSet" id="totalNumberOfSet" value="'+arrayLenght+'">';
				$("#totalNumberOfSet").remove();
				$("#editablePhotosContainer").append(numHtml);

				$('#editablePhotosContainer').removeClass('hidden');
				$('#loadingText').addClass('hidden');
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
* Load Editable photos data END
**/


/**
* Delete photos STRAT
**/
function deleteMyPhotos(){
	var isGood=confirm('Are you sure you want to delete this photo(s)!');
    if (isGood) {
    	var photoIds=$('#selectedPhotos').val();
    	var request = $.ajax({
		    url: BASE_URL+"live/public/api/v1/users/photo/delete",
		    headers: {
		        "Authorization" : "Bearer "+token
		    },
		    type: "POST",
		    data: {
		    	"photo_ids" : photoIds
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
					var photoIdsArr = photoIds.split(',');
					$.each( photoIdsArr, function( key, value ) {
						setTimeout(function () {
						$('#myPhotoBox'+value).removeClass('myPhotoBox-no-before');
						}, 3000);
						$('#myPhotoBox'+value).remove();
					});
					$("#photoActionContainer").addClass('hidden');
					//$('#photoRow'+id).remove();
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
    } else {
    	return false;
    }
}
/**
* Delete photos END
**/

/**
* Loade images on page url first hit START
**/
$(document).ready(function () {
	var request = $.ajax({
	    url: BASE_URL+"live/public/api/v1/users/images",
	    headers: {
	        "Authorization" : "Bearer "+token
	    },
	    type: "GET",
	    data: {
	    	"pagination_limit" : "20"
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
				  	if(rowData.id){
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
				  		var html = '';
				  		html+= '<li id="myPhotoBox'+rowData.id+'" class="myPhotoBox">';
				  		html+= '	<a class="photoAtag" href="'+BASE_URL+'photo/'+photoSlug+'"><img id="photo'+rowData.id+'" class="myPhoto" src="'+rowData.image_medium+'" alt="'+rowData.title+'" title="'+rowData.title+'"></a>';
				  		html+= '	<div class="imageSelectContainer">';
				  		html+= '		<div class="checkbox">';
				  		html+= '			<label>';
				  		html+= '				<input onclick="selectPhoto(this)" class="photo-check" type="checkbox" value="'+rowData.id+'">';
				  		html+= '				<span class="cr"><i class="cr-icon fa fa-check"></i></span>';
				  		html+= '			</label>';
				  		html+= '		</div>';
				  		html+= '	</div>';
				  		html+= '</li>';

						$("#myPhotosContainer").append(html);
				  	}else{
				  		console.log("Something went wrong : "+rowData);
				  	}
				  	
				});

				/* Check image load start*/
			    setTimeout(function () { 
			    var imgs = $(".myPhotoBox img.myPhoto");
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
					    	"pagination_limit" : "20"
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
								  		var html = '';
								  		html+= '<li class="myPhotoBox">';
								  		html+= '	<a href="'+BASE_URL+'photo/'+photoSlug+'"><img id="photo'+rowData.id+'" class="myPhoto" src="'+rowData.image_medium+'" alt="'+rowData.title+'" title="'+rowData.title+'"></a>';
								  		html+= '</li>';

										$("#myPhotosContainer").append(html);
								  	}else{
								  		console.log("Something went wrong : "+rowData);
								  	}
								  	
								});

								/* Check image load start*/
							    setTimeout(function () { 
							    var imgs = $(".myPhotoBox img.myPhoto");
							    $.each(imgs, function () {
							        var $this = $(this);
							        var im = new Image();
							        im.src = $this.attr('src') ;
								    im.onload = function() {
								        $this.parent().parent().addClass('myPhotoBox-no-before');
								    };
							    }); }, 3000);
							    /* Check image load end*/
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
* Loade more images on page scroll bottom END
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
	var target = e.target
    if (target.tagName == "IMG" && target.classList.contains('myPhoto')){
    	if (getfullscreenelement() == null){ // if browser is currently not in full screen
	        //globalreqfullscreen.call(target)
	    }
	    else{
	    	e.preventDefault();
	    	/*target.style.cssText = "height:190px; object-fit: cover;";*/
	    	target.style.cssText = "height:242px; width:224px; object-fit: cover;";
	        globalexitfullscreen.call(document)
	    }
    }
}, false)

function maximize(id){
	var featuredimg = document.getElementById("photo"+id);
	if (getfullscreenelement() == null){ // if browser is currently not in full screen
		/*featuredimg.style.cssText = "height:auto; object-fit: contain;";*/
		featuredimg.style.cssText = "height:auto; width:auto; object-fit: contain;";
        globalreqfullscreen.call(featuredimg)
    }
    else{
    	//featuredimg.style.cssText = "height:242px; object-fit: cover;";
    	featuredimg.style.cssText = "height:242px; width:224px; object-fit: cover;";
        globalexitfullscreen.call(document)
    }
}
/**
* Photo fullscreen view Maximize/Minimize on click end
**/