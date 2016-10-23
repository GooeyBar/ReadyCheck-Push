var firebase = require('firebase');
var request = require('request');

var API_KEY = ENV['API_KEY']; // Your Firebase Cloud Server API key

firebase.initializeApp({
  serviceAccount: {
    "type": "service_account",
    "project_id": "readycheck-24872",
    "private_key_id": ENV['PRIVATE_KEY_ID'],
    "private_key": ENV['PRIVATE_KEY'],
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
  var requests = ref.child('notificationRequests');
  requests.on('child_added', function(requestSnapshot) {
    var request = requestSnapshot.val();
    sendNotificationToUser(
      request.username, 
      request.message,
      function() {
        requestSnapshot.ref.remove();
      }
    );
  }, function(error) {
    console.error(error);
  });
};

function sendNotificationToUser(username, message, onSuccess) {
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
      to : '/topics/user_'+username
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

listenForNotificationRequests();