$(document).ready(function () {
	/* Get background images Start */

	var request = $.ajax({
	    url: BASE_URL+"live/public/api/v1/users/last-updated-image",
	    headers: {
	        "Authorization" : "Bearer "+token
	    },
	    type: "GET",
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
				var successData = null;
		      	try {
		          	successData = JSON.parse(responseData.content); 
		      	} catch (e) {
		          	successData = responseData.content;
		      	}
		      	if(successData.image_original != null && successData.image_original != ""){
		      		$('.wrapper').removeClass('colorBg');
		      		$('body').css('background-image', 'url(' + successData.image_original + ')');
		      		$('#imageUploadSuccessPreview').attr("src", successData.image_medium);
		      	}else{
		      		$('body').css('background-color', '#f5f5f5');
		      		$('#imageUploadSuccessPreview').attr("src", successData.image_medium);
		      	}
		      	$('#imageUploadSuccessPreview').removeClass('hidden');
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

	/* Get background images End */

});