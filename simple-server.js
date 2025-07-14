/**
 * Auric Combined Server
 * 
 * This server combines both static file serving and API endpoints for:
 * 1. Serving static website files
 * 2. Handling order confirmation emails using Nodemailer
 */
const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const dotenv = require('dotenv');
const admin = require('firebase-admin');
const crypto = require('crypto');

// In-memory cache for products
const productCache = {};
const PRODUCT_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// Load environment variables
dotenv.config();

// Import email service
const emailService = require('./server/email/service');

// Port configuration
const PORT = process.env.PORT || 5000;

// Initialize Express app
const app = express();

// Apply middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Add cache headers based on endpoint type
app.use((req, res, next) => {
  // Allow caching for product data to improve performance
  if (req.url.startsWith('/api/load-products/')) {
    // Cache product data for 5 minutes (browser cache)
    res.setHeader('Cache-Control', 'public, max-age=300');
    // Use a stable ETag based on URL (will be updated with actual data hash later)
    res.setHeader('ETag', `"products-${req.url.replace(/[^a-zA-Z0-9]/g, '-')}"`);
  } else {
    // No cache for other API endpoints and dynamic content
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  next();
});

// API Endpoints
// =============

/**
 * Send order confirmation emails
 * Sends emails to both the customer and store owner
 */
app.post('/api/send-order-email', async (req, res) => {
  try {
    // Get order data from request body
    const orderData = req.body;

    // Validate required data
    if (!orderData || !orderData.customer || !orderData.products) {
      return res.status(400).json({
        success: false,
        message: 'Missing required order data'
      });
    }

    console.log('Received order email request for:', orderData.orderReference);

    // Send emails
    const result = await emailService.sendOrderEmails(orderData);

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: 'Order emails sent successfully',
        result
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Failed to send order emails',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error in send-order-email endpoint:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while sending order emails',
      error: error.message
    });
  }
});

/**
 * Create a Razorpay order
 */
app.post('/api/create-razorpay-order', async (req, res) => {
  try {
    // Import Razorpay
    const Razorpay = require('razorpay');

    // Create a Razorpay instance
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    // Get order details from request body
    const { amount, currency = 'INR', receipt, notes } = req.body;

    // Validate required data
    if (!amount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required order data (amount)'
      });
    }

    console.log('Creating Razorpay order for amount:', amount);

    // Convert amount to paise (Razorpay uses smallest currency unit)
    const amountInPaise = Math.round(amount * 100);

    // Create order
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency,
      receipt,
      notes
    });

    // Return order details
    return res.status(200).json({
      success: true,
      order,
      key_id: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create Razorpay order',
      error: error.message
    });
  }
});

/**
 * Verify Razorpay payment
 */
app.post('/api/verify-razorpay-payment', async (req, res) => {
  try {
    // Get payment details from request body
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    // Validate required data
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment verification data'
      });
    }

    console.log('Verifying Razorpay payment:', razorpay_payment_id);

    // Create the signature verification data
    const crypto = require('crypto');
    const secret = process.env.RAZORPAY_KEY_SECRET;
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest('hex');

    // Verify the signature
    if (generated_signature === razorpay_signature) {
      return res.status(200).json({
        success: true,
        message: 'Payment verified successfully'
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }
  } catch (error) {
    console.error('Error verifying Razorpay payment:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while verifying payment',
      error: error.message
    });
  }
});

/**
 * Load products from Firebase Cloud Storage
 * Simple proxy to bypass CORS issues - Firebase Storage CDN handles all caching
 */
app.get('/api/load-products/:category', async (req, res) => {
  try {
    const { category } = req.params;
    console.log(`Loading ${category} products from Firebase Storage CDN...`);

    // Simple fetch from Firebase Storage - their CDN handles all caching automatically
    const storageUrl = `https://firebasestorage.googleapis.com/v0/b/auric-a0c92.firebasestorage.app/o/productData%2F${category}-products.json?alt=media&token=c6a2eb63-56e3-4fc0-96ac-66773cf45f96`;

    const response = await fetch(storageUrl);

    if (!response.ok) {
      if (response.status === 404) {
        console.log(`No ${category} products found in Firebase Storage`);
        return res.json({
          success: true,
          products: [],
          count: 0,
          category: category,
          message: `No ${category} products found - add some through the admin panel`
        });
      }
      throw new Error(`Failed to fetch from storage: ${response.status}`);
    }

    const products = await response.json();
    console.log(`Successfully loaded ${products.length} ${category} products`);

    // Pass through Firebase Storage cache headers
    const cacheControl = response.headers.get('cache-control');
    const etag = response.headers.get('etag');

    if (cacheControl) res.setHeader('Cache-Control', cacheControl);
    if (etag) res.setHeader('ETag', etag);

    const responseData = {
      success: true,
      products: products,
      count: products.length,
      category: category
    };

    res.json(responseData);

  } catch (error) {
    console.error('Error loading products:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      products: []
    });
  }
});

/**
 * Health check endpoint
 * Used to verify server is running properly
 */
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    emailConfig: {
      service: process.env.EMAIL_SERVICE || 'Not set',
      user: process.env.EMAIL_USER ? 'Set' : 'Not set',
      pass: process.env.EMAIL_PASS ? 'Set' : 'Not set'
    },
    razorpayConfig: {
      key_id: process.env.RAZORPAY_KEY_ID ? 'Set' : 'Not set',
      key_secret: process.env.RAZORPAY_KEY_SECRET ? 'Set' : 'Not set'
    }
  });
});

