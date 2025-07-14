/**
 * Netlify Function: Load Bandwidth Test Products (Enhanced with Comprehensive Debugging)
 * 
 * This enhanced version includes:
 * - Better error handling and diagnostics
 * - Fallback to direct Firebase Storage URLs when Admin SDK fails
 * - Comprehensive logging for debugging
 * - Multiple authentication methods
 */

const admin = require('firebase-admin');

// Firebase configuration for direct access fallback
const FIREBASE_PROJECT_ID = 'auric-a0c92';
const FIREBASE_STORAGE_BUCKET = 'auric-a0c92.firebasestorage.app';

// Initialize Firebase Admin SDK with enhanced error handling
let firebaseInitialized = false;
let initializationError = null;

function initializeFirebaseAdmin() {
  if (firebaseInitialized || admin.apps.length > 0) {
    return true;
  }

  try {
    console.log('🔧 Attempting Firebase Admin initialization...');
    
    // Check if we have the required environment variables
    const requiredVars = ['FIREBASE_PRIVATE_KEY', 'FIREBASE_CLIENT_EMAIL'];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
      initializationError = `Missing Firebase environment variables: ${missingVars.join(', ')}`;
      console.error('❌', initializationError);
      return false;
    }

    // Use environment variables for Firebase Admin
    const serviceAccount = {
      type: 'service_account',
      project_id: process.env.FIREBASE_PROJECT_ID || FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: process.env.FIREBASE_CERT_URL
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: FIREBASE_STORAGE_BUCKET
    });

    firebaseInitialized = true;
    console.log('✅ Firebase Admin initialized successfully');
    return true;

  } catch (error) {
    initializationError = `Firebase Admin initialization failed: ${error.message}`;
    console.error('❌', initializationError);
    return false;
  }
}

// Fallback function to generate direct Firebase Storage URLs
function generateDirectStorageUrl(category) {
  const encodedPath = encodeURIComponent(`bandwidthTest/${category}-products.json`);
  const directUrl = `https://firebasestorage.googleapis.com/v0/b/${FIREBASE_STORAGE_BUCKET}/o/${encodedPath}?alt=media`;
  
  console.log(`🔄 Generated direct storage URL for ${category}: ${directUrl}`);
  return directUrl;
}

// Enhanced function to get signed URL with fallback
async function getProductsUrl(category) {
  // Try Firebase Admin SDK first
  if (initializeFirebaseAdmin()) {
    try {
      const bucket = admin.storage().bucket();
      const file = bucket.file(`bandwidthTest/${category}-products.json`);

      // Check if file exists
      const [exists] = await file.exists();
      if (!exists) {
        console.log(`📂 No ${category} products found in Firebase Storage`);
        return {
          success: true,
          downloadUrl: null,
          message: `No ${category} test products found - add some through the uploader`,
          method: 'admin-sdk-not-found'
        };
      }

      // Get signed URL for 30 days
      const [downloadUrl] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + 30 * 24 * 60 * 60 * 1000
      });

      console.log(`✅ Generated signed URL for ${category} via Admin SDK`);
      return {
        success: true,
        downloadUrl: downloadUrl,
        method: 'admin-sdk-signed-url',
        message: `Generated CDN URL for ${category} test products`
      };

    } catch (error) {
      console.error(`❌ Admin SDK failed for ${category}:`, error.message);
      // Fall through to direct URL method
    }
  }

  // Fallback to direct Firebase Storage URL
  console.log(`🔄 Using direct Firebase Storage URL fallback for ${category}`);
  const directUrl = generateDirectStorageUrl(category);
  
  return {
    success: true,
    downloadUrl: directUrl,
    method: 'direct-storage-url',
    message: `Using direct Firebase Storage URL for ${category} test products`,
    warning: 'Using fallback method - Firebase Admin SDK not configured'
  };
}

exports.handler = async (event, context) => {
  const startTime = Date.now();
  
  // Enhanced CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, If-None-Match, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
    'X-Function-Version': '2.0-enhanced'
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
        message: 'Method not allowed - only GET requests supported'
      })
    };
  }

  try {
    console.log(`🚀 Function started at ${new Date().toISOString()}`);
    console.log(`📍 Request origin: ${event.headers.origin || 'Unknown'}`);
    
    // Get category from query parameters
    const category = event.queryStringParameters?.category;
    
    if (!category) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Missing category parameter',
          message: 'Please provide a category parameter: ?category=bandwidth-test-1',
          availableCategories: ['bandwidth-test-1', 'bandwidth-test-2', 'bandwidth-test-3']
        })
      };
    }

    console.log(`📂 Loading bandwidth test products for category: ${category}`);

    // Get products URL using enhanced method with fallback
    const result = await getProductsUrl(category);
    
    const processingTime = Date.now() - startTime;
    console.log(`⏱️ Processing completed in ${processingTime}ms`);

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Cache-Control': 'public, max-age=1800',
        'X-Processing-Time': `${processingTime}ms`,
        'X-Method-Used': result.method
      },
      body: JSON.stringify({
        success: result.success,
        downloadUrl: result.downloadUrl,
        category: category,
        testType: 'bandwidth-test',
        method: result.method,
        message: result.message,
        warning: result.warning,
        processingTime: processingTime,
        timestamp: new Date().toISOString(),
        debug: {
          firebaseInitialized: firebaseInitialized,
          initializationError: initializationError,
          functionVersion: '2.0-enhanced'
        }
      })
    };

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`💥 Function error after ${processingTime}ms:`, error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: `Function error: ${error.message}`,
        message: 'Please check the logs and try again',
        processingTime: processingTime,
        timestamp: new Date().toISOString(),
        debug: {
          firebaseInitialized: firebaseInitialized,
          initializationError: initializationError,
          errorStack: error.stack
        }
      })
    };
  }
};