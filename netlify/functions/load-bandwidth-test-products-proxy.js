/**
 * Netlify Function: Load Bandwidth Test Products with CORS Proxy
 * 
 * This function acts as a CORS proxy to fetch data from Firebase Storage
 * and return it directly, avoiding CORS issues with signed URLs
 */

const admin = require('firebase-admin');

// Firebase configuration
const FIREBASE_PROJECT_ID = 'auric-a0c92';
const FIREBASE_STORAGE_BUCKET = 'auric-a0c92.firebasestorage.app';

// Initialize Firebase Admin SDK
let firebaseInitialized = false;

function initializeFirebaseAdmin() {
  if (firebaseInitialized || admin.apps.length > 0) {
    return true;
  }

  try {
    console.log('🔧 Initializing Firebase Admin for CORS proxy...');
    
    // Check for environment variables
    if (!process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_CLIENT_EMAIL) {
      console.log('⚠️ Missing Firebase env vars, using fallback method');
      return false;
    }

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
    console.log('✅ Firebase Admin initialized for CORS proxy');
    return true;

  } catch (error) {
    console.error('❌ Firebase Admin init failed:', error.message);
    return false;
  }
}

// Fallback function to fetch from public Firebase Storage URLs
async function fetchFromPublicStorage(category) {
  const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${FIREBASE_STORAGE_BUCKET}/o/bandwidthTest%2F${category}-products.json?alt=media`;
  
  try {
    const response = await fetch(publicUrl);
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Fetched ${data.length} products from public storage for ${category}`);
      return { success: true, products: data, method: 'public-storage' };
    } else {
      console.log(`📂 No public data found for ${category}`);
      return { success: true, products: [], method: 'public-storage-not-found' };
    }
  } catch (error) {
    console.error(`❌ Public storage fetch failed for ${category}:`, error.message);
    return { success: false, error: error.message, method: 'public-storage-error' };
  }
}

exports.handler = async (event, context) => {
  const startTime = Date.now();
  
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, If-None-Match, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=1800',
    'X-Function-Type': 'cors-proxy'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, message: 'Method not allowed' })
    };
  }

  try {
    const category = event.queryStringParameters?.category;
    
    if (!category) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Missing category parameter',
          message: 'Please provide: ?category=bandwidth-test-1'
        })
      };
    }

    console.log(`🚀 CORS proxy request for category: ${category}`);

    // Try Firebase Admin SDK first
    if (initializeFirebaseAdmin()) {
      try {
        const bucket = admin.storage().bucket();
        const file = bucket.file(`bandwidthTest/${category}-products.json`);

        const [exists] = await file.exists();
        if (!exists) {
          console.log(`📂 No ${category} products in Firebase Storage`);
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              success: true,
              products: [],
              message: `No ${category} test products found`,
              method: 'admin-sdk-not-found'
            })
          };
        }

        // Download the file directly
        const [data] = await file.download();
        const products = JSON.parse(data.toString());
        
        console.log(`✅ Downloaded ${products.length} products via Admin SDK for ${category}`);
        
        return {
          statusCode: 200,
          headers: {
            ...headers,
            'X-Method-Used': 'admin-sdk-download',
            'X-Processing-Time': `${Date.now() - startTime}ms`
          },
          body: JSON.stringify({
            success: true,
            products: products,
            category: category,
            method: 'admin-sdk-download',
            processingTime: Date.now() - startTime,
            message: `Successfully fetched ${products.length} products via CORS proxy`
          })
        };

      } catch (adminError) {
        console.error(`❌ Admin SDK failed for ${category}:`, adminError.message);
        // Fall through to public storage method
      }
    }

    // Fallback to public storage
    console.log(`🔄 Using public storage fallback for ${category}`);
    const fallbackResult = await fetchFromPublicStorage(category);
    
    return {
      statusCode: fallbackResult.success ? 200 : 500,
      headers: {
        ...headers,
        'X-Method-Used': fallbackResult.method,
        'X-Processing-Time': `${Date.now() - startTime}ms`
      },
      body: JSON.stringify({
        ...fallbackResult,
        category: category,
        processingTime: Date.now() - startTime,
        message: fallbackResult.success 
          ? `Fetched ${fallbackResult.products.length} products via ${fallbackResult.method}`
          : `Failed to fetch products: ${fallbackResult.error}`
      })
    };

  } catch (error) {
    console.error(`💥 CORS proxy error:`, error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: `CORS proxy failed: ${error.message}`,
        category: event.queryStringParameters?.category,
        processingTime: Date.now() - startTime
      })
    };
  }
};