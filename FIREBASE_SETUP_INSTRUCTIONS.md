# Firebase Firestore Security Rules Fix

## Problem
Your profile page shows "Access denied" because your current Firestore security rules are blocking authenticated users from accessing their own data.

## Solution
You need to update your Firebase Firestore security rules to allow authenticated users to access their own data.

## Step-by-Step Instructions

### 1. Open Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **auric-a0c92**

### 2. Navigate to Firestore Rules
1. In the left sidebar, click on **Firestore Database**
2. Click on the **Rules** tab at the top

### 3. Replace Your Current Rules
Copy and paste these rules to replace your existing ones:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read and write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Allow access to user's subcollections (carts, wishlist, orders)
      match /{subcollection=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    // Allow public read access to products (if you have them)
    match /products/{productId} {
      allow read: if true;
      allow write: if false; // Only admins can modify products
    }
    
    // Allow public read access to categories (if you have them)
    match /categories/{categoryId} {
      allow read: if true;
      allow write: if false; // Only admins can modify categories
    }
  }
}
```

### 4. Publish the Rules
1. Click the **Publish** button
2. Wait for the confirmation message

### 5. Test the Fix
1. Go back to your profile page: `/profile-fixed.html`
2. The page should now load without "Access denied" errors
3. You should see your user information displayed

## What These Rules Do

- **Line 4-6**: Allow users to read and write documents in the `users/{userId}` path where `userId` matches their authentication ID
- **Line 8-10**: Allow users to access their subcollections like `users/{userId}/orders`, `users/{userId}/carts`, etc.
- **Line 14-16**: Allow anyone to read products (for browsing the store)
- **Line 19-21**: Allow anyone to read categories (for navigation)

## Verification
After updating the rules, your profile page should:
- Load successfully without errors
- Show your name and email
- Display "No Orders Yet" in the orders section (until you place orders)
- Allow logout functionality

If you still see errors after updating the rules, please let me know and I'll help debug further.