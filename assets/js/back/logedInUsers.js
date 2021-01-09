//Handel Auth state changes
firebase.auth().onAuthStateChanged(function(user) {
	if(!user){
		window.location.href="https://www.snaplava.com";
	}else{
		var query = firebase.database().ref("user_details/"+user.uid);
      	//Fire Query
      	query.once("value").then(fillData);
      	//alert (JSON.stringify(user)); 

		/*$('#head-name').html(user.name);
	  if (data.photo_url){
	    $("#head-photo").attr("src",data.photo_url);
	    $('#head-photo').show();
	  }else{
	    $('#head-photo').hide();
	  }*/
	}
});

// Fill Login user details Data
function fillData(snap) {
  var data = snap.val();
  //console.log(data)
  //alert(data.name);
  $('#sideBarName').html(data.name);
  if (data.photo_url){
    $("#sideBarPhoto").attr("src",data.photo_url);
    $('#sideBarPhoto').show();
  }else{
    $('#sideBarPhoto').hide();
  }
}