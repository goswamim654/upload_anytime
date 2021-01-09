firebase.auth().onAuthStateChanged(function(user) {
	if(user){
		window.location.href="https://www.snaplava.com/home.html";
	}
});