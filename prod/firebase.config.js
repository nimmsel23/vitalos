// Private development environment. Product builds resolve to the generated
// .product-config/firebase.config.js instead of bundling this module.
export const config = {
  apiKey:            "AIzaSyD1hvp2UYrvizLOzoSqOX-bwRWcCpJVAlg",
  authDomain:        "fitness-aos.firebaseapp.com",
  projectId:         "fitness-aos",
  storageBucket:     "fitness-aos.firebasestorage.app",
  messagingSenderId: "842575255284",
  appId:             "1:842575255284:web:65c4831683a893c110f0a1",
};

export const firebaseConfig = config;

// Web Push certificate for the private development project.
export const VAPID_KEY = "BLO5LBXVHXR4HS5sHyHLwl5n3iXURypO3ZSCh4Ser-itoQTmO3bhnawqEWP913PzBx31cHExbkuodvIqLjPzvd0";
