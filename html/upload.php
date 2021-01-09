<?php

$con = mysqli_connect("localhost","alegra6_hemanta","hmtALS^77");
// Check connection
if (!$con) {
  	echo "Failed to connect to MySQL: " . mysqli_connect_error();
}else{
	mysqli_select_db($con,"alegra6_hemanta");
}

// Dir of your choice
$dir = __DIR__.'/files/';

//Keep in mind that file extension may be different, check uploaded file
$safeName = microtime(true).'.jpg';

// Uncomment to see all the passed variables
//print_r($_POST);

// Uncomment to move your uploaded file to any writable dir
move_uploaded_file($_FILES['uplFile']['tmp_name'], $dir.$safeName);
$user_id=$_POST['currentUserId'];
$image=mysqli_real_escape_string($con, $safeName);
$tempImgSql="INSERT INTO temp_images (user_id, image) VALUES ('".$user_id."', '".$image."')";
mysqli_query($con, $tempImgSql);
$insertedId=mysqli_insert_id($con);

//echo $safeName." how u doing!";