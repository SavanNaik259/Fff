# Firebase Hosting for Auric Jewelry E-commerce

This document outlines how to deploy the Auric Jewelry e-commerce website to Firebase Hosting.

## Prerequisites

1. A Firebase account (same Google account used for Firebase Authentication)
2. Firebase CLI installed (`npm install -g firebase-tools`)
3. The necessary API keys and secrets for:
   - Email service (for order confirmations)
   - Razorpay payment gateway

## Deployment Steps

### 1. Login to Firebase

```bash
firebase login
```

### 2. Set Firebase Configuration Variables

These environment variables are needed for the Cloud Functions to work properly:

```bash
# Email configuration
firebase functions:config:set email.service="gmail" email.user="your-email@gmail.com" email.pass="your-app-password" email.owner="store-owner-email@gmail.com"

# Razorpay configuration
firebase functions:config:set razorpay.key_id="your-razorpay-key-id" razorpay.key_secret="your-razorpay-key-secret"
```

Note: For Gmail, you'll need to use an App Password instead of your regular password. Generate one at https://myaccount.google.com/apppasswords

### 3. Deploy to Firebase

Deploy the website and Cloud Functions:

```bash
firebase deploy
```

Or deploy only specific parts:

```bash
# Deploy only hosting
firebase deploy --only hosting

# Deploy only functions
firebase deploy --only functions
```

### 4. Update Client-Side API Endpoints

After deployment, update any client-side API calls in your code to point to the Firebase functions instead of your local server:

Replace instances of:
```javascript
fetch('/api/send-order-email', ...)
```

With:
```javascript
fetch('https://us-central1-auric-a0c92.cloudfunctions.net/sendOrderEmail', ...)
```

Or use relative paths which will be handled by the Firebase hosting rewrites:
```javascript
fetch('/api/send-order-email', ...)
```

## Project Structure

- `firebase.json` - Main Firebase configuration file
- `.firebaserc` - Firebase project association
- `functions/` - Cloud Functions directory
  - `index.js` - Main Cloud Functions code
  - `email/` - Email service modules
    - `config.js` - Email configuration
    - `service.js` - Email sending functionality
    - `templates.js` - Email templates

## Troubleshooting

1. Check function logs:
   ```bash
   firebase functions:log
   ```

2. Test functions locally:
   ```bash
   firebase emulators:start
   ```

3. If emails aren't being sent, verify your email configuration with:
   ```bash
   firebase functions:config:get
   ```

## Firebase Resources Used

- Firebase Hosting - For serving static files
- Firebase Cloud Functions - For backend functionality
- Firebase Authentication - For user accounts (already set up)
- Firebase Firestore - For data storage (already set up)