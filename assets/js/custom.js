/* Initialize tool tip */
$(document).ready(function(){
    //alert(1);
    $('[data-toggle="tooltip"]').tooltip();
});

$.date = function(dateObject) {
    var d = new Date(dateObject);
    var day = d.getDate();
    var month = d.getMonth() + 1;
    var year = d.getFullYear();

    if (day < 10) {
        day = "0" + day;
    }
    if (month < 10) {
        month = "0" + month;
    }
    var date = day + "/" + month + "/" + year;

    return date;
};

$.dateWithHoursMinutes = function(dateObject) {
    var d = new Date(dateObject);
    var day = d.getDate();
    var month = d.getMonth() + 1;
    var year = d.getFullYear();
    var hours = d.getHours();
    var minutes = d.getMinutes();

    if (hours < 10) hours = '0' + hours;
    if (minutes < 10) minutes = '0' + minutes;

    if (day < 10) {
        day = "0" + day;
    }
    if (month < 10) {
        month = "0" + month;
    }
    var date = day + "/" + month + "/" + year+" "+hours+":"+minutes;

    return date;
};

function getUrlSlug(position){
  var str=window.location.pathname;
  str = str.replace(/\/+$/, "");
  var pathArray = str.split( '/' );
  if(pathArray.length >= position){
    return pathArray[pathArray.length - position];  
  }else{
    return "";
  }
}

function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? "" : sParameterName[1];
        }
    }
};

function setCookie(c_name,value,exdays) {
    var exdate=new Date();
    exdate.setDate(exdate.getDate() + exdays);
    var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
    document.cookie=c_name + "=" + c_value;
}

function getCookie(c_name) {
    var i,x,y,ARRcookies=document.cookie.split(";");
    for (i=0;i<ARRcookies.length;i++) {
        x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
        y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
        x=x.replace(/^\s+|\s+$/g,"");
        if (x==c_name) {
            return unescape(y);
        }
    }
}

function deleteCookie( name ) {
  document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}


function showLoader(){
  $('.pageLoader').show();
}

function hideLoader(){
  $('.pageLoader').hide();
}



