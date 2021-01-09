var dbRef = firebase.database();
var usersRef = dbRef.ref('user_details');

//Page Array 
var pageArr=["home", "profile"];


//Sign in with email and password
$('#signinBtn').on('click', function (e) {
  //alert('hello');
  e.preventDefault();
  var data = {
      email: $('#signin-email').val(), 
      password: $('#signin-password').val()
  };
  if( data.email != '' && data.password != ''){
    firebase.auth().signInWithEmailAndPassword(data.email, data.password).then(function() {
      window.location.href="https://www.snaplava.com/home.html";
    }).catch(function(error) {
      // An error happened.
      console.log("Error:", error);
      var errorCode = error.code;
      var errorMessage = error.message;
      $("#signinErrorMsg").html(errorMessage);
    });
  }
});

//Signout user
$("#head-sign-out").on('click', function(e){
  e.preventDefault();
  firebase.auth().signOut();
});


// Create Account Button Click
$('#signupBtn').on('click', function (e) {
  var data = {
      name: $('#signupName').val(), 
      email: $('#signupEmail').val(), 
      password: $('#signupPassword').val(),
      phone_number: "",
      photo_url: ""
  };
  var flag=0;

  if (data.name < 3) {
    flag=1;
     $('#usernameErrorMsg').addClass('text-danger');
    $('#usernameErrorMsg').html('Name must be 3 characters long or more.');
  }
  if (!validateEmail(data.email)) {
    flag=1;
     $('#emailErrorMsg').addClass('text-danger');
    $('#emailErrorMsg').html('Invalid email address');
  }



  if(flag==0){
    alert(data.name);
    firebase.auth().createUserWithEmailAndPassword(data.email, data.password).then(function(user){
      //now user is needed to be logged in to save data
      /*console.log("Authenticated successfully with payload:", user);
      auth = user;*/
      //profile data
      usersRef
        .child(user.uid)
        .set(data)
        .then(function(){
          console.log("User Information Saved:", user.uid);
        })
      //$('#messageLabel').html(spanText('Success!', ['center', 'success']));
      //$('#messageLabel').html(spanText('Successfully created user account!', ['success']));
      signupForm.reset();
    })
    .catch(function(error){
      console.log("Error creating user:", error);
      $('#signupErrorMsg').html(error.message);
    });
  }
  
});




