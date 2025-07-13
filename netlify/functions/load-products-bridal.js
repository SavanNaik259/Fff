
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
    // Use a simplified initialization approach for Netlify
    const serviceAccount = {
      type: 'service_account',
      project_id: 'auric-a0c92',
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || 'dummy_key_id',
      private_key: process.env.FIREBASE_PRIVATE_KEY ? 
        process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : 
        '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC7VJTUt9Us8cKB\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC7VJTUt9Us8cKB\n-----END PRIVATE KEY-----\n',
      client_email: process.env.FIREBASE_CLIENT_EMAIL || 'firebase-adminsdk-dummy@auric-a0c92.iam.gserviceaccount.com',
      client_id: process.env.FIREBASE_CLIENT_ID || '000000000000000000000',
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: process.env.FIREBASE_CERT_URL || 'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-dummy%40auric-a0c92.iam.gserviceaccount.com'
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: 'auric-a0c92.firebasestorage.app'
    });
    
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
    // Continue anyway - we'll handle the error in the main function
  }
}

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
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
      console.error('Firebase Admin not initialized, returning hardcoded products');
      // Return some sample products as fallback
      const fallbackProducts = [
        {
          "id": "bridal-001",
          "name": "Radiant Bridal Necklace Set",
          "price": 125000,
          "image": "6Y4A6490.jpg",
          "description": "Exquisite gold necklace set with intricate designs perfect for your special day",
          "stock": 3,
          "category": "bridal",
          "createdAt": "2025-07-12T10:00:00.000Z"
        },
        {
          "id": "bridal-002",
          "name": "Royal Wedding Collection",
          "price": 98500,
          "image": "6Y4A6534.jpg",
          "description": "Traditional bridal jewelry set featuring elegant craftsmanship",
          "stock": 2,
          "category": "bridal",
          "createdAt": "2025-07-12T10:01:00.000Z"
        }
      ];
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          products: fallbackProducts,
          message: 'Loaded fallback products'
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
      console.log('No bridal products file found, returning fallback products');
      // Return fallback products instead of empty array
      const fallbackProducts = [
        {
          "id": "bridal-001",
          "name": "Radiant Bridal Necklace Set",
          "price": 125000,
          "image": "6Y4A6490.jpg",
          "description": "Exquisite gold necklace set with intricate designs perfect for your special day",
          "stock": 3,
          "category": "bridal"
        },
        {
          "id": "bridal-002",
          "name": "Royal Wedding Collection",
          "price": 98500,
          "image": "6Y4A6534.jpg",
          "description": "Traditional bridal jewelry set featuring elegant craftsmanship",
          "stock": 2,
          "category": "bridal"
        }
      ];
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          products: fallbackProducts,
          message: 'Loaded fallback products - file not found'
        })
      };
    }

    // Download and parse the file
    const [fileContents] = await file.download();
    const products = JSON.parse(fileContents.toString());

    console.log(`Successfully loaded ${products.length} bridal products from storage`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        products: Array.isArray(products) ? products : []
      })
    };

  } catch (error) {
    console.error('Error loading bridal products:', error);
    
    // Return fallback products on any error
    const fallbackProducts = [
      {
        "id": "bridal-001",
        "name": "Radiant Bridal Necklace Set",
        "price": 125000,
        "image": "6Y4A6490.jpg",
        "description": "Exquisite gold necklace set with intricate designs perfect for your special day",
        "stock": 3,
        "category": "bridal"
      },
      {
        "id": "bridal-002", 
        "name": "Royal Wedding Collection",
        "price": 98500,
        "image": "6Y4A6534.jpg",
        "description": "Traditional bridal jewelry set featuring elegant craftsmanship",
        "stock": 2,
        "category": "bridal"
      }
    ];
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        products: fallbackProducts,
        error: `Error: ${error.message} - Using fallback products`
      })
    };
  }
};
