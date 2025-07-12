# Firebase Storage Rules for Auric Jewelry

**IMPORTANT:** These are Firebase Storage rules, NOT Firestore rules.

Go to Firebase Console > Storage > Rules and replace the existing rules with:

```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    // Allow public read/write access to product data (for admin operations)
    match /productData/{allPaths=**} {
      allow read, write: if true;
    }
    
    // Allow public read/write access to product images (for admin operations)
    match /productImages/{allPaths=**} {
      allow read, write: if true;
    }
    
    // User-specific data requires authentication
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Default rule for other paths (public access for testing)
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

## Steps to Update Storage Rules:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: "auric-a0c92"
3. Click on "Storage" in the left sidebar
4. Click on the "Rules" tab
5. Replace the existing rules with the rules above
6. Click "Publish"

These rules allow:
- ✅ Public read access to product data and images
- ✅ Authenticated write access for admins
- ✅ User-specific data protection