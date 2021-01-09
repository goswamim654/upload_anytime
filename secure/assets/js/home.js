$(document).ready(function () {	
	adminHomeImages(1);
});


function adminHomeImages(pageNumber){
	/* Get All Images Start */
	var from_date=$("#search_from_date").val();
	var to_date=$("#search_to_date").val();

	var request = $.ajax({
	    url: BASE_URL+"live/public/api/v1/admin/home",
	    headers: {
	        "Authorization" : "Bearer "+token
	    },
	    type: "GET",
	    data: {
	    	"pagination_limit" : 10,
	    	"page" : pageNumber,
	    	"from_date" : from_date,
	    	"to_date" : to_date
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

				$("#totalNumberOfPhotos").html(responseData.content.total);
				$("#numberOfCategories").html(responseData.content.total_used_categories);
				$("#photosUploadedLastTenDats").html(responseData.content.number_of_photos_uploaded_last_ten_days);
				var html='';
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
				  		var imageTitle="-";
				  		var userEmail="-";
				  		var likeIconClass="far";
				  		if(rowData.title !== null && rowData.title !=""){
				  			imageTitle=rowData.title;
				  		}
				  		if(rowData.user_email !== null && rowData.user_email !=""){
				  			userEmail=rowData.user_email;
				  		}

				  		html+='<tr id="photoRow'+rowData.id+'">';
				  		html+='		<td>';
				  		html+='			<img src="'+rowData.image_thumbnail+'" alt="'+imageTitle+'">';
				  		html+='		</td>';
				  		html+='		<td>'+imageTitle+'</td>';
				  		html+='		<td>'+rowData.user_name+'</td>';
				  		html+='		<td>'+userEmail+'</td>';
				  		html+='		<td>'+$.date(rowData.created_at)+'</td>';
				  		html+='		<td>';
				  		html+='			<a data-toggle="modal" data-target="#viewModal'+rowData.id+'" class="row-action row-action-view" href="javascript:void(0)">VIEW</a>&nbsp;|';
				  		if(rowData.status=="1"){
				  			html+='		<span id="approvedAtag'+rowData.id+'"><a class="row-action row-action-approve" href="javascript:void(0)">APPROVED</a></span>&nbsp;|';
				  		}else{
				  			html+='		<span id="approvedAtag'+rowData.id+'"><a onclick="approvePhoto(this, '+rowData.id+')" class="row-action row-action-approve" href="javascript:void(0)">APPROVE</a></span>&nbsp;|';
				  		}
				  		if(rowData.status=="2"){
				  			html+='		<span id="declinedAtag'+rowData.id+'"><a class="row-action row-action-decline" href="javascript:void(0)">DECLINED</a></span>&nbsp;|';
				  		}else{
				  			html+='		<span id="declinedAtag'+rowData.id+'"><a onclick="declinePhoto(this, '+rowData.id+')" class="row-action row-action-decline" href="javascript:void(0)">DECLINE</a></span>&nbsp;|';
				  		}
				  		html+='			<a onclick="deletePhoto(this, '+rowData.id+')" class="row-action row-action-delete" href="javascript:void(0)">DELETE</a>';
				  		/* View Model Strat */
				  		html+='			<div class="modal fade" id="viewModal'+rowData.id+'" role="dialog">';
				  		html+='				<div class="modal-dialog modal-lg">';
				  		html+='					<div class="modal-content">';
				  		html+='						<div class="modal-header">';
				  		html+='							<button type="button" class="close" data-dismiss="modal">&times;</button>';
				  		html+='							<h4 class="modal-title">Photo details</h4>';
				  		html+='						</div>';
				  		html+='						<div class="modal-body">';
				  		html+='							<img src="'+rowData.image_medium+'" alt="'+rowData.title+'">';
				  		html+='							<div class="photoDetailsInModal">';
				  		html+='								<p><b>Title : </b>'+rowData.title+'</p>';
				  		html+='								<p><b>Categories : </b>'+rowData.categories+'</p>';
				  		html+='								<p><b>Uploaded Date : </b>'+rowData.created_at+'</p>';
				  		html+='								<p><b>User : </b>'+rowData.user_name+'</p>';
				  		html+='								<p><b>Email-id : </b>'+rowData.user_email+'</p>';
				  		html+='							</div>';
				  		html+='						</div>';
				  		/*html+='						<div class="modal-footer">';
				  		html+='							<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>';
				  		html+='						</div>';*/
				  		html+='					</div>';
				  		html+='				</div>';
				  		html+='			</div>';
				  		/* View Model End */
				  		html+='		</td>';
				  		html+='</tr>';

						

				  	}else{
				  		console.log("Something went wrong : "+rowData);
				  	}
				});
				$("#adminHomeImagesTableBody").html(html);
				var paginationData="";
				var range=3;
				try {
		          	paginationData = JSON.parse(responseData.content.pagination); 
		      	} catch (e) {
		          	paginationData = responseData.content.pagination;
		      	}
		      	var currentPage=parseInt(pageNumber);
		      	var paginationHtml='';
		      	if(currentPage==1){
		      		paginationHtml+='<li class="disabled"><a href="javascript:void(0)">First</a></li>';
		      		paginationHtml+='<li class="disabled"><a href="javascript:void(0)">Previous</a></li>';
		      	}else{
		      		var prevPageNum=currentPage-1;
		      		paginationHtml+='<li><a onclick="adminHomeImages(1)" href="javascript:void(0)">First</a></li>';
		      		paginationHtml+='<li><a onclick="adminHomeImages('+prevPageNum+')" href="javascript:void(0)">Previous</a></li>';	
		      	}

		      	var numPages = Math.ceil(parseInt(responseData.content.total) / parseInt(responseData.content.limit));
		      	for(var x=currentPage-range; x<((currentPage+range)+1); x++){
		      		if((x>0) && (x<=numPages)){
		      			if(x==currentPage){
		      				paginationHtml+='<li class="active"><a onclick="adminHomeImages('+x+')" href="javascript:void(0)">'+x+'</a></li>';
		      			}else{
		      				paginationHtml+='<li><a onclick="adminHomeImages('+x+')" href="javascript:void(0)">'+x+'</a></li>';
		      			}
		      		}

		      	}

		      	/*for (var i = 1; i <= numPages; i++) {
		      		if(currentPage==i){
		      			paginationHtml+='<li class="active"><a onclick="adminHomeImages('+i+')" href="javascript:void(0)">'+i+'</a></li>';
		      		}else{
		      			paginationHtml+='<li><a onclick="adminHomeImages('+i+')" href="javascript:void(0)">'+i+'</a></li>';
		      		}
				}*/

				if(numPages==currentPage){
					paginationHtml+='<li class="disabled"><a href="javascript:void(0)">Next</a></li>';
		      		paginationHtml+='<li class="disabled"><a href="javascript:void(0)">Last</a></li>';
				}else{
					var nextPageNum=currentPage+1;
					paginationHtml+='<li><a onclick="adminHomeImages('+nextPageNum+')" href="javascript:void(0)">Next</a></li>';
		      		paginationHtml+='<li><a onclick="adminHomeImages('+numPages+')" href="javascript:void(0)">Last</a></li>';
				}

				$(".adminHomePagination").html(paginationHtml);
				break;
			case 3: 
				console.log(responseData.message);
				break;
			case 4: 
				console.log(responseData.message);
				break;	
			default:
				console.log('Something went wrong! please try again later '+responseData);
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
}

