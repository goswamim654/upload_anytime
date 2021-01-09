$(document).ready(function () {
	/* Get User Images Start */
	var request = $.ajax({
	    url: BASE_URL+"live/public/api/v1/users/less-detailed-images",
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
				var arrayLenght=responseData.content.data.length;
				var cnt=1;
				console.log(arrayLenght);
				$.each( responseData.content.data, function( key, value ) {
					var rowData = null;
			      	try {
			          	rowData = JSON.parse(value); 
			      	} catch (e) {
			          	rowData = value;
			      	}
				  	//alert( key + ": " + rowData.image );
				  	if(rowData.id){
				  		var html = '';
					  	html+='<div class="imageDetailsRow">';
				    	html+='		<div class="imageDiv">';
						html+='			<img src="'+rowData.image_medium+'">';
						html+='		</div>';
						html+='		<div class="detailsCnr">';
						html+='			<div class="form-group">';
				        html+='                <input type="text" class="form-control" placeholder="Title" id="imageTitle'+rowData.id+'" name="imageTitle'+rowData.id+'">';
				        html+='                <input type="hidden" name="imageId'+cnt+'" value="'+rowData.id+'">';
				        html+='         </div>';
				        html+='             <div class="form-group">';
				        html+='            	<select class="form-control imageDetailsCategories" id="imageCategory'+rowData.id+'" name="imageCategory'+rowData.id+'[]" multiple="multiple">';
				        $.each( categorySelectOptions, function( key, value ) {
				        	html+='<option value="'+key+'">'+value+'</option>';
				        });
						html+='				</select>';
				        html+='            	<div id="selectedCategory">';
				        html+='           	</div>';
				        html+='            	</div>';
				        html+='         <div class="form-group">';
				        html+='         	<textarea class="form-control" id="imageDescription'+rowData.id+'" name="imageDescription'+rowData.id+'" placeholder="Description"></textarea>';
				        html+='         </div>';
						html+='		</div>';
						html+='	</div>';
						html+='	<div class="clearfix"></div>';

						$("#imageDetailsContainer").append(html);

						$("#imageCategory"+rowData.id).select2({ 
				    		placeholder: "Select Categories",
				    		maximumSelectionLength: 3
				    	});

				    	$("#imageDetailsFormContinueBtn").removeClass('disabled');
				  	}else{
				  		console.log("Something went wrong : "+rowData);
				  	}
				  	cnt++;
				});

				var numHtml='<input type="hidden" name="totalNumberOfSet" id="totalNumberOfSet" value="'+arrayLenght+'">';
				$("#totalNumberOfSet").remove();
				$("#imageDetailsContainer").append(numHtml);
				break;
			case 3: 
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

	/* Get User Images End */



	/* Image details form Submit start */
	$("#imageDetailsFormContinueBtn").on("click", function(e){

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

		var formData = $('#imagedetails').serializeArray();
		/*formData.push({name: 'userId', value: userId});*/


		var imageTitle=$("#imageTitle").val();
		var request = $.ajax({
		    url: BASE_URL+"live/public/api/v1/users/store-image-details",
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
					alert('Image title field(s) can not be blank.');
					break;
				case 2: 
					//alert('2');
					var successData = null;
			      	try {
			          	successData = JSON.parse(responseData.content); 
			      	} catch (e) {
			          	successData = responseData.content;
			      	}
			      	console.log(successData);
			      	window.location.href=BASE_URL+"photo-upload-success";
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
	});
	/* Image details form Submit end */

});