//New user Button click
$('#newUserBtn').on('click', function (e) {
  $("#user-signed-out").slideUp("slow");
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

$("#signupPassword").keyup(function(){
  checkStrength($('#signupPassword').val());
  //$("#passCheckMsg").html(checkStrength($('#signupPassword').val()));
});

$("#signupName").keyup(function(){
  var nameVal=$("#signupName").val();
  if ( nameVal.length < 3) {
    $('#usernameErrorMsg').addClass('text-danger');
    $('#usernameErrorMsg').html('Name must be 3 characters long or more.');
  }else{
    $('#usernameErrorMsg').removeClass();
    $('#usernameErrorMsg').html('');
  }
});

$("#signupEmail").keyup(function(){
  var emailVal=$("#signupEmail").val();
  if (!validateEmail(emailVal)) {
     $('#emailErrorMsg').addClass('text-danger');
    $('#emailErrorMsg').html('Invalid email address');
  }else{
    $('#emailErrorMsg').removeClass();
    $('#emailErrorMsg').html('');
  }
});

function checkStrength(password) {
  //alert(1);
  var strength = 0;
  var strength_bar = '0';
  var progressClass = 'progress-bar progress-bar-';
  var ariaMsg = '0% Complete (danger)';
  //var $progressBarElement = $('#password-progress-bar');

  /*if (password.length < 1) {
        strength_bar = '0';
        progressClass += 'danger';
        ariaMsg = '0% Complete (danger)';
  }else if (password.length < 6) {
    strength_bar = '10%';
    progressClass += 'danger';
    ariaMsg = '10% Complete (danger)';
    $('#passCheckMsg').removeClass()
    $('#passCheckMsg').addClass('text-danger')
    //return 'Minimum 6 characters required';
  }*/
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

//Close Preview Image
function closePreview(id){
  //alert("How u doing");
  $('#imgHolder-'+id).remove();
}


//On hashcahnge even 
$(window).on('hashchange', function (e) {
  alert('hello');
});

if (window.location.hash) {
    $(window).trigger('hashchange')
}


// Image upload btn click
$(".uploadIcon").on("click", function(e){
  //window.history.pushState("", "", '/newpage');
  window.location.href="https://www.snaplava.com/upload_images.html";
});


var imageCategoryArr = [];

// imageCategory Select-box onchnage 
// function categorySelect(id){
//   var cat=$("imageCategory"+id).val();
//   var html="";
//   if(imageCategoryArr.length<3){
//     imageCategoryArr.push(cat);

//   }else{
//     $("#imageCategory").val("");
//     return false;
//   }
//   $.each( imageCategoryArr, function( i, val ) {
//     html += '<span class="label label-primary">'+val+'</span>&nbsp;';
//   });

//   $("#selectedCategory").html(html);
// }
$("#imageCategory").on("change", function(){
  //alert('how u doing');
  var cat=this.value;
  var html="";
  if(imageCategoryArr.length<3){
    imageCategoryArr.push(cat);

  }else{
    $("#imageCategory").val("");
    return false;
  }
  $.each( imageCategoryArr, function( i, val ) {
    html += '<span class="label label-primary">'+val+'</span>&nbsp;';
  });

  $("#selectedCategory").html(html);
  //alert(JSON.stringify(imageCategoryArr));

});


//Facebook SignIn
var fbProvider = new firebase.auth.FacebookAuthProvider();

$("#facebookLoginBtn").on("click", function(e){

  firebase.auth().signInWithPopup(fbProvider).then(function(result) {
    // This gives you a Facebook Access Token. You can use it to access the Facebook API.
    var token = result.credential.accessToken;
    // The signed-in user info.
    var user = result.user;
    /*alert(JSON.stringify(user));
    usersRef.once('value', function(snapshot) {
        if (!snapshot.hasChild(user.uid)) {*/
            // usersRef.child(username).set({ name: username });
            //alert(JSON.stringify(user));
            //Custom variables
            var emailData="";
            var phoneNumberData="";
            var displayNameData="";
            var photoURLData="";
            var providerIdData="";

            if(user.providerData){
              user.providerData.forEach(function(item) {
                emailData=item.email;
                phoneNumberData=item.phoneNumber;
                displayNameData=item.displayName;
                photoURLData=item.photoURL;
                providerIdData=item.providerId;
              });
            }else{
              emailData=user.email;
              phoneNumberData=user.phoneNumber;
              displayNameData=user.displayName;
              photoURLData=user.photoURL;
              providerIdData=user.providerId;
            }
            var data = {
              name: (displayNameData != null) ? displayNameData : "", 
              email: (emailData != null) ? emailData : "", 
              password: "",
              phone_number: (phoneNumberData != null) ? phoneNumberData : "",
              photo_url: (photoURLData != null) ? photoURLData : "",
              provider_id: (providerIdData != null) ? providerIdData : ""
            };

            usersRef
              .child(user.uid)
              .set(data)
              .then(function(){
                console.log("User Information Saved:", user.uid);
              });
        /*}else {
            console.log("user_details already exists");
        }
    });*/
  }).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // The email of the user's account used.
    var email = error.email;
    // The firebase.auth.AuthCredential type that was used.
    var credential = error.credential;
    console.log("Error : "+error.message);
    // ...
  });
});



//Twitter SignIn
var twitterProvider = new firebase.auth.TwitterAuthProvider();

$("#twitterLoginBtn").on("click", function(e){
  /*// Step 1.
// User tries to sign in to Twitter.
firebase.auth().signInWithPopup(new firebase.auth.TwitterAuthProvider()).then(function(result) {
    // This gives you a the Twitter OAuth 1.0 Access Token and Secret.
    // You can use these server side with your app's credentials to access the Twitter API.
    alert(JSON.stringify(result));
  }).catch(function(error) {
  // An error happened.
  alert('how u doing!');
  if (error.code === 'auth/account-exists-with-different-credential') {
    // Step 2.
    // User's email already exists.
    // The pending Twitter credential.
    var pendingCred = error.credential;
    // The provider account's email address.
    var email = error.email;
    // Get registered providers for this email.
    firebase.auth().fetchProvidersForEmail(email).then(function(providers) {
      // Step 3.
      // If the user has several providers,
      // the first provider in the list will be the "recommended" provider to use.
      if (providers[0] === 'password') {
        // Asks the user his password.
        // In real scenario, you should handle this asynchronously.
        var password = promptUserForPassword(); // TODO: implement promptUserForPassword.
        firebase.auth().signInWithEmailAndPassword(email, password).then(function(user) {
          // Step 4a.
          return user.link(pendingCred);
        }).then(function() {
          // Twitter account successfully linked to the existing Firebase user.
          goToApp();
        });
        return;
      }
      // All the other cases are external providers.
      // Construct provider object for that provider.
      // TODO: implement getProviderForProviderId.
      var provider = getProviderForProviderId(providers[0]);
      // At this point, you should let the user know that he already has an account
      // but with a different provider, and let him validate the fact he wants to
      // sign in with this provider.
      // Sign in to provider. Note: browsers usually block popup triggered asynchronously,
      // so in real scenario you should ask the user to click on a "continue" button
      // that will trigger the signInWithPopup.
      firebase.auth().signInWithPopup(provider).then(function(result) {
        // Remember that the user may have signed in with an account that has a different email
        // address than the first one. This can happen as Firebase doesn't control the provider's
        // sign in flow and the user is free to login using whichever account he owns.
        // Step 4b.
        // Link to Twitter credential.
        // As we have access to the pending credential, we can directly call the link method.
        result.user.link(pendingCred).then(function() {
          // Twitter account successfully linked to the existing Firebase user.
          goToApp();
        });
      });
    });
  }
});*/
  firebase.auth().signInWithPopup(twitterProvider).then(function(result) {
    // This gives you a the Twitter OAuth 1.0 Access Token and Secret.
    // You can use these server side with your app's credentials to access the Twitter API.
    var token = result.credential.accessToken;
    var secret = result.credential.secret;
    // The signed-in user info.

    var user = result.user;
    /*usersRef.once('value', function(snapshot) {
      if (!snapshot.hasChild(user.uid)) {*/
          // usersRef.child(username).set({ name: username });
          //Custom variables
          var emailData="";
          var phoneNumberData="";
          var displayNameData="";
          var photoURLData="";
          var providerIdData="";

          if(user.providerData){
            user.providerData.forEach(function(item) {
              emailData=item.email;
              phoneNumberData=item.phoneNumber;
              displayNameData=item.displayName;
              photoURLData=item.photoURL;
              providerIdData=item.providerId;
            });
          }else{
            emailData=user.email;
            phoneNumberData=user.phoneNumber;
            displayNameData=user.displayName;
            photoURLData=user.photoURL;
            providerIdData=user.providerId;
          }
          var data = {
            name: (displayNameData != null) ? displayNameData : "", 
            email: (emailData != null) ? emailData : "", 
            password: "",
            phone_number: (phoneNumberData != null) ? phoneNumberData : "",
            photo_url: (photoURLData != null) ? photoURLData : "",
            provider_id: (providerIdData != null) ? providerIdData : ""
          };

          usersRef
            .child(user.uid)
            .set(data)
            .then(function(){
              console.log("User Information Saved:", user.uid);
            });
      /*}else{
        console.log("user_details already exists");
      }
    });*/
  }).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // The email of the user's account used.
    var email = error.email;
    // The firebase.auth.AuthCredential type that was used.
    var credential = error.credential;
    console.log("Error : "+error.message);
    //alert(JSON.stringify(error));
  });
});

function goToApp(){
  alert(1);
}