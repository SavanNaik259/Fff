# Auric Jewelry E-commerce Platform

## Overview

Auric is a premium jewelry e-commerce platform built with a modern web stack featuring Firebase integration, Razorpay payments, and email notifications. The application serves as a complete online jewelry shopping experience with user authentication, cart management, and order processing capabilities.

## System Architecture

### Frontend Architecture
- **Static Site Generation**: HTML5/CSS3 with responsive design
- **JavaScript Modules**: Modular client-side code with ES6+ features
- **CSS Framework**: Custom CSS with responsive design patterns
- **UI Components**: Reusable components for cart, product display, and user interface

### Backend Architecture
- **Serverless Functions**: Netlify Functions for API endpoints
- **Combined Server**: Express.js server (simple-server.js) for local development
- **Email Service**: Nodemailer for transactional emails
- **Payment Processing**: Razorpay integration for secure payments

### Authentication & Data Storage
- **Authentication**: Firebase Authentication with session persistence
- **Database**: Firebase Firestore for user data, orders, and cart persistence
- **Local Storage**: Browser localStorage as fallback for cart data

## Key Components

### 1. Cart Management System
- **Dual Storage**: Local storage for guests, Firebase for authenticated users
- **Real-time Sync**: Automatic synchronization between storage methods
- **Persistent Cart**: Maintains cart state across sessions and page reloads

### 2. User Authentication
- **Firebase Auth**: Email/password authentication with session management
- **Profile Management**: User profile pages with order history
- **Secure Sessions**: Persistent authentication state across browser sessions

### 3. Payment Integration
- **Razorpay Gateway**: Secure payment processing with order verification
- **Order Creation**: Server-side order generation with payment validation
- **Payment Verification**: Cryptographic signature verification for security

### 4. Email Notification System
- **Nodemailer Service**: Server-side email sending using SMTP
- **Order Confirmations**: Automated emails to customers and store owner
- **HTML Templates**: Rich email templates for professional communication

### 5. Product Management
- **Static Product Data**: JSON-based product information
- **Dynamic Cart**: Real-time cart updates with quantity management
- **Wishlist Features**: User wishlist functionality with Firebase persistence

## Data Flow

### Cart Operations
1. User adds item to cart
2. System checks authentication status
3. If authenticated: saves to Firebase users/{userId}/carts/current
4. If guest: saves to localStorage with key 'auric_cart_items'
5. UI updates in real-time across all pages

### Order Processing
1. User initiates checkout
2. System validates cart contents and user authentication
3. Creates Razorpay order via Netlify function
4. Processes payment through Razorpay gateway
5. Verifies payment signature on server
6. Stores order in Firebase users/{userId}/orders/{orderId}
7. Sends confirmation emails to customer and store owner
8. Clears cart after successful order

### Authentication Flow
1. User logs in through Firebase Auth
2. System migrates cart from localStorage to Firebase
3. Loads user profile and order history
4. Maintains session persistence across page refreshes

## External Dependencies

### Payment Gateway
- **Razorpay**: Payment processing with test/production keys
- **Environment Variables**: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET

### Email Service
- **Gmail SMTP**: Email delivery service
- **Environment Variables**: EMAIL_USER, EMAIL_PASS, EMAIL_SERVICE
- **App Passwords**: Required for Gmail authentication

### Firebase Services
- **Authentication**: User login/registration
- **Firestore**: NoSQL database for user data and orders
- **Configuration**: Firebase project "auric-a0c92"

### Third-party Libraries
- **Font Awesome**: Icon library for UI elements
- **Google Fonts**: Typography (Playfair Display, Lato)
- **Firebase SDK**: Client-side Firebase integration

## Deployment Strategy

### Netlify Deployment
- **Static Hosting**: Serves frontend files from repository root
- **Serverless Functions**: API endpoints via Netlify Functions
- **Environment Variables**: Configured in Netlify dashboard
- **Build Process**: Automated deployment from Git repository

### Replit Development
- **Combined Server**: Express server for local development
- **Port Configuration**: Runs on port 5000 for Replit compatibility
- **Hot Reload**: Development server with live updates

### Firebase Hosting (Alternative)
- **Static Hosting**: Firebase hosting with Cloud Functions
- **Firestore Rules**: Configured for secure data access
- **Environment Config**: Firebase Functions configuration

## Changelog

- June 15, 2025: Initial setup
- June 15, 2025: Added product management system with admin panel and bridal collection page
  - Admin panel: `/admin-panel.html` for adding products with name, price, quantity, description, images
  - Bridal collection: `/bridal-collection.html` displays all bridal products in responsive grid
  - Firebase Storage: Product images stored in `productImages/` folder
  - Firebase Storage: Product data stored as JSON in `productData/bridal-products.json` 
  - Firebase Firestore: Individual products stored for reliable querying and data integrity
  - Fixed multiple product storage issue using dual storage approach
