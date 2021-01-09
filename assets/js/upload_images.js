$("#imageUploadNextBtn").on("click", function(e){
	window.location.href=BASE_URL+"photo-details";
});
//Close Preview Image
function closePreview(id){
	//alert("How u doing");
	$('#imgHolder-'+id).remove();
	uploadedImageArr.splice( $.inArray(id, uploadedImageArr), 1 );
	if (typeof uploadedImageArr == 'undefined' || uploadedImageArr.length < 1) {
		// the array is defined and has at least one element
		$("#imageUploadNextBtn").addClass('hidden');
		$("#imageUploadNextBtn").addClass('disabled');
	}
	console.log("Close :"+uploadedImageArr);
}