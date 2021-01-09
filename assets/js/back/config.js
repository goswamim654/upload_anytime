/*
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the
 * License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing permissions and
 * limitations under the License.
 */
  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyA9zJTpPQ3dxgTQ2_zKmcnHgOb8evIN9II",
    authDomain: "snaplava-71ef4.firebaseapp.com",
    databaseURL: "https://snaplava-71ef4.firebaseio.com",
    projectId: "snaplava-71ef4",
    storageBucket: "",
    messagingSenderId: "953469265978"
  };
  firebase.initializeApp(config);



/*var config = {
  apiKey: "AIzaSyCdTUnppBKchgEgEhtoJsNDwpxMkgrjp1A",
  authDomain: "fir-ems-e6d8f.firebaseapp.com",
  databaseURL: "https://fir-ems-e6d8f.firebaseio.com",
  storageBucket: "fir-ems-e6d8f.appspot.com",
};
firebase.initializeApp(config);*/

// Google OAuth Client ID, needed to support One-tap sign-up.
// Set to null if One-tap sign-up is not supported.
var CLIENT_ID = '133144004634-n42sp25b09l9etken6cu1qjqg7scomlj.apps.googleusercontent.com';
