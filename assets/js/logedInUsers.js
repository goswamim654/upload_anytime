/*$(function() {*/
    var token=getCookie('token');
    if(token==null){
    	window.location.href=BASE_URL;
    }
    
    /**
    * Global category array
    **/
    var photoCategories=[];

    /**
    * Global photographer_types array
    **/
    var photographerTypesArr=[];

    /* Loading photographer_types array strat */
    var request = $.ajax({
      url: BASE_URL+"live/public/api/v1/types-of-photographers",
      headers: {
        "Authorization" : "Bearer "+token
      },
      type: "GET",
      beforeSend:function(){
        //showLoader();
        //$('#signinErrorMsg').html('');
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
      if(responseData.status==2){
        photographerTypesArr=responseData.content;
      }else{
        console.log("Photographers types not loaded, Error: "+userData);
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
    /* Loading photographer_types array end */


    /**
    * Global photographer_types array
    **/
    var photographerSkillsArr=[];

    /* Loading photographer_types array strat */
    var request = $.ajax({
      url: BASE_URL+"live/public/api/v1/photographer-skills",
      headers: {
        "Authorization" : "Bearer "+token
      },
      type: "GET",
      beforeSend:function(){
        //showLoader();
        //$('#signinErrorMsg').html('');
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
      if(responseData.status==2){
        photographerSkillsArr=responseData.content;
      }else{
        console.log("Photographers Skills not loaded, Error: "+userData);
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
    /* Loading photographer_types array end */


    /**
    * Geting search parameters START
    **/
    var searchQuery = getUrlParameter('search-query');
    var searchType = getUrlParameter('search-type');
    var searchCategories = getUrlParameter('search-categories');
    if(typeof searchQuery == "undefined" || searchQuery==""){
      searchQuery="";
    }
    if(typeof searchType == "undefined" || searchType==""){
      searchType="";
    }
    if(typeof searchCategories == "undefined" || searchCategories==""){
      searchCategories="";
    }
    searchQuery = searchQuery.replace(/\+/g, " ");
    searchCategories = searchCategories.replace(/\+/g, " ");
    var searchCategoriesArr = searchCategories.split(",");
    console.log(searchCategories);
    $("#search-query").val(searchQuery);

    if(searchType=="users"){
      $('#searchModeCategories').removeClass('active');
      $('#searchModeUsers').addClass('active');
      $("#searchModeSelecterContainer").addClass('userSelected');
      $("#serachModeSelected").html('<span class="divider">|</span>Users <i class="fas fa-caret-down"></i>');
      $('#categoriesMenuContainer').addClass('hidden');
      $('#search-type').val('users');
    }

    /*console.log("Length : "+searchCategoriesArr.length+"val :"+searchCategoriesArr[0]);*/
    //alert(searchQuery+"/"+searchType+"/"+searchCategories);
    /**
    * Geting search parameters END
    **/


    /* Get logged in user details satrt */
    var request = $.ajax({
      url: BASE_URL+"live/public/api/v1/users/details",
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
        /*if(typeof(userData.content.user_primary_profile_photo) != "undefined" && userData.content.user_primary_profile_photo !== null) {
          userPhoto=userData.content.user_primary_profile_photo;
        }else{
          userPhoto=userData.content.user_secondary_profile_photo;
        }*/
        if(typeof(userData.content.user_profile_photo) != "undefined" && userData.content.user_profile_photo !== null) {
          userPhoto=userData.content.user_profile_photo;
        }
        
        $("#sideBarName").html(userData.content.name);
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


    /* Get categories Loaded start */
    var searchBoxCategories="";
    var topMenuCategories="";
    //var leftMenuCategories="";

    var request = $.ajax({
      url: BASE_URL+"live/public/api/v1/categories",
      type: "GET"
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
            //console.log(responseData.content);
            categorySelectOptions=responseData.content;
            var categoryCounter=1;
            var checkClosing=1;
            var isFirst=1;
            photoCategories=categorySelectOptions;
            $.each( categorySelectOptions, function( key, value ) {
              //photoCategories[key]=value;
              if(categoryCounter == 1){
                searchBoxCategories+='<li class="col-sm-3">';
                searchBoxCategories+='  <ul>';
                
                topMenuCategories+='<li class="col-sm-3">';
                topMenuCategories+='  <ul>';
                if(isFirst==1){
                  topMenuCategories+='  <li class="dropdown-header">Categories</li>';
                  
                  searchBoxCategories+='<li>';
                  searchBoxCategories+='  <div class="checkbox">';
                  if(searchCategoriesArr.length > 0 && searchCategoriesArr[0] != "" && searchCategoriesArr[0] != "all" && searchType != "users"){
                  searchBoxCategories+='    <label class="active">';
                  searchBoxCategories+='        <input id="checkAllCheckBox" onclick="checkAll(this)" type="checkbox" checked>';
                  searchBoxCategories+='        <span class="cr"><i class="cr-icon fa fa-check"></i></span>All categories';
                  searchBoxCategories+='    </label>';
                  }else{
                  searchBoxCategories+='    <label>';
                  searchBoxCategories+='        <input id="checkAllCheckBox" onclick="checkAll(this)" type="checkbox">';
                  searchBoxCategories+='        <span class="cr"><i class="cr-icon fa fa-check"></i></span>All categories';
                  searchBoxCategories+='    </label>';
                  }
                  searchBoxCategories+='  </div>';
                  searchBoxCategories+='</li>';
                  isFirst=0;
                }
                
                checkClosing=0;
              }

              searchBoxCategories+='<li>';
              searchBoxCategories+='  <div class="checkbox">';
              if($.inArray(key, searchCategoriesArr) !== -1) {
              searchBoxCategories+='    <label class="active">';
              searchBoxCategories+='        <input onclick="checkCategory(this)" class="category-check" type="checkbox" value="'+key+'" checked>';
              searchBoxCategories+='        <span class="cr"><i class="cr-icon fa fa-check"></i></span>'+value;
              searchBoxCategories+='    </label>';
              }else{
              searchBoxCategories+='    <label>';
              searchBoxCategories+='        <input onclick="checkCategory(this)" class="category-check" type="checkbox" value="'+key+'">';
              searchBoxCategories+='        <span class="cr"><i class="cr-icon fa fa-check"></i></span>'+value;
              searchBoxCategories+='    </label>';
              }
              searchBoxCategories+='  </div>';
              searchBoxCategories+='</li>';

              topMenuCategories+='<li><a href="#">'+value+'</a></li>';
              //leftMenuCategories+='<li><a href="#">'+value+'</a></li>';

              if(categoryCounter == 15){
                searchBoxCategories+='  </ul>';
                searchBoxCategories+='</li>'; 

                topMenuCategories+='  </ul>';
                topMenuCategories+='</li>'; 
                
                checkClosing=1;
                categoryCounter=1;
              }else{
                categoryCounter++;
              }
            });
            if(checkClosing!=1){
              searchBoxCategories+='  </ul>';
              searchBoxCategories+='</li>'; 

              topMenuCategories+='  </ul>';
              topMenuCategories+='</li>';
            }
            $("#topMenuCategoryContainer").html(topMenuCategories);
            $("#searchBoxCategoryContainer").html(searchBoxCategories);
            //$("#homeSubmenu").html(leftMenuCategories);
            if(searchCategoriesArr.length == 1 && (searchCategoriesArr[0] == "" || searchCategoriesArr[0] == "all") && searchType!="users"){
              $("#checkAllCheckBox").click();
              $('#searchModeUsers').removeClass('active');
              $('#searchModeCategories').addClass('active');
            }
            
            console.log(photoCategories);
            break;
          case 3: 
            console.log(responseData.message);
            break;
          case 4: 
            console.log(responseData.message);
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
    /* Get categories Loaded end */
    
/*});*/

/**
* Removing Share tooltip on click START
**/
function shareTooltipToggle(el){
  if($(el).parents('.open').length){
    $(el).attr("data-original-title", "Share");
    //$(el).parent().children('.tooltip').show();

  }else{
    /*if(!$('.share-toggle').parents('.open').length){*/
      $('.share-toggle').attr("data-original-title", "Share");
      //$('.share-toggle').parent().children('.tooltip').show();
    /*}*/
    if($(el).parent().children('.tooltip').length > 0){
      $(el).parent().children('.tooltip').hide();
    }
    $(el).attr("data-original-title", "");
  }
}
/*$('.share-toggle').on("click", function(){
  alert(1);

  
});*/
/**
* Removing Share tooltip on click END
**/


/**
* Prevent from closing the mega menu on clicking within it's area START
**/
$('#searchBoxCategoryContainer').on('click', function(e){
  e.stopPropagation();
});

/**
* Top mega menu on check Satrt
**/
function checkAll(el){
  var categoriesValue="";
  if($(el).prop("checked")){
    $(".category-check").prop('checked', true);
    $(".category-check").parent().addClass('active');
    $(el).parent().addClass('active');
    /*$('.category-check').each(function () {
        categoriesValue+=$(this).val()+',';
    });
    categoriesValue = categoriesValue.replace(/,\s*$/, "");*/
    $('#search-categories').val('all');
  }else{
    $(".category-check").prop('checked', false);
    $(".category-check").parent().removeClass('active');
    $(el).parent().removeClass('active');
    categoriesValue="";
    $('#search-categories').val(categoriesValue);
  }
}
function checkCategory(el){
  var categoriesValue="";
  if($(el).prop("checked")){
    $(el).parent().addClass('active');
    $("#checkAllCheckBox").prop('checked', true);
    $("#checkAllCheckBox").parent().addClass('active');
    $('.category-check').each(function () {
        if($(this).prop("checked")){
          categoriesValue+=$(this).val()+',';
        }
    });
    categoriesValue = categoriesValue.replace(/,\s*$/, "");
    $('#search-categories').val(categoriesValue);
  }else{
    $(el).parent().removeClass('active');
    var isAnyChecked=0;
    $('.category-check').each(function () {
        if($(this).prop("checked")){
          isAnyChecked=1;
          categoriesValue+=$(this).val()+',';
        }
    });
    categoriesValue = categoriesValue.replace(/,\s*$/, "");
    $('#search-categories').val(categoriesValue);
    if (isAnyChecked == 0)
    {
        $("#checkAllCheckBox").prop('checked', false);
        $("#checkAllCheckBox").parent().removeClass('active');
    }
  }
}
/**
* Top mega menu on check END
**/

/**
* Serach mode Selection script start
**/
$('#searchModeUsers').on('click', function(e){
  $('#searchModeCategories').removeClass('active');
  $(this).addClass('active');
  $("#searchModeSelecterContainer").addClass('userSelected');
  $("#serachModeSelected").html('<span class="divider">|</span>Users <i class="fas fa-caret-down"></i>');
  $('#categoriesMenuContainer').addClass('hidden');
  $('#search-type').val('users');
});

$('#searchModeCategories').on('click', function(e){
  if(!$("#checkAllCheckBox").prop("checked")){
    $("#checkAllCheckBox").click();
  }
  $('#searchModeUsers').removeClass('active');
  $(this).addClass('active');
  $("#searchModeSelecterContainer").removeClass('userSelected');
  $("#serachModeSelected").html('<span class="divider">|</span>Categories <i class="fas fa-caret-down"></i>');
  $('#categoriesMenuContainer').removeClass('hidden');
  $('#categoriesMenuBtn').click();
  $('#search-type').val('categories');
});
/**
* Serach mode Selection script end
**/

/**
* search submit Start
**/

/**
* search submit end
**/




$.ajaxSetup({
    beforeSend: function (xhr)
    {
       // xhr.setRequestHeader("Accept","application/vvv.website+json;version=1");
       xhr.setRequestHeader("Authorization","Bearer "+token);        
    }
});

//Signout user
$("#head-sign-out").on('click', function(e){
  e.preventDefault();
  deleteCookie('token');
  deleteCookie('userId');
  deleteCookie('userName');
  deleteCookie('userPhoto');
  window.location.href=BASE_URL;
  //fb_logout();
  // fb_logout().done(function() {
  // 	window.location.href=BASE_URL;
  // });
  // $.when(fb_logout()).then(function2()) ;
  //window.location.href=BASE_URL;
});

// function function2(){
// 	window.location.href=BASE_URL;
// }



