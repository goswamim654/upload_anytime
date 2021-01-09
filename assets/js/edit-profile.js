/**
* Load User informations start
**/
var request = $.ajax({
    url: BASE_URL+"live/public/api/v1/users/profile",
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

	      	if(rowData.is_profile_completed=="1"){
	      		$("#uploadSection").hide();
	      		var profilePhotoPreviewHtml='';
	      		profilePhotoPreviewHtml+='<div class="previewHeading"><label>Your portrait:</label>';
	      		profilePhotoPreviewHtml+='	<a onclick="changeProfilePhoto()" class="pull-right" href="javascript:void(0)">CHANGE YOUR PORTRAIT</a>';
	      		profilePhotoPreviewHtml+='</div>';
	      		profilePhotoPreviewHtml+='<div class="profilePicFirstHalf">';
	      		profilePhotoPreviewHtml+='	<img src="'+rowData.user_profile_photo+'" alt="'+rowData.title+'" title="'+rowData.title+'">';
	      		profilePhotoPreviewHtml+='</div>';
	      		profilePhotoPreviewHtml+='<div class="profilePicSecondHalf">';
	      		profilePhotoPreviewHtml+='	<img src="'+rowData.user_circle_photo+'" alt="'+rowData.title+'" title="'+rowData.title+'">';
	      		profilePhotoPreviewHtml+='</div>';
	      		$("#previewSection").html(profilePhotoPreviewHtml);
	      		$("#profilePhoto").val(2);
	      		$("#previewSection").removeClass('hidden');
	      	}

	      	var firstName="";
	      	var lastName="";
	      	var location="";
	      	var contactNo="";
	      	var yesCheckedVariable="";
	      	var noCheckedVariable="checked";
	      	var aboutYourself="";
	      	var whatBestDescribesYou="";
	      	var skills="";
	      	var city="";
	      	var state="";
	      	var country="";
	      	var postalCode="";
	      	
	      	if(rowData.is_available_for_paid_photography == "1"){
	      		yesCheckedVariable="checked";
	      		noCheckedVariable="";
	      	}
	      	if(rowData.about_yourself !== null && rowData.about_yourself !=""){
	      		aboutYourself=rowData.about_yourself;
	      	}
	      	if(rowData.location !== null && rowData.location !=""){
	      		location=rowData.location;
	      	}
	      	if(rowData.contact_number !== null && rowData.contact_number !=""){
	      		contactNo=rowData.contact_number;
	      	}
	      	if(rowData.first_name !== null && rowData.first_name !=""){
	      		firstName=rowData.first_name;
	      	}
	      	if(rowData.last_name !== null && rowData.last_name !=""){
	      		lastName=rowData.last_name;
	      	}
	      	if(rowData.what_best_describes_you !== null && rowData.what_best_describes_you !=""){
	      		whatBestDescribesYou=rowData.what_best_describes_you;
	      	}
	      	if(rowData.skills !== null && rowData.skills !=""){
	      		skills=rowData.skills;
	      	}
	      	if(rowData.city !== null && rowData.city !=""){
	      		$("#locality").prop('disabled', false);
	      		city=rowData.city;
	      	}
	      	if(rowData.state !== null && rowData.state !=""){
	      		$("#administrative_area_level_1").prop('disabled', false);
	      		state=rowData.state;
	      	}
	      	if(rowData.country !== null && rowData.country !=""){
	      		$("#country").prop('disabled', false);
	      		country=rowData.country;
	      	}
	      	if(rowData.postal_code !== null && rowData.postal_code !=""){
	      		$("#postal_code").prop('disabled', false);
	      		postalCode=rowData.postal_code;
	      	}

	      	$("#userFirstName").val(firstName);
	      	$("#userLastName").val(lastName);
	      	$("#userLocation").val(location);
	      	$("#userContactNo").val(contactNo);
	      	$("#aboutUserSelf").val(aboutYourself);
	      	$("#administrative_area_level_1").val(state);
	      	$("#postal_code").val(postalCode);
	      	$("#locality").val(city);
	      	$("#country").val(country);

	      	var radiobtnHtml="";
	      	radiobtnHtml+='<label><span>*</span>Are you available for paid photography:</label>';
	      	radiobtnHtml+='<div class="radio">';
	      	radiobtnHtml+='	<label>';
	      	radiobtnHtml+='		<input type="radio" name="isUserAvailableForPaid" value="1" '+yesCheckedVariable+'><!-- <span class="cr"><i class="cr-icon fa fa-circle"></i></span> -->Yes';
	      	radiobtnHtml+='	</label>';
	      	radiobtnHtml+='</div>';
	      	radiobtnHtml+='<div class="radio">';
	      	radiobtnHtml+='	<label>';
	      	radiobtnHtml+='		<input type="radio" name="isUserAvailableForPaid" value="0" '+noCheckedVariable+'><!-- <span class="cr"><i class="cr-icon fa fa-circle"></i></span> -->No';
	      	radiobtnHtml+='	</label>';
	      	radiobtnHtml+='</div>';

	      	$("#radioBtnContainer").html(radiobtnHtml);
			
			var whatBestDescribesYouArr=whatBestDescribesYou.split(',');
			var whatBestDescribesYouHtml='';
			whatBestDescribesYouHtml+='<label for="whatBestDescribesUser">What best describes you:</label>';
			whatBestDescribesYouHtml+='<select class="form-control" id="whatBestDescribesUser" name="whatBestDescribesUser[]" placeholder="What best describes you" multiple="multiple">';
			$.each( photographerTypesArr, function( key, value ) {
				if($.inArray(key, whatBestDescribesYouArr) !== -1){
					whatBestDescribesYouHtml+='	<option value="'+key+'" selected>'+value+'</option>';
				}else{
					whatBestDescribesYouHtml+='	<option value="'+key+'">'+value+'</option>';
				}
			});
			whatBestDescribesYouHtml+='</select>';
			$("#whatBestDescribesYouContainer").html(whatBestDescribesYouHtml);

			var skillsArr=skills.split(',');
			var userSkillsHtml='';
			userSkillsHtml+='<label for="userSkills">Skills:</label>';
			userSkillsHtml+='<select class="form-control" id="userSkills" name="userSkills[]" placeholder="Skills" multiple="multiple">';
			$.each( photographerSkillsArr, function( key, value ) {
				if($.inArray(key, skillsArr) !== -1){
					userSkillsHtml+='	<option value="'+key+'" selected>'+value+'</option>';
				}else{
					userSkillsHtml+='	<option value="'+key+'">'+value+'</option>';
				}
			});
			userSkillsHtml+='</select>';

			$("#userSkillsContainer").html(userSkillsHtml);

			/* Initilize  Select2 select boxes */
			$("#whatBestDescribesUser").select2({ 
				placeholder: "What best describes you",
				maximumSelectionLength: 4
			});
			$("#userSkills").select2({ 
				placeholder: "Skills"
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
/**
* Load User informations end
**/
function changeProfilePhoto(){
	$("#profilePhoto").val("");
	$("#uploadSection").show();
	$("#previewSection").hide();
}


$('input[type=radio][name=isUserAvailableForPaid]').change(function() {
    if($("#radioBtnContainer").children('.validation-fields').length > 0) {
		$("#radioBtnContainer").children('.validation-fields').remove();
	}
});

var $profilePic = $('#circle');
$profilePic.croppie({
    enableExif: true,
    viewport: {
        width: 180,
        height: 180,
        type: 'circle'
    },
    boundary: {
        width: 300,
        height: 300
    }
});


/* Store Profile information start */
$('#profileSaveBtn').on('click', function(){

	var userFirstName=$("#userFirstName").val();
	var userLastName=$("#userLastName").val();
	var userLocation=$("#userLocation").val();
	var userProfilePhoto=$("#userProfilePhoto").val();
	var profilePhoto=$("#profilePhoto").val();
	var flag=0;
	/* validation start */
	if(userFirstName==""){
	    showPlainValidationError('userFirstName', 'First name is required.');
	    flag=1;
	}
	if(userLastName==""){
	    showPlainValidationError('userLastName', 'Last name is required.');
	    flag=1;
	}
	if(userLocation==""){
	    showPlainValidationError('userLocation', 'Location is required.');
	    flag=1;
	}
	if($('input[name=isUserAvailableForPaid]:checked').length<=0)
	{
		if($("#radioBtnContainer").children('.validation-fields').length == 0) {
			$("#radioBtnContainer").append('<div class="input-plain-validation validation-fields">Are you available for paid photography is required.</div>');
		}
	    flag=1;
	}

	if(profilePhoto=="")
	{
		if($(".profileDragAndDropContainer").children('.validation-fields').length == 0) {
			$(".profileDragAndDropContainer").append('<div class="input-plain-validation validation-fields">Uploading your portrait is required.</div>');
		}
	    flag=1;
	}
	/* validation start */
	if (flag!=0) 
	{
	    return false;
	}

	
    //Get the size of the image returned from croppie.
    if(profilePhoto!=2){
    	$profilePic.croppie('result', {
	      type: 'base64'
	    }).then(function(res) {  
	    	var formData = $('#profileImageupload').serializeArray();
		    formData.push({name: 'base64_circle_image', value: res});
			var request = $.ajax({
			    url: BASE_URL+"live/public/api/v1/users/profile/update",
			    headers: {
			        "Authorization" : "Bearer "+token
			    },
			    type: "POST",
			    data: formData,
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
						var errorData=null;
				        var errorMsg="";
				        try {
				              errorData = JSON.parse(responseData.content); 
				        } catch (e) {
				              errorData = responseData.content;
				        }
				        if(errorData.isUserAvailableForPaid!=null){
				        	if($("#radioBtnContainer").children('.validation-fields').length == 0) {
								$("#radioBtnContainer").append('<div class="input-plain-validation validation-fields">Are you available for paid photography is required.</div>');
							}
				              //errorMsg +=errorData.password+"<br>";
				        }
				        if(errorData.userFirstName!=null){
				        	showPlainValidationError('userFirstName', 'First name is required.');
				            //errorMsg +=errorData.email+"<br>";
				        }
				        if(errorData.userLastName!=null){
				        	showPlainValidationError('userLastName', 'Last name is required.');
				            //errorMsg +=errorData.email+"<br>";
				        }
				        if(errorData.userLocation!=null){
				        	showPlainValidationError('userLocation', 'Location is required.');
				            //errorMsg +=errorData.email+"<br>";
				        }
				        if(errorData.base64_circle_image!=null){
				        	if($(".profileDragAndDropContainer").children('.validation-fields').length == 0) {
								$(".profileDragAndDropContainer").append('<div class="input-plain-validation validation-fields">Uploading your portrait is required.</div>');
							}
				            //errorMsg +=errorData.email+"<br>";
				        }
				        if(errorData.profilePhoto!=null){
				        	if($(".profileDragAndDropContainer").children('.validation-fields').length == 0) {
								$(".profileDragAndDropContainer").append('<div class="input-plain-validation validation-fields">Uploading your portrait is required.</div>');
							}
				            //errorMsg +=errorData.email+"<br>";
				        }
				        //errorMsg=errorMsg.replace(/<br>+$/,'');
				        //$('#signinErrorMsg').html(errorMsg);
						break;
					case 2: 
						//console.log('2');
						var successData = null;
				      	try {
				          	successData = JSON.parse(responseData.content); 
				      	} catch (e) {
				          	successData = responseData.content;
				      	}
				      	$("#profilePhoto").val("");
				      	location.reload();
				      	//$('#profileImageupload')[0].reset();
				      	//alert(responseData.message);
				      	console.log(successData);
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
    }else{
    	var formData = $('#profileImageupload').serializeArray();
		var request = $.ajax({
		    url: BASE_URL+"live/public/api/v1/users/profile/update",
		    headers: {
		        "Authorization" : "Bearer "+token
		    },
		    type: "POST",
		    data: formData,
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
					var errorData=null;
			        var errorMsg="";
			        try {
			              errorData = JSON.parse(responseData.content); 
			        } catch (e) {
			              errorData = responseData.content;
			        }
			        if(errorData.isUserAvailableForPaid!=null){
			        	if($("#radioBtnContainer").children('.validation-fields').length == 0) {
							$("#radioBtnContainer").append('<div class="input-plain-validation validation-fields">Are you available for paid photography is required.</div>');
						}
			              //errorMsg +=errorData.password+"<br>";
			        }
			        if(errorData.userFirstName!=null){
			        	showPlainValidationError('userFirstName', 'First name is required.');
			            //errorMsg +=errorData.email+"<br>";
			        }
			        if(errorData.userLastName!=null){
			        	showPlainValidationError('userLastName', 'Last name is required.');
			            //errorMsg +=errorData.email+"<br>";
			        }
			        if(errorData.userLocation!=null){
			        	showPlainValidationError('userLocation', 'Location is required.');
			            //errorMsg +=errorData.email+"<br>";
			        }
			        if(errorData.base64_circle_image!=null){
			        	if($(".profileDragAndDropContainer").children('.validation-fields').length == 0) {
							$(".profileDragAndDropContainer").append('<div class="input-plain-validation validation-fields">Uploading your portrait is required.</div>');
						}
			            //errorMsg +=errorData.email+"<br>";
			        }
			        if(errorData.profilePhoto!=null){
			        	if($(".profileDragAndDropContainer").children('.validation-fields').length == 0) {
							$(".profileDragAndDropContainer").append('<div class="input-plain-validation validation-fields">Uploading your portrait is required.</div>');
						}
			            //errorMsg +=errorData.email+"<br>";
			        }
			        //errorMsg=errorMsg.replace(/<br>+$/,'');
			        //$('#signinErrorMsg').html(errorMsg);
					break;
				case 2: 
					//console.log('2');
					var successData = null;
			      	try {
			          	successData = JSON.parse(responseData.content); 
			      	} catch (e) {
			          	successData = responseData.content;
			      	}
			      	$("#profilePhoto").val("");
			      	location.reload();
			      	//$('#profileImageupload')[0].reset();
			      	//alert(responseData.message);
			      	console.log(successData);
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
    }

    
});
/* Store Profile information end */


/* Textarea max limit */
$('#aboutUserSelf').keyup(function () {
    var tlength = $(this).val().length;
    $(this).val($(this).val().substring(0, 200));
    var tlength = $(this).val().length;
    remain = 200 - parseInt(tlength);
    $('#remain').text(remain);
});


/* Google API Location*/
/*function init() {
    var input = document.getElementById('userLocation');
    var autocomplete = new google.maps.places.Autocomplete(input);
}
google.maps.event.addDomListener(window, 'load', init);*/

