
# Netlify Environment Variables Setup

## Required Firebase Admin Environment Variables

To fix the bridal products loading issue, you need to add these environment variables to your Netlify site:

### 1. Go to your Netlify site dashboard
- Visit: https://app.netlify.com
- Select your site (ccdn.netlify.app)
- Go to: **Site settings** → **Environment variables**

### 2. Add these Firebase Admin variables:

```
FIREBASE_PRIVATE_KEY_ID=your_private_key_id_here
FIREBASE_PRIVATE_KEY=your_private_key_here (keep the -----BEGIN PRIVATE KEY----- format)
FIREBASE_CLIENT_EMAIL=your_client_email_here
FIREBASE_CLIENT_ID=your_client_id_here
FIREBASE_CERT_URL=your_cert_url_here
```

### 3. How to get these values:

#### Option A: From Firebase Console
1. Go to: https://console.firebase.google.com
2. Select your project: **auric-a0c92**
3. Go to: **Project settings** → **Service accounts**
4. Click: **Generate new private key**
5. Download the JSON file
6. Copy the values from the JSON to Netlify environment variables

#### Option B: From your admin-panel.html
Your admin panel is already working, so you can extract the values from there.

### 4. Example values format:
```
FIREBASE_PRIVATE_KEY_ID=a1b2c3d4e5f6g7h8i9j0
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8c...\n-----END PRIVATE KEY-----\n
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-12345@auric-a0c92.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=123456789012345678901
FIREBASE_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-12345%40auric-a0c92.iam.gserviceaccount.com
```

### 5. After adding environment variables:
1. **Redeploy your site** (or it will auto-deploy)
2. Test the bridal products loading: https://ccdn.netlify.app/.netlify/functions/load-products-bridal
3. Should now show your actual products instead of sample products

### 6. Important Notes:
- The `FIREBASE_PRIVATE_KEY` should keep the `\n` characters for line breaks
- All values should be enclosed in quotes if they contain special characters
- After adding variables, Netlify will automatically redeploy your site

### 7. Testing:
Once configured, your bridal section should load the actual products you added through the admin panel instead of the fallback sample products.
