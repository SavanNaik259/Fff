/**
 * Netlify Function: Load Bridal Products
 * 
 * Loads bridal products from Firebase Storage
 * Handles GET requests to /.netlify/functions/load-products-bridal
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    // Check if we have the required environment variables
    if (!process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_CLIENT_EMAIL) {
      console.error('Missing required Firebase environment variables');
      console.log('Required variables: FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL');
    }

    // Use environment variables for Firebase Admin
    const serviceAccount = {
      type: 'service_account',
      project_id: 'auric-a0c92',
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY ? 
        process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : null,
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: process.env.FIREBASE_CERT_URL
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: 'auric-a0c92.firebasestorage.app'
    });

    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
    throw error; // Don't continue with invalid Firebase setup
  }
}

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, If-None-Match',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers
    };
  }

  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Method not allowed'
      })
    };
  }

  try {
    console.log('Loading bridal products from Cloud Storage...');

    // Check if Firebase Admin is properly initialized
    if (admin.apps.length === 0) {
      console.error('Firebase Admin not initialized - missing environment variables');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: false,
          products: [],
          error: 'Firebase Admin not configured. Please set up environment variables.',
          message: 'Missing Firebase credentials in Netlify environment variables'
        })
      };
    }

    // Get Firebase Storage bucket
    const bucket = admin.storage().bucket();

    // Try to download the bridal products JSON file
    const file = bucket.file('productData/bridal-products.json');

    // Check if file exists
    const [exists] = await file.exists();

    if (!exists) {
      console.log('No bridal products file found in Firebase Storage');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          products: [],
          message: 'No products found - add some through the admin panel'
        })
      };
    }

    // Get file metadata for ETag
    const [metadata] = await file.getMetadata();
    const etag = metadata.etag || metadata.md5Hash;
    
    // Check if client has cached version
    const clientETag = event.headers['if-none-match'];
    if (clientETag && clientETag === etag) {
      return {
        statusCode: 304,
        headers: {
          ...headers,
          'ETag': etag,
          'Cache-Control': 'public, max-age=300'
        }
      };
    }

    // Download and parse the file
    const [fileContents] = await file.download();
    const products = JSON.parse(fileContents.toString());

    console.log(`Successfully loaded ${products.length} bridal products from Firebase Storage`);

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'ETag': etag,
        'Cache-Control': 'public, max-age=300'
      },
      body: JSON.stringify({
        success: true,
        products: Array.isArray(products) ? products : [],
        message: `Loaded ${products.length} products from Firebase Storage`
      })
    };

  } catch (error) {
    console.error('Error loading bridal products:', error);

    // Return proper error response without fallback products
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        products: [],
        error: `Failed to load products: ${error.message}`,
        message: 'Please check Firebase configuration and try again'
      })
    };
  }
};