// Serve static files from the current directory
app.use(express.static('.', {
  // Set a standard Content-Type based on file extension
  setHeaders: (res, filePath) => {
    const extname = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'text/javascript',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon',
      '.ttf': 'font/ttf',
      '.woff': 'font/woff',
      '.woff2': 'font/woff2',
      '.eot': 'application/vnd.ms-fontobject',
      '.otf': 'font/otf'
    };
    const contentType = mimeTypes[extname] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
  }
}));

// Simpler catch-all route to handle missing files
app.use((req, res) => {
  // For root path, always send index.html
  if (req.path === '/') {
    return res.sendFile(path.join(__dirname, 'index.html'));
  }

  // For API requests that don't match a route, return 404 JSON
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      success: false,
      message: 'API endpoint not found'
    });
  }

  // For all other requests, try the exact file or fall back to index.html
  const filePath = path.join(__dirname, req.path);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    return res.sendFile(filePath);
  } else {
    // For client-side routing, send index.html
    return res.sendFile(path.join(__dirname, 'index.html'));
  }
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╭───────────────────────────────────────────────╮
│                                               │
│        Auric Jewelry E-Commerce Server        │
│                                               │
╰───────────────────────────────────────────────╯

✅ Server running at http://0.0.0.0:${PORT}/
📧 Email service ready using Nodemailer (${process.env.EMAIL_SERVICE || 'Not configured'})
🔒 Using secure authentication: ${process.env.EMAIL_USER ? 'Yes' : 'No'}

Available Routes:
- Static files: Serving from current directory
- POST /api/send-order-email : Send order confirmation emails
- POST /api/create-razorpay-order : Create a new Razorpay payment order
- POST /api/verify-razorpay-payment : Verify a Razorpay payment signature
- GET  /api/load-products/:category : Load products from Firebase Cloud Storage
- GET  /api/health : Health check endpoint

Press Ctrl+C to stop the server
`);
});
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const admin = require('firebase-admin');

const app = express();
const PORT = 5000;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Multer configuration for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    // Use service account from environment or file
    let serviceAccount;
    
    if (process.env.FIREBASE_PRIVATE_KEY) {
      serviceAccount = {
        type: 'service_account',
        project_id: 'auric-a0c92',
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: process.env.FIREBASE_CERT_URL
      };
    } else {
      // Fallback to service account file (you'll need to add this)
      console.log('Using default Firebase setup - environment variables not found');
      serviceAccount = require('./firebase-service-account.json');
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: 'auric-a0c92.firebasestorage.app'
    });

    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
  }
}

// Bandwidth test product upload endpoint
app.post('/upload-bandwidth-test-product', upload.single('productImage'), async (req, res) => {
  try {
    const { category, productName, productPrice, productDescription } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, error: 'No file provided' });
    }

    const bucket = admin.storage().bucket();
    const productId = `TEST-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    
    // Upload image with CDN headers
    const imageFileName = `${category}_${productId}_${Date.now()}.jpg`;
    const imageFile = bucket.file(`bandwidthTest/${imageFileName}`);
    
    const metadata = {
      cacheControl: 'public, max-age=2592000',
      contentType: file.mimetype,
      metadata: {
        testCategory: category,
        productId: productId,
        uploadedAt: new Date().toISOString()
      }
    };

    await imageFile.save(file.buffer, { metadata });
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

    // Save updated products JSON with CDN headers
    const jsonData = JSON.stringify(existingProducts, null, 2);
    const jsonFile = bucket.file(`bandwidthTest/${category}-products.json`);
    
    const jsonMetadata = {
      contentType: 'application/json',
      cacheControl: 'public, max-age=2592000',
      metadata: {
        testCategory: category,
        productsCount: existingProducts.length.toString(),
        lastUpdated: new Date().toISOString()
      }
    };

    await jsonFile.save(jsonData, { metadata: jsonMetadata });

    res.json({
      success: true,
      message: `Product "${productName}" uploaded successfully!`,
      productId: productId,
      category: category,
      totalProducts: existingProducts.length,
      imageUrl: imageUrl
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: `Upload failed: ${error.message}`
    });
  }
});

// Load bandwidth test products endpoint
app.get('/load-bandwidth-test-products', async (req, res) => {
  try {
    const category = req.query.category || 'bandwidth-test-1';
    const bucket = admin.storage().bucket();
    const jsonFile = bucket.file(`bandwidthTest/${category}-products.json`);
    
    const [exists] = await jsonFile.exists();
    
    if (!exists) {
      return res.json({ 
        success: true, 
        products: [],
        message: `No products found for category: ${category}`,
        fromCache: false
      });
    }

    const [fileContents] = await jsonFile.download();
    const products = JSON.parse(fileContents.toString());

    res.set({
      'Cache-Control': 'public, max-age=3600',
      'X-Data-Source': 'firebase-storage'
    });

    res.json({
      success: true,
      products: Array.isArray(products) ? products : [],
      category: category,
      fromCache: false,
      loadedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error loading bandwidth test products:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      products: []
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    firebase: admin.apps.length > 0 ? 'Connected' : 'Not Connected'
  });
});

// Serve static files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
  console.log(`Firebase Admin: ${admin.apps.length > 0 ? 'Connected' : 'Not Connected'}`);
});
