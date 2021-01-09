/*$(function() {*/
    var token=getCookie('admin-token');
    if(token==null){
    	window.location.href=BASE_URL+"secure/login.html";
    }

    /* Get logged in user details satrt */
    var request = $.ajax({
      url: BASE_URL+"live/public/api/v1/admin/details",
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
      var userData = null;
      try {
          userDate = JSON.parse(response); 
      } catch (e) {
          userData = response;
      }
      //console.log(userData);
      if(userData.status==2){
        console.log(userData);
        var userPhoto="";
        if(typeof(userData.content.user_profile_photo) != "undefined" && userData.content.user_profile_photo !== null) {
          userPhoto=userData.content.user_profile_photo;
        }
        
        $("#sideBarName").html(userData.content.name);
        $("#headerAdminName").html(userData.content.name);
        $("#headerLastLoginTime").html($.dateWithHoursMinutes(userData.content.last_login_at));
        $("#sideBarPhoto").attr("src", userPhoto);
      }else{
        console.log("Something went wrong : "+userData);
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
    /* Get logged in user details satrt */
    
//});

//Signout user
$("#head-sign-out").on('click', function(e){
  e.preventDefault();
  deleteCookie('admin-token');
  window.location.href=BASE_URL+"secure/login.html";
});