// $(function() {
    var token=getCookie('token');
    if(token!=null){
      window.location.href=BASE_URL+"home.html";
    }

    var provider = getUrlParameter('provider');
    var code = getUrlParameter('code');
    var oauth_token = getUrlParameter('oauth_token');
    var oauth_verifier = getUrlParameter('oauth_verifier');
    var tempId = getUrlParameter('tempId');


    //FACEBOOK LOGIN REDIRECTION START

    if(provider == "facebook" && (typeof code !== "undefined" && code!="")){
        var request = $.ajax({
          url: BASE_URL+"live/public/api/v1/login/facebook/callback?code="+code,
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
          var userData = null;
          try {
              userDate = JSON.parse(response); 
          } catch (e) {
              userData = response;
          }
          console.log(userData);
          if(userData.status==2){
            console.log(userData);
            setCookie('token', userData.content.access_token, userData.content.expires_in);
            /*setCookie('token', userData.content.access_token, 2*365);
            setCookie('userId', userData.content.user_id, 2*365);
            setCookie('userName', userData.content.name, 2*365);
            setCookie('userPhoto', userData.content.photo, 2*365);*/
            window.location.href=BASE_URL+"home.html"; 
          }else{
            console.log(userData);
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

    //FACEBOOK LOGIN REDIRECTION END



    // TWITTER LOGIN REDIRECTION START

    if(provider == "twitter" && (typeof oauth_token !== "undefined" && oauth_token!="") && (typeof oauth_verifier !== "undefined" && oauth_verifier!="") && (typeof tempId !== "undefined" && tempId!="")){
      //var twitter_auth_secret=getCookie('twitter_auth_secret');
      //alert(oauth_token);  
      var request = $.ajax({
        url: BASE_URL+"live/public/api/v1/login/twitter/callback?tempId="+tempId+"&oauth_token="+oauth_token+"&oauth_verifier="+oauth_verifier,
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
        //alert(response);
        var userData = null;
        try {
            userDate = JSON.parse(response); 
        } catch (e) {
            userData = response;
        }
        
        if(userData.status==2){
          console.log(userData);
          setCookie('token', userData.content.access_token, userData.content.expires_in);
          /*setCookie('userId', userData.content.user_id, 2*365);
          setCookie('userName', userData.content.name, 2*365);
          setCookie('userPhoto', userData.content.photo, 2*365);*/
          window.location.href=BASE_URL+"home.html"; 
        }else{
          console.log(userData);
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
    // TWITTER LOGIN REDIRECTION END
    
// });



//Facebook login button click
$('#facebookLoginBtn').on('click', function(e){
  e.preventDefault();
  window.location.href=BASE_URL+"live/public/api/v1/login/facebook"; 
});


$('#twitterLoginBtn').on('click', function (e) {
  e.preventDefault();
  //alert("hello");
  window.location.href=BASE_URL+"live/public/api/v1/login/twitter"; 
  

  // var request = $.ajax({
  //     url: BASE_URL+"live/public/api/v1/twitter-login-url",
  //     type: "GET",
  //     beforeSend:function(){
  //       showLoader();
  //       //$('#signinErrorMsg').html('');
  //     },
  //     complete:function(jqXHR, status){
  //       hideLoader();
  //     }
  //   });
  //   request.done(function(response) {
  //     //alert(response);
  //     var userData = null;
  //     try {
  //         userDate = JSON.parse(response); 
  //     } catch (e) {
  //         userData = response;
  //     }

  //     if(userData.status==2){
  //       //alert(userData.content);
  //       setCookie('twitter_auth_secret', userData.auth_secret, 345267);
  //       window.location.href=userData.content.url;  
  //     }else{
  //       console.log(userData);
  //     }

      
  //   });

  //   request.fail(function(jqXHR, textStatus) {
  //     var errorData = null;
  //     try {
  //         errorData = JSON.parse(jqXHR); 
  //     } catch (e) {
  //         errorData = jqXHR;
  //     }
  //     console.log("Error : "+errorData);
  //   });

});



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
      url: BASE_URL+"live/public/api/v1/login",
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
          setCookie('token', userData.content.access_token, userData.content.expires_in);
          window.location.href=BASE_URL+"home.html";
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

$("#forgotPasswordEmail").keyup(function(){
    var emailVal=$("#forgotPasswordEmail").val();
    if (!validateEmail(emailVal)) {
      showValidationError('forgotPasswordEmail', 'Invalid email address.');
    }else{
      removeValidationError('forgotPasswordEmail', 'Invalid email address.');
    }
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

// Enter press event on SignUp form
$('.tirggerOnEnterSignup').keypress(function (e) {
 var key = e.which;
 if(key == 13)  // the enter key code
  {
    $('#signupBtn').click();
    return false;  
  }
});


// Enter press event on Forgot password form
$('.tirggerOnEnterForgotPassword').keypress(function (e) {
  var key = e.which;
  if(key == 13)  // the enter key code
  {
    $('#forgotPasswordSubmitBtn').click();
    return false;  
  }
}); 

// Enter press event on Reset password form
$('.tirggerOnEnterSetPassword').keypress(function (e) {
  var key = e.which;
  if(key == 13)  // the enter key code
  {
    $('#setPasswordSubmitBtn').click();
    return false;  
  }
}); 



//New user Button click
$('#newUserBtn').on('click', function (e) {
  $("#user-signed-out").slideUp("slow");
  $("#forgotPasswordContainer").slideUp("slow");
  $("#newUser").slideDown("slow");
});


//New user Back Button click 
$('#newUserBackBtn').on('click', function (e) {
  //alert(1);
  signupForm.reset();
  strength_bar = '0';
  progressClass = 'danger';
  ariaMsg = '0% Complete (danger)';
  $('#password-progress-bar').removeClass().addClass(progressClass);
  $('#password-progress-bar').attr('aria-valuenow', strength_bar);
  $('#password-progress-bar').css('width', strength_bar);
  $('#password-progress-bar').find('span.sr-only').text(ariaMsg);
  $('#usernameErrorMsg').removeClass();
  $('#usernameErrorMsg').html('');
  $('#emailErrorMsg').removeClass();
  $('#emailErrorMsg').html('');
  $('#signupErrorMsg').html("");
  $('#passCheckMsg').removeClass();
  $('#passCheckMsg').html("");
  $("#newUser").slideUp();
  $("#user-signed-out").slideDown("slow");
});

//Forgot password button click
$('#forgotPasswordBtn').on('click', function (e) {
  $("#user-signed-out").slideUp("slow");
  $("#newUser").slideUp("slow");
  $("#forgotPasswordContainer").slideDown("slow");
});

//Forgot Password Back Button click
$('#frogotPasswordBackBtn').on('click', function(e){
  $("#newUser").slideUp("slow");
  $("#forgotPasswordContainer").slideUp("slow");
  $("#user-signed-out").slideDown("slow");
});

//Forgot Password Submit
$('#forgotPasswordSubmitBtn').on('click', function(e){
  //alert('How u doing !');
  var data = {
      email: $('#forgotPasswordEmail').val()
  };
  var flag=0;

  if (!validateEmail(data.email)) {
    flag=1;
    showValidationError('forgotPasswordEmail', 'Invalid email address.');
  }

  if(flag!=0){
    return false;
  }

  var request = $.ajax({
    url: BASE_URL+"live/public/api/v1/users/send-reset-password-link",
    headers: {
        "Authorization" : "Bearer "+token
    },
    type: "POST",
    data: {
      'email' : data.email
    },
    beforeSend:function(){
      showLoader();
      $('#forgotPasswordErrorMsg').html('');
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
      if(errorData.email!=null){
        showValidationError('forgotPasswordEmail', errorData.email);
      }
      break;
    case 2: 
      //console.log('2');
      var successData = null;
      try {
          successData = JSON.parse(responseData.content); 
      } catch (e) {
          successData = responseData.content;
      }
      $('#forgotPasswordForm')[0].reset();
      //alert(responseData.message);
      $('#forgotPasswordErrorMsg').html(successData);
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



// Create Account Button Click
$('#signupBtn').on('click', function (e) {
  var data = {
      name: $('#signupName').val(), 
      email: $('#signupEmail').val(), 
      password: $('#signupPassword').val()
  };
  var flag=0;

  if (data.name < 3) {
    flag=1;
    showValidationError('signupName', 'Name must be 3 characters long or more.');
    /*$('#usernameErrorMsg').addClass('text-danger');
    $('#usernameErrorMsg').html('Name must be 3 characters long or more.');*/
  }
  if (!validateEmail(data.email)) {
    flag=1;
    showValidationError('signupEmail', 'Invalid email address.');
    /*$('#emailErrorMsg').addClass('text-danger');
    $('#emailErrorMsg').html('Invalid email address.');*/
  }
  if(data.password==""){
    flag=1;
    showValidationError('signupPassword', 'Password is required.');
  }

  if(flag!=0){
    return false;
  }
    var request = $.ajax({
        url: BASE_URL+"live/public/api/v1/users/register",
        type: "POST",
        data: {
          'name' : data.name,
          'email' : data.email,
          'password' : data.password
        },
        beforeSend:function(){
          showLoader();
          $('#signupErrorMsg').html('');
        },
        complete:function(jqXHR, status){
          hideLoader();
        }

      });
    request.done(function(response) {
      //alert(JSON.parse(response));
      var userData = null;
      try {
          userDate = JSON.parse(response); 
      } catch (e) {
          userData = response;
      }
      //alert(userData);
      console.log(userData);
      var status = userData.status;
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
          if(errorData.name!=null){
              errorMsg +=errorData.name+"<br>";
          }
          errorMsg=errorMsg.replace(/<br>+$/,'');
          $('#signupErrorMsg').html(errorMsg);
          break;
        case 2: 
          setCookie('token', userData.content.access_token, userData.content.expires_in);
          // setCookie('userId', userData.content.user_id, userData.content.expires_in);
          // setCookie('userName', userData.content.name, userData.content.expires_in);
          // setCookie('userPhoto', userData.content.photo, userData.content.expires_in);
          window.location.href=BASE_URL+"home.html";
          break;
        case 3: 
          $('#signupErrorMsg').html(userData.message);
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
      $('#signupErrorMsg').html("Something went wrong! please try again later.");
      //alert( "Request failed: " + textStatus );
    });

  
  
});


$("#signupPassword").keyup(function(){
  var passwordValue=$('#signupPassword').val();
  
  checkStrength($('#signupPassword').val());
  //$("#passCheckMsg").html(checkStrength($('#signupPassword').val()));
  if(passwordValue.length > 0){
    $("#signupPassword").parent().children('.progress').show();
    $("#signupPassword").parent().children('#passCheckMsg').show();
    removeValidationError('signupPassword', 'Password is required.');
  }else{
    $("#signupPassword").parent().children('.progress').hide();
    $("#signupPassword").parent().children('#passCheckMsg').hide();
    showValidationError('signupPassword', 'Password is required.');
  }
});

$("#signupName").keyup(function(){
  var nameVal=$("#signupName").val();
  if ( nameVal.length < 3) {
    showValidationError('signupName', 'Name must be 3 characters long or more.');
    /*$('#usernameErrorMsg').addClass('text-danger');
    $('#usernameErrorMsg').html('Name must be 3 characters long or more.');*/
  }else{
    removeValidationError('signupName', 'Name must be 3 characters long or more.');
    /*$('#usernameErrorMsg').removeClass();
    $('#usernameErrorMsg').html('');*/
  }
});

$("#signupEmail").keyup(function(){
  var emailVal=$("#signupEmail").val();
  if (!validateEmail(emailVal)) {
    showValidationError('signupEmail', 'Invalid email address.');
    /*$('#emailErrorMsg').addClass('text-danger');
    $('#emailErrorMsg').html('Invalid email address');*/
  }else{
    removeValidationError('signupEmail', 'Invalid email address.');
    /*$('#emailErrorMsg').removeClass();
    $('#emailErrorMsg').html('');*/
  }
});

