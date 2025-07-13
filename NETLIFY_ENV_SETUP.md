
# Netlify Environment Variables Setup

To fix the Firebase initialization error on Netlify, you need to set up environment variables in your Netlify dashboard.

## Required Environment Variables

Go to your Netlify site dashboard → Site settings → Environment variables and add:

### Method 1: Using Firebase Service Account (Recommended)

1. **FIREBASE_PROJECT_ID**: `auric-a0c92`
2. **FIREBASE_PRIVATE_KEY_ID**: Get from Firebase service account JSON
3. **FIREBASE_PRIVATE_KEY**: Get from Firebase service account JSON (the entire private key including the BEGIN/END lines)
4. **FIREBASE_CLIENT_EMAIL**: Get from Firebase service account JSON
5. **FIREBASE_CLIENT_ID**: Get from Firebase service account JSON
6. **FIREBASE_CERT_URL**: Get from Firebase service account JSON

### How to Get Service Account Keys

1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Copy the values from the JSON to Netlify environment variables

### Method 2: Fallback (Current Implementation)

The function now includes fallback products, so even if Firebase fails, you'll see sample products instead of the error message.

## Test the Function

After setting up environment variables:

1. Redeploy your Netlify site
2. Visit: `https://yoursite.netlify.app/.netlify/functions/load-products-bridal`
3. You should see products instead of the Firebase error

## Troubleshooting

If you still see errors:
- Check that all environment variables are set correctly
- Make sure there are no extra spaces in the values
- Verify the FIREBASE_PRIVATE_KEY includes the full key with newlines

The fallback system ensures your site works even without proper Firebase setup.
