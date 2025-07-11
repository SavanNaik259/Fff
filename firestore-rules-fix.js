/**
 * Firebase Firestore Security Rules Configuration
 * 
 * These rules need to be applied in your Firebase Console under Firestore Database > Rules
 * The current permission denied errors suggest your Firestore rules are too restrictive.
 * 
 * IMPORTANT: Copy these rules to your Firebase Console:
 * 1. Go to Firebase Console > Project Settings > Firestore Database
 * 2. Click on "Rules" tab
 * 3. Replace existing rules with the rules below
 * 4. Click "Publish"
 */

const RECOMMENDED_FIRESTORE_RULES = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read and write their own profile data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Allow users to read and write their own cart data
      match /carts/{cartId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      // Allow users to read and write their own wishlist data
      match /wishlist/{wishlistId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      // Allow users to read and write their own orders
      match /orders/{orderId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    // Public read access for products, allow write for product management
    match /products/{productId} {
      allow read: if true;
      allow write: if true; // Allow product creation for admin panel
    }
    
    // Public read access for categories (if you have a categories collection)
    match /categories/{categoryId} {
      allow read: if true;
      allow write: if false; // Only admins should write categories
    }
  }
}`;

console.log("=".repeat(80));
console.log("FIREBASE FIRESTORE SECURITY RULES");
console.log("=".repeat(80));
console.log("");
console.log("Copy the rules below to your Firebase Console:");
console.log("Firebase Console > Firestore Database > Rules");
console.log("");
console.log(RECOMMENDED_FIRESTORE_RULES);
console.log("");
console.log("=".repeat(80));

// Also check if we can help debug the current authentication state
if (typeof window !== 'undefined' && window.firebase) {
  window.firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      console.log("✅ User is authenticated:", user.uid);
      console.log("📧 Email:", user.email);
      console.log("👤 Display Name:", user.displayName);
    } else {
      console.log("❌ No user authenticated");
    }
  });
}