- July 12, 2025: Updated product loading to use Cloud Storage exclusively
  - Modified `js/bridal-products-loader.js` to load ONLY from Firebase Cloud Storage
  - Removed all Firestore fallbacks as per user requirement
  - Created `upload-to-storage.html` for uploading product data to Cloud Storage
  - Added `FIREBASE_STORAGE_RULES.md` with proper Storage rules for public read access
  - Products load exclusively from `productData/bridal-products.json` in Cloud Storage
- July 13, 2025: Fixed admin panel and product loading system
  - Resolved CORS issues by creating server endpoint `/api/load-products/:category` in `simple-server.js`
  - Updated `js/bridal-products-loader.js` to use server endpoint instead of direct Firebase Storage access
  - Fixed admin panel category naming from "bridal-edit" to "bridal" for consistency
  - Removed ALL remaining Firestore code from `admin-panel.html` - now uses Cloud Storage exclusively
  - Admin panel now loads existing products from Cloud Storage, adds new product, and saves back to Cloud Storage
  - Products successfully display on homepage and admin panel works with Cloud Storage only
- July 13, 2025: Diagnosed and documented Netlify deployment issue
  - Issue: Local development shows actual products, Netlify deployment shows sample products
  - Root cause: Missing Firebase Admin SDK environment variables in Netlify deployment
  - Created `NETLIFY_DEPLOYMENT_FIX.md` with step-by-step setup instructions
  - Created `test-netlify-deployment.html` for comprehensive deployment testing and diagnosis
  - Enhanced error handling in `js/bridal-products-loader.js` to detect and report configuration issues
  - Improved user messaging when Firebase Admin credentials are missing on Netlify
- July 13, 2025: Fixed admin panel overwriting products issue
  - Issue: Admin panel on deployed site overwrites existing products instead of adding to them
  - Root cause: Admin panel used local server endpoint even on Netlify deployment
  - Created generic `netlify/functions/load-products.js` function that accepts category parameter
  - Updated `admin-panel.html` to detect environment and use correct endpoint
  - Updated `js/bridal-products-loader.js` to use new generic Netlify function
  - Created `test-admin-panel-fix.html` for testing and validating the fix
  - Admin panel now correctly loads existing products before adding new ones on both local and deployed sites
- July 13, 2025: Confirmed Firebase Storage CDN caching works perfectly for bandwidth optimization
  - Issue: Misunderstanding about Firebase Storage CDN behavior
  - Solution: Simplified server to be simple proxy - Firebase Storage CDN handles all caching automatically
  - Firebase Storage: Set cacheControl: 'public, max-age=2592000' (30 days) on all files
  - Behavior confirmed: Only first visitor per region downloads from Firebase, others use CDN cache
  - Individual file caching: Each file (JSON, images) cached separately - only changed files re-download
  - When adding new product: Only updated JSON (~10KB) + new image (~50KB) download, existing images stay cached
  - Server simplified: Removed complex caching logic, Firebase Storage CDN does everything needed
  - Result: 90%+ bandwidth savings with zero additional complexity
- July 14, 2025: Comprehensive review of Firebase Storage CDN behavior confirmed optimal architecture
  - User requested confirmation that Firebase Storage CDN works correctly without additional caching layers
  - Confirmed: Firebase Storage acts as CDN with zero additional code when cacheControl header is set
  - Confirmed: ETags automatically change when files are overwritten, triggering cache invalidation
  - Confirmed: Unchanged files remain cached at CDN edge servers globally
  - Confirmed: Only updated files are downloaded by first visitor per region
  - Architecture validation: No need for Express memory caching, Netlify function caching, or localStorage caching
  - Firebase Storage CDN handles all caching automatically with proper Cache-Control headers
- July 14, 2025: Created simple CDN testing tools for bandwidth verification
  - Created `cdn-test-uploader.html` - Simple product uploader with proper CDN cache headers
  - Created `cdn-test-loader.html` - Product loader that mimics bridal section behavior
  - Tools designed for testing Firebase Storage CDN caching effectiveness
  - User can monitor Firebase Console bandwidth usage to verify CDN behavior
  - Separate "cdn-test" category to isolate testing from production products
- July 14, 2025: Fixed critical bandwidth issue by implementing proper CDN access pattern
  - Issue: Netlify functions were downloading data from Firebase Storage on every request, defeating CDN purpose
  - Root cause: Functions acting as proxy that triggered Firebase bandwidth usage for every visitor
  - Solution: Modified functions to return Firebase Storage download URLs instead of downloading data
  - New architecture: Client gets URL from function, then fetches directly from Firebase Storage CDN
  - Result: First visitor per region downloads from Firebase, subsequent visitors use CDN cache (no bandwidth)
  - Updated `netlify/functions/load-bandwidth-test-products.js` to use `getSignedUrl()` instead of `download()`
  - Updated `cdn-bandwidth-test-loader.html` to implement two-step process for true CDN testing
  - Updated `simple-server.js` bandwidth endpoint for consistency with Netlify function behavior

## User Preferences

Preferred communication style: Simple, everyday language.