function approvePhoto(el, id){
	var request = $.ajax({
	    url: BASE_URL+"live/public/api/v1/admin/photo/approve",
	    headers: {
	        "Authorization" : "Bearer "+token
	    },
	    type: "POST",
	    data: {
	    	"image_id" : id
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
				$("#declinedAtag"+id).html('<a onclick="declinePhoto(this, '+id+')" class="row-action row-action-decline" href="javascript:void(0)">DECLINE</a>');
				$("#approvedAtag"+id).html('<a class="row-action row-action-approve" href="javascript:void(0)">APPROVED</a>');
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
function declinePhoto(el, id){
	var request = $.ajax({
	    url: BASE_URL+"live/public/api/v1/admin/photo/decline",
	    headers: {
	        "Authorization" : "Bearer "+token
	    },
	    type: "POST",
	    data: {
	    	"image_id" : id
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
				$("#approvedAtag"+id).html('<a onclick="approvePhoto(this, '+id+')" class="row-action row-action-approve" href="javascript:void(0)">APPROVE</a>');
				$("#declinedAtag"+id).html('<a class="row-action row-action-decline" href="javascript:void(0)">DECLINED</a>');
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
function deletePhoto(el, id){
	var isGood=confirm('Are you sure you want to delete this photo!');
    if (isGood) {

    	var request = $.ajax({
		    url: BASE_URL+"live/public/api/v1/admin/photo/delete",
		    headers: {
		        "Authorization" : "Bearer "+token
		    },
		    type: "POST",
		    data: {
		    	"image_id" : id
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
					$('#photoRow'+id).remove();
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