function checkStrength(password) {
  //alert(1);
  var strength = 0;
  var strength_bar = '0';
  var progressClass = 'progress-bar progress-bar-';
  var ariaMsg = '0% Complete (danger)';
  //var $progressBarElement = $('#password-progress-bar');

  if (password.length > 6) strength += 1
  // If password contains both lower and uppercase characters, increase strength value.
  if (password.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/)) strength += 1
  // If it has numbers and characters, increase strength value.
  if (password.match(/([a-zA-Z])/) && password.match(/([0-9])/)) strength += 1
  // If it has one special character, increase strength value.
  if (password.match(/([!,%,&,@,#,$,^,*,?,_,~])/)) strength += 1
  // If it has two special characters, increase strength value.
  if (password.match(/(.*[!,%,&,@,#,$,^,*,?,_,~].*[!,%,&,@,#,$,^,*,?,_,~])/)) strength += 1
  // Calculated strength value, we can return messages
  // If value is less than 2
  if(strength < 1 && password.length < 1){
    strength_bar = '0';
    progressClass += 'danger';
    ariaMsg = '0% Complete (danger)';
  }else if(strength < 1 && password.length < 6){
    strength_bar = '10%';
    progressClass += 'danger';
    ariaMsg = '10% Complete (danger)';
  }else if (strength < 2) {
    strength_bar = '30%';
    progressClass += 'warning';
    ariaMsg = '30% Complete (warning)';
    $('#passCheckMsg').removeClass()
    $('#passCheckMsg').addClass('text-warning')
  //return 'Weak'
  } else if (strength == 2) {
    strength_bar = '60%';
    progressClass += 'info';
    ariaMsg = '60% Complete (info)';
    $('#passCheckMsg').removeClass()
    $('#passCheckMsg').addClass('text-info')
    //return 'Good'
  } else {
    strength_bar = '100%';
    progressClass += 'success';
    ariaMsg = '100% Complete (success)';
    $('#passCheckMsg').removeClass()
    $('#passCheckMsg').addClass('text-success')
    //return 'Strong'
  }
  //alert(ariaMsg);
  $('#password-progress-bar').removeClass().addClass(progressClass);
  $('#password-progress-bar').attr('aria-valuenow', strength_bar);
  $('#password-progress-bar').css('width', strength_bar);
  $('#password-progress-bar').find('span.sr-only').text(ariaMsg);
}

//Email Validation
function validateEmail(sEmail) {
  var filter = /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;
  if (filter.test(sEmail)) {
      return true;
  }else{
      return false;
  }
}

// Image upload btn click
$(".uploadIcon").on("click", function(e){
  //window.history.pushState("", "", '/newpage');
  window.location.href="https://www.snaplava.com/upload-photos";
});

/* Validation  Functions start */

function showPlainValidationError(fieldId, message){
  //$("#"+fieldId).addClass('validation-error');
  var valiHtml='<div class="input-plain-validation validation-fields">'+message+'</div>';
  if($("#"+fieldId).parent().children('.validation-fields').length == 0) {
    $("#"+fieldId).parent().append(valiHtml);
  }
}

$(".validation-class").bind("keyup change", function() {
  var value=$(this).val();
  if(value.length > 0){
    if($(this).parent().children('.validation-fields').length > 0) {
      $(this).parent().children('.validation-fields').remove();
    }
  }
});


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













/* Facebook Scripts Satrt */
/*window.fbAsyncInit = function() {
    FB.init({
        appId   : '2065936113686030',
        oauth   : true,
        status  : true, // check login status
        cookie  : true, // enable cookies to allow the server to access the session
        xfbml   : true // parse XFBML
    });

    // Now that we've initialized the JavaScript SDK, we call 
    // FB.getLoginStatus().  This function gets the state of the
    // person visiting this page and can return one of three states to
    // the callback you provide.  They can be:
    //
    // 1. Logged into your app ('connected')
    // 2. Logged into Facebook, but not your app ('not_authorized')
    // 3. Not logged into Facebook and can't tell if they are logged into
    //    your app or not.
    //
    // These three cases are handled in the callback function.

    FB.getLoginStatus(function(response) {
      statusChangeCallback(response);
    });
  };

function fb_login(){
    FB.login(function(response) {

        if (response.authResponse) {
            console.log('Welcome!  Fetching your information.... ');
            console.log(response); // dump complete info
            access_token = response.authResponse.accessToken; //get access token
            user_id = response.authResponse.userID; //get FB UID

            FB.api('/me?locale=en_US&fields=id,name,email,picture', function(response) {
              console.log(response);
              var data = {
              name: response.name != null ? response.name : "", 
              email: response.email != null ? response.email : "", 
              password: ""
          };
                //user_email = response.email; //get user email
              // you can store this data into your database    

              var request = $.ajax({
              url: BASE_URL+"live/public/api/v1/facebook-users",
              type: "POST",
              data: response,
              beforeSend:function(){
                showLoader();
                $('#signupErrorMsg').html('');
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
            console.log(userData);
            if(userData.status==1 || userData.status==3){
              var errorData=null;
              var errorMsg="";
              try {
                  errorData = JSON.parse(userData.message); 
              } catch (e) {
                  errorData = userData.message;
              }
              
              $('#signupErrorMsg').html(errorMsg);
            }else if(userData.status==2){
              //alert(userData.content.access_token);
              setCookie('token', userData.content.access_token, userData.content.expires_in);
              window.location.href=BASE_URL+"home.html";
            }else{
              $('#signupErrorMsg').html('Something went wrong!');
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
            $('#signupErrorMsg').html("Something went wrong, please try again later!");
            //alert( "Request failed: " + textStatus );
          });

            });

        } else {
            //user hit cancel button
            console.log('User cancelled login or did not fully authorize.');

        }
    }, {
        scope: 'public_profile,email'
    });
}
// (function() {
//     var e = document.createElement('script');
//     e.src = document.location.protocol + '//connect.facebook.net/en_US/all.js';
//     e.async = true;
//     document.getElementById('fb-root').appendChild(e);
// }());

function fb_logout(){
  FB.logout(function(response) {
    console.log("Logout");
    console.log(response.authResponse);
    if(response){
      window.location.href=BASE_URL;
    }
  });
  //window.location.href=BASE_URL;
}


// This is called with the results from from FB.getLoginStatus().
function statusChangeCallback(response) {
    console.log('statusChangeCallback');
    console.log(response);
    // The response object is returned with a status field that lets the
    // app know the current login status of the person.
    // Full docs on the response object can be found in the documentation
    // for FB.getLoginStatus().
    if (response.status === 'connected') {
      // Logged into your app and Facebook.
      testAPI();
    } else {
      // The person is not logged into your app or we are unable to tell.
      // document.getElementById('status').innerHTML = 'Please log ' +
      //   'into this app.';
    }
}

  // This function is called when someone finishes with the Login
  // Button.  See the onlogin handler attached to it in the sample
  // code below.
  function checkLoginState() {
    FB.getLoginStatus(function(response) {
      statusChangeCallback(response);
    });
  }


function testAPI() {
    console.log('Welcome!  Fetching your information.... ');
    FB.api('/me?locale=en_US&fields=id,name,email,picture', function(response) {
      // console.log('Successful login for: ' + response.name);
      // console.log(response);
      // document.getElementById('status').innerHTML =
      //   'Thanks for logging in, ' + response.name + '!';
    }, {scope: 'public_profile,email'});
}*/
/* Facebook Scripts End */