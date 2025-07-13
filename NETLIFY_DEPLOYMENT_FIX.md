# Fix for Netlify Showing Sample Products Instead of Your Real Products

## The Problem
Your local development shows your actual products, but Netlify deployment shows sample products because:

1. **Missing Firebase Admin Credentials**: Netlify needs Firebase Admin SDK environment variables
2. **Fallback Data**: When the Netlify function fails, it may fall back to cached or sample data

## The Solution

### Step 1: Get Your Firebase Admin Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **auric-a0c92**
3. Click the gear icon → **Project Settings**
4. Go to **Service Accounts** tab
5. Click **Generate New Private Key**
6. Download the JSON file

### Step 2: Add Environment Variables to Netlify

1. Go to your [Netlify Dashboard](https://app.netlify.com/)
2. Select your deployed site
3. Go to **Site Settings** → **Environment Variables**
4. Add these variables from your downloaded JSON file:

```
FIREBASE_PRIVATE_KEY_ID = [from service account JSON]
FIREBASE_PRIVATE_KEY = [from service account JSON - keep the \n characters]
FIREBASE_CLIENT_EMAIL = [from service account JSON]
FIREBASE_CLIENT_ID = [from service account JSON]
FIREBASE_CERT_URL = [from service account JSON]
```

### Step 3: Trigger Redeploy

1. Go to **Deploys** tab in Netlify
2. Click **Trigger Deploy** → **Deploy Site**
3. Wait for deployment to complete

### Step 4: Test the Fix

1. Visit your deployed site
2. Check if bridal section shows your actual products
3. Test the function directly: `https://yoursite.netlify.app/.netlify/functions/load-products-bridal`

## Why This Happens

- **Local Development**: Uses your server endpoint which has direct Firebase access
- **Netlify Production**: Uses Netlify Functions which need separate Firebase Admin setup
- **Different Endpoints**: The code automatically switches between local and Netlify endpoints

## After Setup

Once configured correctly:
- Your Netlify site will load your actual products from Firebase Cloud Storage
- The bridal section will show the products you added through the admin panel
- Both local and deployed versions will show the same content

## Need Help?

If you're having trouble:
1. Check Netlify Function Logs for error messages
2. Test the function URL directly in your browser
3. Verify all environment variables are set correctly
4. Make sure there are no extra quotes or spaces in the values