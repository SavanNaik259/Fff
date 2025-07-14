
/**
 * Netlify Function: Load Bandwidth Test Products
 * 
 * Loads products from Firebase Storage for bandwidth testing
 * Handles GET requests to /.netlify/functions/load-bandwidth-test-products?category=CATEGORY
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

    console.log('Firebase Admin initialized successfully for bandwidth testing');
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
    throw error;
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
    // Get category from query parameters
    const category = event.queryStringParameters?.category;
    
    if (!category) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          products: [],
          error: 'Category parameter is required',
          message: 'Please provide a category parameter: ?category=bandwidth-test-1'
        })
      };
    }

    console.log(`Loading bandwidth test products for category: ${category}`);

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

    // Try to download the products JSON file for the specific test category
    const file = bucket.file(`bandwidthTest/${category}-products.json`);

    // Check if file exists
    const [exists] = await file.exists();

    if (!exists) {
      console.log(`No ${category} bandwidth test products found in Firebase Storage`);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          products: [],
          message: `No ${category} test products found - add some through the uploader`
        })
      };
    }

    // Get file metadata for ETag
    const [metadata] = await file.getMetadata();
    const etag = metadata.etag || metadata.md5Hash;
    
    // Check if client has cached version
    const clientETag = event.headers['if-none-match'];
    if (clientETag && clientETag === etag) {
      console.log(`Client has cached version of ${category} products`);
      return {
        statusCode: 304,
        headers: {
          ...headers,
          'ETag': etag,
          'Cache-Control': 'public, max-age=1800'
        }
      };
    }

    // Download and parse the file
    const [fileContents] = await file.download();
    const products = JSON.parse(fileContents.toString());

    console.log(`Successfully loaded ${products.length} ${category} bandwidth test products`);

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'ETag': etag,
        'Cache-Control': 'public, max-age=1800'
      },
      body: JSON.stringify({
        success: true,
        products: Array.isArray(products) ? products : [],
        category: category,
        testType: 'bandwidth-test',
        message: `Loaded ${products.length} test products from Firebase Storage`
      })
    };

  } catch (error) {
    console.error(`Error loading ${category || 'unknown'} bandwidth test products:`, error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        products: [],
        error: `Failed to load test products: ${error.message}`,
        message: 'Please check Firebase configuration and try again'
      })
    };
  }
};
