/**
 * Netlify Function: Upload Bandwidth Test Product
 * 
 * Handles file uploads to Firebase Storage for bandwidth testing
 * POST requests with multipart form data
 */

const admin = require('firebase-admin');
const busboy = require('busboy');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    // Check if all required environment variables are present
    const requiredVars = ['FIREBASE_PRIVATE_KEY', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PROJECT_ID'];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
      console.error('Missing Firebase environment variables:', missingVars);
    } else {
      const serviceAccount = {
        type: 'service_account',
        project_id: process.env.FIREBASE_PROJECT_ID || 'auric-a0c92',
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
        storageBucket: 'auric-a0c92.firebasestorage.app'
      });

      console.log('Firebase Admin initialized successfully for bandwidth test uploads');
    }
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
  }
}

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, message: 'Method not allowed' })
    };
  }

  try {
    // Check Firebase Admin
    if (admin.apps.length === 0) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Firebase Admin not configured'
        })
      };
    }

    const bucket = admin.storage().bucket();

    // Parse multipart form data
    return new Promise((resolve) => {
      const bb = busboy({ 
        headers: {
          'content-type': event.headers['content-type'] || event.headers['Content-Type']
        }
      });

      const fields = {};
      let fileBuffer = null;
      let fileName = '';
      let fileType = '';

      bb.on('field', (fieldname, val) => {
        fields[fieldname] = val;
      });

      bb.on('file', (fieldname, file, info) => {
        fileName = info.filename;
        fileType = info.mimeType;
        const chunks = [];

        file.on('data', (chunk) => {
          chunks.push(chunk);
        });

        file.on('end', () => {
          fileBuffer = Buffer.concat(chunks);
        });
      });

      bb.on('finish', async () => {
        try {
          if (!fileBuffer) {
            resolve({
              statusCode: 400,
              headers,
              body: JSON.stringify({ success: false, error: 'No file provided' })
            });
            return;
          }

          const { category, productName, productPrice, productDescription } = fields;
          const productId = `TEST-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

          // Upload image with comprehensive CDN cache metadata
          const metadata = {
            cacheControl: 'public, max-age=2592000, immutable', // 30 days cache with immutable flag
            contentType: fileType,
            customMetadata: {
              uploadTimestamp: new Date().toISOString(),
              cacheOptimized: 'true',
              cdnEnabled: 'true'
            }
          };

          await imageFile.save(fileBuffer, { metadata });
          const imageUrl = `https://firebasestorage.googleapis.com/v0/b/auric-a0c92.firebasestorage.app/o/bandwidthTest%2F${imageFileName}?alt=media`;

          // Create product data
          const productData = {
            id: productId,
            name: productName,
            price: parseFloat(productPrice),
            description: productDescription,
            image: imageUrl,
            category: category,
            createdAt: new Date().toISOString(),
            testNote: 'CDN bandwidth test product'
          };

          // Load existing products
          let existingProducts = [];
          try {
            const jsonFile = bucket.file(`bandwidthTest/${category}-products.json`);
            const [exists] = await jsonFile.exists();

            if (exists) {
              const [fileContents] = await jsonFile.download();
              const data = JSON.parse(fileContents.toString());
              if (Array.isArray(data)) {
                existingProducts = data;
              }
            }
          } catch (error) {
            console.log('Creating new product file for category:', category);
          }

          // Add new product
          existingProducts.push(productData);

          // Save updated products JSON with comprehensive CDN cache headers
          const jsonData = JSON.stringify(existingProducts, null, 2);
          const jsonFile = bucket.file(`bandwidthTest/${category}-products.json`);

          const jsonMetadata = {
            cacheControl: 'public, max-age=2592000, must-revalidate', // 30 days but revalidate
            contentType: 'application/json',
            customMetadata: {
              lastUpdated: new Date().toISOString(),
              cacheOptimized: 'true',
              cdnEnabled: 'true',
              productCount: existingProducts.length.toString()
            }
          };

          await jsonFile.save(jsonData, { metadata: jsonMetadata });

          resolve({
            statusCode: 200,
            headers,
            body: JSON.stringify({
              success: true,
              message: `Product "${productName}" uploaded successfully!`,
              productId: productId,
              category: category,
              totalProducts: existingProducts.length,
              imageUrl: imageUrl
            })
          });

        } catch (error) {
          console.error('Upload error:', error);
          resolve({
            statusCode: 500,
            headers,
            body: JSON.stringify({
              success: false,
              error: `Upload failed: ${error.message}`
            })
          });
        }
      });

      bb.write(event.body, event.isBase64Encoded ? 'base64' : 'binary');
      bb.end();
    });

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: `Function error: ${error.message}`
      })
    };
  }
};