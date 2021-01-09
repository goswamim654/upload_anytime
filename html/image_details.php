<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<title>Snaplava</title>
	<link href="../assets/bootstrap-3.3.7/css/bootstrap.min.css" rel="stylesheet">
    <link href="../assets/fontawesome/web-fonts-with-css/css/fontawesome-all.css" rel="stylesheet">
    <link href="../assets/fonts/Lato/latofonts.css" rel="stylesheet">
    <link href="../assets/fonts/LatoLatin/latolatinfonts.css" rel="stylesheet">
    <!-- Scrollbar Custom CSS -->
    <link href="../assets/css/jquery.mCustomScrollbar.min.css" rel="stylesheet">
    <link href="../assets/select2/css/select2.min.css" rel="stylesheet" type="text/css" media="screen" />
    <link href="../assets/css/sidebar.css" rel="stylesheet" type="text/css" media="screen" />
	<link href="../assets/css/upload.css" rel="stylesheet" type="text/css" media="screen" />
	<link href="../assets/css/style.css" rel="stylesheet" type="text/css" media="screen" />
	<!-- jQuery library -->
    <script src="../assets/js/jquery-v3.2.1.min.js"></script>
</head>
<?php
	$con = mysqli_connect("localhost","alegra6_hemanta","hmtALS^77");
	// Check connection
	if (!$con) {
	  	echo "Failed to connect to MySQL: " . mysqli_connect_error();
	}else{
		mysqli_select_db($con,"alegra6_hemanta");
	}
