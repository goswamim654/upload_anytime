// Initiate uploader

var uploadedImageArr=[];

document.addEventListener("DOMContentLoaded", function(event) {
	Uploader.init();
});

var Uploader = {

	// Preview dimensions
	previewWidth: 100,
	previewHeight: 80,

	init: function () {

		// Read the comment on function
		this.generateFormIds();

		// Check that file API is supported
		if (window.File && window.FileList && window.FileReader) {
			this.addEventsListeners();
		}
	},

	// Generate and assign unique id for every form
	// When user uploads images, on server side you will be able to tell that multiple uploaded files belong to the same transaction
	// So this is basically transaction ID and it makes sense to generate it in the beginning of every 'upload session' if you do not
	// reload page completely.
	generateFormIds: function () {
		var formIdentFields = document.querySelectorAll('form input[type=hidden][name=formIdent]');
		for (var i = 0; i < formIdentFields.length; i++) {
			formIdentFields[i].value = this.getRandomStr(32);
		}
	},

	// Shortcut
	getById: function(id) {
		return document.getElementById(id);
	},

	// Add events listeners
	addEventsListeners: function() {

		var dropzone = this.getById('dropzone');
		var fileselect = this.getById('fileselect');

		// Read comments on functions for details

		dropzone.addEventListener('dragover', this.onDropzoneHover.bind(this));
		dropzone.addEventListener('dragleave', this.onDropzoneLeave.bind(this));

		dropzone.addEventListener('drop', this.onFileListChange.bind(this));

		// We attach 'paste' event to window so you do not need to select a special element on the page before pasting
		// But if you want you can attach it to any element, for example textarea where user writes his post, etc.
		window.addEventListener('paste', this.onFileListChange.bind(this));

		fileselect.addEventListener('change', this.onFileListChange.bind(this));
	},

	// Enable/disable dropzone styling (used when you drag&drop file on it)
	styleDropzone: function (flag) {
		var dropzone = this.getById('dropzone');
		dropzone.className = flag ? 'hover' : '';
	},

	// When mouse with file over dropzone
	onDropzoneHover: function(e) {
		// Stop browsing from opening dropped file in browser by link
		e.preventDefault();
		this.styleDropzone(true);
	},

	// When mouse leaves dropzone
	onDropzoneLeave: function() {
		this.styleDropzone(false);
	},

	// List of added files changed
	onFileListChange: function(e) {

		e.preventDefault();
		if (e.type !== 'paste') {
			// Stop browsing from opening dropped file in browser by link
			e.preventDefault();
		}

		// if file successfully dropped - unstyle dropzone
		if (e.type === 'drop') {
			this.styleDropzone(false);
		}

		var files = [], pastedFile;

		// Getting 'selected' files
		if (e.target.files) {

			files = e.target.files;

		// Getting 'dropped' files
		} else if (e.dataTransfer && e.dataTransfer.files) {

			files = e.dataTransfer.files;

		// Getting 'pasted' files
		} else if (pastedFile = this.extractFileFromClipboard(e)) {

			pastedFile.fromClipboard = true;
			files = [pastedFile];
		}

		// Create previews for files in upload list
		for (var i = 0; i < files.length; i++) {
			this.processFile(files[i]);
		}
	},

	// Extract file from clipboard
	extractFileFromClipboard: function (event) {

		if (event.clipboardData
			&& event.clipboardData.items
			&& event.clipboardData.items.length
		) {
			var file = event.clipboardData.items[0].getAsFile();

			// Return item only if it is file (not 'text', for example)
			if (file instanceof Blob) {
				return file;
			}
		}

		return null;
	},

	// Upload file
	upload: function (file) {

		// Create data object...
		var formData = new FormData();
		//var userId = getCookie('userId');

		// ... and fill it up with file object and meta information
		formData.append('image', file);
		formData.append('uplFileName', file.name);
		//formData.append('userId', userId);
		formData.append('formIdent', document.querySelector('[name=formIdent]').value);

		var xhr = new XMLHttpRequest();

		xhr.upload.ident = file.ident;
		xhr.upload.addEventListener('progress', this.onUploadProgress.bind(this));

		xhr.onreadystatechange = this.onReadyStateChange.bind(this);

		xhr.open("POST", this.getById('upload').action);
		xhr.setRequestHeader("Authorization", "Bearer "+token);
		xhr.send(formData);
	},

	// Track progress with "progress" event
	onUploadProgress: function (e) {

		var xhru = e.currentTarget;
		var ident = xhru.ident;
		var percent = Math.round(e.loaded * 100 / e.total);

		// Calculate upload % and resize progress bar
		this.getPreviewBox(ident).querySelector('.progressBar').style.width = (percent + '%');
		this.getPreviewBox(ident).querySelector('.progressText').innerHTML = (percent + '% done');
	},

	// Called when xhr state changes
	onReadyStateChange: function (e) {

		var xhr = e.currentTarget;
		var ident = xhr.upload.ident;

		// Upload complete
		if (xhr.readyState == XMLHttpRequest.DONE) {
			// Check response code
			if (xhr.status === 200) {
				
				try {
		            responseData = JSON.parse(xhr.responseText); 
		        } catch (e) {
		            responseData = xhr.responseText;
		        }
		        console.log(responseData);
		        //alert(responseData.status);
				if(responseData.status == 1){
					alert(responseData.content.image);
					this.onUploadFailed(e, ident);
					console.log(responseData);
				}else if(responseData.status == 3){
					alert("Could not upload the image.");
				}else if(responseData.status == 2){
					this.onUploadSuccessful(e, ident);
					$("#imageUploadNextBtn").removeClass('disabled');
				}else{
					this.onUploadFailed(e, ident);
					alert("Something went wrong! please try again later.");
				}
			} else {
				this.onUploadFailed(e, ident);
			}
		}
	},

	// Called when upload of file is successful
	onUploadSuccessful: function (e, ident) {
		this.markImageAsUploaded(ident);
		if($.inArray(ident, uploadedImageArr) == -1){
			uploadedImageArr.push(ident);
		}
		$("#imageUploadNextBtn").removeClass('hidden');
		$("#imageUploadNextBtn").removeClass('disabled');
	},

	// Called if upload of file has failed
	onUploadFailed: function (e, ident) {
		this.markImageAsFailed(ident);
	},

	// Mark image as uploaded successfully
	markImageAsUploaded: function (ident) {
		this.getPreviewBox(ident).querySelector('.done').style.visibility = 'visible';
		this.getPreviewBox(ident).querySelector('.closeBtn').style.visibility = 'visible';
	},

	// Mark image as failed to upload
	markImageAsFailed: function (ident) {
		this.getPreviewBox(ident).querySelector('.fail').style.visibility = 'visible';
		this.getPreviewBox(ident).querySelector('.closeBtn').style.visibility = 'visible';
	},

	// Calculate thumbnail size by given original size and desired maximums
	calcTnSize: function(width, height, maxWidth, maxHeight) {

		if (width > height) {
			if (width > maxWidth) {
				height *= maxWidth / width;
				width = maxWidth;
			}
		} else {
			if (height > maxHeight) {
				width *= maxHeight / height;
				height = maxHeight;
			}
		}

		return {
			height: Math.round(height),
			width: Math.round(width)
		}
	},

	// Do actions on image: generate ident, load, init resize
	processFile: function(file) {

		if (!(file instanceof Blob)) {
			alert('You can upload only files');
			return;
		}

		// Check file type (something like image/png)
		// but do not forget to check file on server side
		if (file.type.indexOf('image') !== 0) {
			alert('You can upload only images');
			return;
		}

		if (file.fromClipboard) {
			file.name = 'Clipboard.png';
		}

		// Assigning file ident so we could update preview image in box when it is ready
		file.ident = 'imgIdent-' + this.getRandomStr(8);

		this.previewCreate(file.ident, file.name);

		var reader = new FileReader();
		reader.fileIdent = file.ident;
		reader.onload = this.onReaderReady.bind(this);
		reader.readAsDataURL(file);

		// Upload file right away
		this.upload(file);
	},

	// When `FileReader` reads file from users disk
	onReaderReady: function (e) {

		var reader = e.currentTarget;

		// Create new Img object
		var img = document.createElement('img');
		img.fileIdent = reader.fileIdent;

		// Result contains loaded file as DataUrl string
		img.src = e.target.result;

		// When event occurs - image is ready for read from JS and transformation
		img.onload = this.onImageReady.bind(this);
	},

	// Image resize logic
	onImageReady: function (e) {

		var img = e.currentTarget;

		// Calculate thumbnail size
		var nSize = this.calcTnSize(img.width, img.height, this.previewWidth, this.previewHeight);

		// Create canvas element
		var canvas = document.createElement('canvas');

		// Set canvas size
		canvas.width = nSize.width;
		canvas.height = nSize.height;

		// Put/resize image on canvas
		canvas.getContext("2d").drawImage(img, 0, 0, nSize.width, nSize.height);

		// Retrieve the result image as DataUrl
		var dataurl = canvas.toDataURL('image/png');

		// Update preview box with resized image
		this.previewSetImage(img.fileIdent, dataurl);
	},

	// Create an HTML preview box: Initially it will have just a message in it but when the
	// image is loaded, resized and ready - the preview box will be updated with actual image
	previewCreate: function(ident, title) {

		var previewsHolder = this.getById('previews');
		previewsHolder.style.display = 'block';

		var ds = previewsHolder.querySelector('.clearDiv');
		if (ds) {
			previewsHolder.removeChild(ds);
		}

		var closeBtnVariable="'"+ident+"'";
		var html = '';
		html += '<div class="previewBox" id="imgHolder-'+ident+'">';
		html += '	<div class="imageDesc">';
		html += '		<div class="title">';
		html += '			' + title;
		html += '			<span onclick="closePreview('+closeBtnVariable+')" class="closeBtn"><i class="fas fa-times"></i></span>';
		html += '		</div>';
		html += '		<div class="progress">';
		html += '			<div class="progressBar"></div>';
		html += '		</div>';
		html += '		<div class="progressTextContainer">';
		html += '			<span class="progressText">';
		html += '			</span>';
		html += '			<strong class="done">Completed</strong>';
		html += '			<strong class="fail">Failed</strong>';
		html += '		</div>';
		html += '	</div>';
		html += '	<div class="imgHolder">';
		html += '		<br><br><br>';
		html += '		<span class="spinner">&#128347;</span>';
		html += '		Loading...';
		html += '	</div>';
		html += '</div>';

		html += '<div class="clearDiv"></div>';

		previewsHolder.innerHTML = previewsHolder.innerHTML + html;
	},

	// Update preview box with actual preview image
	previewSetImage: function(ident, dataUrl) {
		this.getPreviewBox(ident).querySelector('.imgHolder').innerHTML = '<img src="'+dataUrl+'" />';
	},

	getPreviewBox: function (ident) {
		return this.getById('imgHolder-'+ident);
	},

	// Generate random string token
	getRandomStr: function(length) {

		if (!length) {
			length = 8;
		}

		var rndStr = '';
		var chars = "abcdefghijklmnopqrstuvwxyz0123456789";

		for(var i=0; i < length; i++ ) {
			rndStr += chars.charAt(Math.floor(Math.random() * chars.length));
		}

		return rndStr;
	}

};