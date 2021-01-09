// $(function() {
    var token=getCookie('admin-token');
    if(token!=null){
      window.location.href=BASE_URL+"secure/home.html";
    }
//});
/* Validation  Functions start */

function showValidationError(fieldId, message){
  $("#"+fieldId).addClass('validation-error');
  var valiHtml='<div class="input-validation validation-fields">'+message+'</div><span class="form-control-feedback validation-fields"><i class="fal fa-exclamation-triangle"></i></span>';
  if($("#"+fieldId).parent().children('.validation-fields').length == 0) {
    $("#"+fieldId).parent().append(valiHtml);
  }
}

function removeValidationError(fieldId, message){
  if($("#"+fieldId).val().length > 0){
    $("#"+fieldId).parent().children('.validation-fields').remove();
    $("#"+fieldId).removeClass('validation-error');
  }else{
    showValidationError(fieldId, message);
  }
}

/* Validation  Functions end */

//Sign in with email and password
$('#signinBtn').on('click', function (e) {
  //alert('hello');
  e.preventDefault();
  //showLoader();
  var data = {
      email: $('#signin-email').val(), 
      password: $('#signin-password').val()
  };

  var flag=0;
  if(data.email==""){
    showValidationError('signin-email', 'Email id is required.');
    flag=1;
  }
  if(data.password==""){
    showValidationError('signin-password', 'Password is required.');
    flag=1;
  }

  if (flag!=0) 
  {
    return false;
  }

  // if( data.email != '' && data.password != ''){ #ffcc00

    var request = $.ajax({
      url: BASE_URL+"live/public/api/v1/admin/login",
      type: "POST",
      data: {
        'email' : data.email,
        'password' : data.password
      },
      beforeSend:function(){
        showLoader();
        $('#signinErrorMsg').html('');
      },
      complete:function(jqXHR, status){
        hideLoader();
      }
    });
    request.done(function(response) {
      var userData = null;
      try {
          userDate = JSON.parse(response); 
      } catch (e) {
          userData = response;
      }
      console.log(userData);
      var status=userData.status;
      switch (status) { 
        case 1: 
          var errorData=null;
          var errorMsg="";
          try {
              errorData = JSON.parse(userData.content); 
          } catch (e) {
              errorData = userData.content;
          }
          if(errorData.password!=null){
              errorMsg +=errorData.password+"<br>";
          }
          if(errorData.email!=null){
              errorMsg +=errorData.email+"<br>";
          }
          errorMsg=errorMsg.replace(/<br>+$/,'');
          $('#signinErrorMsg').html(errorMsg);
          break;
        case 2: 
          console.log(userData);
          setCookie('admin-token', userData.content.access_token, userData.content.expires_in);
          window.location.href=BASE_URL+"secure/home.html";
          break;
        case 3: 
          $('#signinErrorMsg').html(userData.content.message);
          break;
        default:
          console.log(userData);
          alert('Something went wrong! please try again later.');
      }
    });

    request.fail(function(jqXHR, textStatus) {
      var errorData = null;
      try {
          errorData = JSON.parse(jqXHR); 
      } catch (e) {
          errorData = jqXHR;
      }
      console.log(errorData);
      $('#signinErrorMsg').html("Something went wrong! please try again later.");
    });
  /*}*/
});


$("#signin-email").keyup(function(){
  removeValidationError('signin-email', 'Email id is required.');
});

$("#signin-password").keyup(function(){
  removeValidationError('signin-password', 'Password is required.');
});


// Enter press event on Sign In form
$('.tirggerOnEnterSignin').keypress(function (e) {
 var key = e.which;
 if(key == 13)  // the enter key code
  {
    $('#signinBtn').click();
    return false;  
  }
}); 