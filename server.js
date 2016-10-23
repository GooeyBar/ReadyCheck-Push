var firebase = require('firebase');
var request = require('request');
var http = require('http');
//require('dotenv').config();
var API_KEY = process.env.API_KEY; // Your Firebase Cloud Server API key
var PORT = process.env.PORT || 5000

firebase.initializeApp({
  serviceAccount: {
    "type": "service_account",
    "project_id": "readycheck-24872",
    "private_key_id": process.env.PRIVATE_KEY_ID,
    "private_key": process.env.PRIVATE_KEY,
    "client_email": "gooeybar@readycheck-24872.iam.gserviceaccount.com",
    "client_id": "117959324550917030473",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://accounts.google.com/o/oauth2/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/gooeybar%40readycheck-24872.iam.gserviceaccount.com"
  },
  databaseURL: "https://readycheck-24872.firebaseio.com/"
});
ref = firebase.database().ref();

function listenForNotificationRequests() {
  console.log("listening to not req");  
  var requests = ref.child('notificationRequests');
  console.log("requests obj created");
  console.log(ref);
  console.log("\n");
  console.log(requests);
  requests.on('child_added', function(requestSnapshot) {
    var request = requestSnapshot.val();
    console.log("listener registered to child added event");
    sendNotificationToUser(
      request.username, 
      request.message,
      function() {
        requestSnapshot.ref.remove();
      }
    );
  }, function(error) {
    console.error(error);
    console.log("error!");
    console.log(error);
  });
};

function sendNotificationToUser(username, message, onSuccess) {
  console.log("sending notification " + message + " to group " + username);
  request({
    url: 'https://fcm.googleapis.com/fcm/send',
    method: 'POST',
    headers: {
      'Content-Type' :' application/json',
      'Authorization': 'key='+API_KEY
    },
    body: JSON.stringify({
      notification: {
        title: message
      },
      to : '/topics/'+username
    })
  }, function(error, response, body) {
    if (error) { console.error(error); }
    else if (response.statusCode >= 400) { 
      console.error('HTTP Error: '+response.statusCode+' - '+response.statusMessage); 
    }
    else {
      onSuccess();
    }
  });
}

function handleRequest(request, response){
    response.end('Path Hit: ' + request.url);
}

//Create a server
var server = http.createServer(handleRequest);

//Lets start our server
server.listen(PORT, function(){
    //Callback triggered when server is successfully listening. Hurray!
    console.log("Server listening on: http://localhost:%s", PORT);
    console.log("API KEY " +  API_KEY);
    console.log("PRIVATE_KEY_ID " + process.env.PRIVATE_KEY_ID);
    console.log("PRIVATE_KEY " + process.env.PRIVATE_KEY);
    listenForNotificationRequests();
});
