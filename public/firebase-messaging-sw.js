
// This file needs to be in the public directory

// Scripts for firebase and firebase messaging
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js");

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC5zDxYpABX5kLvbAN-EVGeWz9Y7YR5GUY",
  authDomain: "studio-8569249950-7e375.firebaseapp.com",
  projectId: "studio-8569249950-7e375",
  storageBucket: "studio-8569249950-7e375.firebasestorage.app",
  messagingSenderId: "524844859144",
  appId: "1:524844859144:web:21a6d38e47f7d1340c76bd",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/favicon.svg",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