?>
<body class="colorBg">
	<div class="wrapper">

		<!-- Sidebar Satrt -->
		<nav id="sidebar">
            <div id="dismiss">
                <i class="glyphicon glyphicon-arrow-left"></i>
            </div>

            <div class="sidebar-header">
                <img src="../images/logo-blue.png" alt="Logo">
            </div>

            <ul class="list-unstyled components">
            	<div class="userInfo">
            		<span id="sideBarName"></span>
				    <span class="userImage">
				        <img class="img-circle" id="sideBarPhoto">
				    </span>
				</div>
                <!-- <p id="sideBarName">User Name</p>
                <p><img class="img-circle"  id="sideBarPhoto"></span></p> -->
                <li class="active">
                	<a id="user-home" href="home.html">Home</a>
                </li>
                <li class="visible-xs">
                    <a href="#homeSubmenu" data-toggle="collapse" aria-expanded="false">Categories</a>
                    <ul class="collapse list-unstyled" id="homeSubmenu">
                        <li><a href="#">Abstract</a></li>
                        <li><a href="#">Aerial</a></li>
                        <li><a href="#">Animal</a></li>
						<li><a href="#">Architecture</a></li>
						<li><a href="#">Avian</a></li>
						<li><a href="#">Black and White</a></li>
						<li><a href="#">Cityscape</a></li>
						<li><a href="#">Current Events</a></li>
						<li><a href="#">Decisive Moment</a></li>
						<li><a href="#">Defocused</a></li>
						<li><a href="#">Documentary</a></li>
						<li><a href="#">Emotive</a></li>
						<li><a href="#">Expression</a></li>
						<li><a href="#">Family</a></li>
						<li><a href="#">Fashion</a></li>
						<li><a href="#">Film</a></li>
						<li><a href="#">Fine Art</a></li>
						<li><a href="#">Food</a></li>
						<li><a href="#">Glamour</a></li>
						<li><a href="#">HDRI (High Dynamic Range Imaging)</a></li>
						<li><a href="#">Humorous</a></li>
						<li><a href="#">ICM (intentional camera movement)</a></li>
						<li><a href="#">Industrial</a></li>
						<li><a href="#">Infrared</a></li>
						<li class="text-center">...</li>
                    </ul>
                </li>
                <li>
                    <a id="head-sign-out" href="javascript:void(0)">Signout</a>
                </li>
            </ul>

            <!-- <ul class="list-unstyled CTAs">
                <li><a href="https://bootstrapious.com/tutorial/files/sidebar.zip" class="download">Download source</a></li>
                <li><a href="https://bootstrapious.com/p/bootstrap-sidebar" class="article">Back to article</a></li>
            </ul> -->
        </nav>
		<!-- Sidebar End -->


		<!-- Header Start -->
		<div id="header_div" class="header">
			<nav class="navbar navbar-inverse navbar-fixed-top">
			    <div class="container">
				    <div class="row">
				    	<div class="col-xs-12">
				    		<div class="menuContainer clearfix">
					    		<div class="navbar-header">
						          	<a class="navbar-brand-image" href="home.html"><img src="../images/logo-blue.png" alt="Logo"></a>
						        </div>
						        <ul id="menu-cnr" class="nav navbar-nav pull-right">
						          	<li>
						          		<div class="input-group">
		                                    <input name="q" id="q" value="" class="form-control search-form-control" type="text" placeholder="Search">
		                                    <span class="input-group-btn input-group-select-box">
		                                    	<a data-toggle="dropdown" href="#" class="btn btn-default category-btn dropdown-toggle">
		                                    		<span class="divider">|</span>
		                                           	Categories <i class="fas fa-caret-down"></i>
		                                       </a>
		                                       <ul class="dropdown-menu mega-dropdown-menu search-menu" style="display: none;">
													<li class="col-sm-3">
								    					<ul>
															<li><a href="#">Abstract</a></li>
								                            <li><a href="#">Aerial</a></li>
								                            <li><a href="#">Animal</a></li>
															<li><a href="#">Architecture</a></li>
															<li><a href="#">Avian</a></li>
															<li><a href="#">Black and White</a></li>
															<li><a href="#">Cityscape</a></li>
															<li><a href="#">Current Events</a></li>
															<li><a href="#">Decisive Moment</a></li>
															<li><a href="#">Defocused</a></li>
															<li><a href="#">Documentary</a></li>
															<li><a href="#">Emotive</a></li>
															<li><a href="#">Expression</a></li>
															<li><a href="#">Family</a></li>
															<li><a href="#">Fashion</a></li>
														</ul>
													</li>
													<li class="col-sm-3">
								    					<ul>
															<li><a href="#">Film</a></li>
															<li><a href="#">Fine Art</a></li>
															<li><a href="#">Food</a></li>
															<li><a href="#">Glamour</a></li>
															<li><a href="#">HDRI (High Dynamic Range Imaging)</a></li>
															<li><a href="#">Humorous</a></li>
															<li><a href="#">ICM (intentional camera movement)</a></li>
															<li><a href="#">Industrial</a></li>
															<li><a href="#">Infrared</a></li>
															<li><a href="#">Interior</a></li>
															<li><a href="#">Journalism</a></li>
															<li><a href="#">Landscape</a></li>
															<li><a href="#">Lomo</a></li>
															<li><a href="#">Macro</a></li>
															<li><a href="#">Nature</a></li>
														</ul>
													</li>
													<li class="col-sm-3">
								    					<ul>
															<li><a href="#">Nude</a></li>
															<li><a href="#">Performance</a></li>
															<li><a href="#">Pinhole</a></li>
															<li><a href="#">Portrait</a></li>
															<li><a href="#">Product</a></li>
															<li><a href="#">Publicity</a></li>
															<li><a href="#">Random</a></li>
															<li><a href="#">Recycled Art</a></li>
															<li><a href="#">Rough Camera</a></li>
															<li><a href="#">Rural</a></li>
															<li><a href="#">Sea and Sand</a></li>
															<li><a href="#">Sky</a></li>
															<li><a href="#">Snapshot</a></li>
															<li><a href="#">Sports</a></li>
															<li><a href="#">Still Life</a></li>
														</ul>
													</li>
													<li class="col-sm-3">
								    					<ul>
															<li><a href="#">Suburban</a></li>
															<li><a href="#">Swimsuit</a></li>
															<li><a href="#">Tourist</a></li>
															<li><a href="#">Travel</a></li>
															<li><a href="#">Underwater</a></li>
															<li><a href="#">Urban</a></li>
															<li><a href="#">Vehicle</a></li>
															<li><a href="#">Vintage</a></li>
															<li><a href="#">Weather</a></li>
															<li><a href="#">Wedding</a></li>
															<li><a href="#">Stock</a></li>
															<li><a href="#">Street Photography</a></li>
															<li><a href="#">Panoramas/Mosaics</a></li>
														</ul>
													</li>
												</ul>
		                                    </span>
		                                    <span class="input-group-btn">
		                                       <button class="btn btn-default search-btn" type="submit" id="serach" name="serach">
		                                           <i class="fal fa-search"></i>
		                                       </button>
		                                    </span>
		                                </div>
						          	</li>
								    <li class="dropdown  mega-dropdown hidden-xs"><a id="" class="dropdown-toggle" data-toggle="dropdown" href="#"><i class="fal fa-th"></i></a>
								        <ul class="dropdown-menu mega-dropdown-menu" style="display: none;">
											<li class="col-sm-3">
						    					<ul>
													<li class="dropdown-header">Categories</li>
													<li><a href="#">Abstract</a></li>
						                            <li><a href="#">Aerial</a></li>
						                            <li><a href="#">Animal</a></li>
													<li><a href="#">Architecture</a></li>
													<li><a href="#">Avian</a></li>
													<li><a href="#">Black and White</a></li>
													<li><a href="#">Cityscape</a></li>
													<li><a href="#">Current Events</a></li>
													<li><a href="#">Decisive Moment</a></li>
													<li><a href="#">Defocused</a></li>
													<li><a href="#">Documentary</a></li>
													<li><a href="#">Emotive</a></li>
													<li class="divider"></li>
													<li><a href="#">Expression</a></li>
													<li><a href="#">Family</a></li>
													<li><a href="#">Fashion</a></li>
												</ul>
											</li>
											<li class="col-sm-3">
						    					<ul>
													<li><a href="#">Film</a></li>
													<li><a href="#">Fine Art</a></li>
													<li><a href="#">Food</a></li>
													<li><a href="#">Glamour</a></li>
													<li><a href="#">HDRI (High Dynamic Range Imaging)</a></li>
													<li><a href="#">Humorous</a></li>
													<li><a href="#">ICM (intentional camera movement)</a></li>
													<li><a href="#">Industrial</a></li>
													<li><a href="#">Infrared</a></li>
													<li class="divider"></li>
													<li><a href="#">Interior</a></li>
													<li><a href="#">Journalism</a></li>
													<li><a href="#">Landscape</a></li>
													<li><a href="#">Lomo</a></li>
													<li><a href="#">Macro</a></li>
													<li><a href="#">Nature</a></li>
												</ul>
											</li>
											<li class="col-sm-3">
						    					<ul>
													<li><a href="#">Nude</a></li>
													<li><a href="#">Panoramas/Mosaics</a></li>
													<li><a href="#">Performance</a></li>
													<li><a href="#">Pinhole</a></li>
													<li><a href="#">Portrait</a></li>
													<li><a href="#">Product</a></li>
													<li class="divider"></li>
													<li><a href="#">Publicity</a></li>
													<li><a href="#">Random</a></li>
													<li><a href="#">Recycled Art</a></li>
													<li><a href="#">Rough Camera</a></li>
													<li><a href="#">Rural</a></li>
													<li><a href="#">Sea and Sand</a></li>
													<li><a href="#">Sky</a></li>
													<li><a href="#">Snapshot</a></li>
													<li><a href="#">Sports</a></li>
													<li><a href="#">Still Life</a></li>
													<li><a href="#">Stock</a></li>
													<li><a href="#">Street Photography</a></li>
													<li class="divider"></li>
												</ul>
											</li>
											<li class="col-sm-3">
						    					<ul>
													<li><a href="#">Suburban</a></li>
													<li><a href="#">Swimsuit</a></li>
													<li><a href="#">Tourist</a></li>
													<li><a href="#">Travel</a></li>
													<li><a href="#">Underwater</a></li>
													<li><a href="#">Urban</a></li>
													<li><a href="#">Vehicle</a></li>
													<li><a href="#">Vintage</a></li>
													<li><a href="#">Weather</a></li>
													<li><a href="#">Wedding</a></li>
													<!-- <li class="divider"></li>
													<li class="dropdown-header">Fonts</li>
						                            <li><a href="#">Glyphicon</a></li>
													<li><a href="#">Google Fonts</a></li> -->
												</ul>
											</li>
										</ul>
								    </li>

						          	<li><a id="sidebarCollapse" href="javascript:void(0)"><i class="fal fa-bars"></i></a></li>
						        </ul>
					        </div> 
				    	</div>
				    </div>
				</div> 
			</nav>
			<div class="banner">
			    <div class="container">
			        
			    </div>
			</div>
		</div>
		<!-- Header End -->
		<!-- Content Satrt -->
		<div class="content">
            <div id="bodySections" class="sections">
                <div class="container">
                	<div class="row">
                		<div class="col-xs-12">
                			<div class="uploadPageTitle">
                				<h2>Photo(s) details</h2>
                			</div>
                		</div>
                	</div>
                	<div class="row">
                		<div class="col-xs-12">
                			<form id="ImageDetalis" name="imageDetails" action="" method="POST">
	                			<?php
		    						$sql = "SELECT * FROM temp_images order by id desc";
		    						$result=mysqli_query($con, $sql);
		    						while($row = mysqli_fetch_array($result))
									{
								?>
	                			<div class="imageDetailsRow">
	                				<div class="imageDiv">
										<img src="files/<?=$row['image']?>">
									</div>
									<div class="detailsCnr">
										<div class="form-group">
	                                      	<input type="text" class="form-control" placeholder="Title" id="imageTitle" name="imageTitle">
	                                    </div>
	                                    <div class="form-group">
	                                    	<select class="form-control" id="imageCategory<?=$row['id'];?>" name="imageCategory[]" multiple="multiple">
											  	<option vlaue="Abstract">Abstract</option>
						                        <option vlaue="Aerial">Aerial</option>
						                        <option vlaue="Animal">Animal</option>
												<option vlaue="Architecture">Architecture</option>
												<option vlaue="Avian">Avian</option>
												<option vlaue="Black and White">Black and White</option>
												<option vlaue="Cityscape">Cityscape</option>
												<option vlaue="Current Events">Current Events</option>
												<option vlaue="Decisive Moment">Decisive Moment</option>
												<option vlaue="Defocused">Defocused</option>
												<option vlaue="Documentary">Documentary</option>
												<option vlaue="Emotive">Emotive</option>
												<option vlaue="Expression">Expression</option>
												<option vlaue="Family">Family</option>
												<option vlaue="Fashion">Fashion</option>
												<option vlaue="Film">Film</option>
												<option vlaue="Fine Art">Fine Art</option>
												<option vlaue="Food">Food</option>
												<option vlaue="Glamour">Glamour</option>
												<option vlaue="HDRI">HDRI (High Dynamic Range Imaging)</option>
												<option vlaue="Humorous">Humorous</option>
												<option vlaue="ICM">ICM (intentional camera movement)</option>
												<option vlaue="Industrial">Industrial</option>
												<option vlaue="Infrared">Infrared</option>
											</select>
	                                    	<div id="selectedCategory">
	                                    		
	                                    	</div>
	                                    	
	                                    </div>
	                                    <div class="form-group">
	                                    	<textarea class="form-control" name="imageDescription" id="imageDescription" placeholder="Description"></textarea>
	                                    </div>
									</div>
	                			</div>
	                			<div class="clearfix"></div>
	                			<script type="text/javascript">
							        $(document).ready(function () {
							        	//Select2 
							        	$("#imageCategory<?=$row['id'];?>").select2({ 
							        		placeholder: "Select Categories",
							        		maximumSelectionLength: 3
							        	});
							        });
							    </script>
	                			<?php 
	                				} 
	                			?>
	                			<div class="imageDetailsSubmitBtn">
									<a class="btn btn-lg btn-default" href="javascript:void(0)">Skip</a>&nbsp;
									<a class="btn btn-lg btn-primary" href="https://www.snaplava.com/image_upload_final.html">Continue <i class="fas fa-angle-right"></i></a>
								</div>
                			</form>
                		</div>
                	</div>
                </div>
            </div>
        </div>
		<!-- Content End -->
		<!-- Footer Satrt -->
		<footer> 
        </footer>
		<!-- Footer End -->
	</div>
	<div class="overlay"></div>
	<!-- Js libraries start -->

	
    <!-- Latest compiled JavaScript -->
    <script src="../assets/bootstrap-3.3.7/js/bootstrap.min.js"></script>
    <!-- jQuery Custom Scroller CDN -->
    <script src="../assets/js/jquery.mCustomScrollbar.concat.min.js"></script>
    <script src="../assets/select2/js/select2.full.min.js"></script>
    <script src="https://www.gstatic.com/firebasejs/4.9.1/firebase.js"></script>
    <script src="../assets/js/config.js"></script>
	<script src="../assets/js/custom.js"></script>
	<script src="../assets/js/logedInUsers.js"></script>
	<script type="text/javascript">
        $(document).ready(function () {
            $("#sidebar").mCustomScrollbar({
                theme: "minimal"
            });

            $('#dismiss, .overlay').on('click', function () {
                $('#sidebar').removeClass('active');
                $('.overlay').fadeOut();
            });

            $('#sidebarCollapse').on('click', function () {
                $('#sidebar').addClass('active');
                $('.overlay').fadeIn();
                $('.collapse.in').toggleClass('in');
                $('a[aria-expanded=true]').attr('aria-expanded', 'false');
            });
        });
    </script>
	<!-- Js libraries end -->
</body>
</html>