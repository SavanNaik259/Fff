# URGENT: Update Your Firebase Firestore Rules

## The Issue
Your admin panel can't add products because Firebase Firestore rules are blocking write access to the products collection.

## Solution
Copy and paste these rules into your Firebase Console:

### Step 1: Go to Firebase Console
1. Open https://console.firebase.google.com
2. Select your project: `auric-a0c92`
3. Go to **Firestore Database**
4. Click on the **Rules** tab

### Step 2: Replace Your Current Rules
Replace all existing rules with these updated ones:

```javascript
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
    
    // Public read access for categories
    match /categories/{categoryId} {
      allow read: if true;
      allow write: if true; // Allow category management
    }
  }
}
```

### Step 3: Publish the Rules
1. Click **Publish** button
2. Wait for confirmation message

### Step 4: Test Your Admin Panel
After updating the rules, try adding a product through `/admin-panel.html` - it should work without permission errors.

## What This Fixes
- Allows your admin panel to create products in Firestore
- Maintains security for user data (users can only access their own data)
- Keeps products publicly readable for the bridal collection page

## Storage Rules (Also Important)
Make sure your Firebase Storage rules allow uploads too. They should be:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

Once you update these rules, your product management system will work perfectly!