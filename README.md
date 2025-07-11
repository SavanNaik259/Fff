# Auric Jewelry E-commerce Platform

A premium e-commerce platform for Auric, delivering a sophisticated online jewelry shopping experience with advanced user engagement and secure transaction capabilities.

## Technologies

- **Frontend**: HTML5/CSS3 with responsive design
- **Authentication**: Firebase Authentication
- **Database**: Firestore for data persistence
- **Payments**: Razorpay Payment Gateway
- **Notifications**: Nodemailer for email confirmations
- **Backend**: Netlify Functions (serverless)
- **Special Features**: Multi-page cart, wishlist management, local and Firebase storage integration

## Project Structure

- `/` - Main website files (HTML, CSS, JavaScript)
- `/css` - Stylesheets
- `/js` - JavaScript files
- `/images` - Image assets
- `/netlify/functions` - Serverless functions for API endpoints
  - `/netlify/functions/send-order-email` - Email sending function
  - `/netlify/functions/create-razorpay-order` - Razorpay order creation
  - `/netlify/functions/verify-razorpay-payment` - Payment verification
  - `/netlify/functions/health` - Health check endpoint
  - `/netlify/functions/utils` - Shared utilities

## Deployment

This project is configured for deployment on Netlify using the static site hosting + Netlify Functions approach.

See `NETLIFY_DEPLOYMENT.md` for detailed deployment instructions.

## Environment Variables

Required environment variables (configure in Netlify dashboard):

- `EMAIL_SERVICE` - Email service provider (e.g., gmail)
- `EMAIL_USER` - Email username
- `EMAIL_PASS` - Email password
- `EMAIL_SECURE` - Whether to use secure connection
- `OWNER_EMAIL` - Store owner email for notifications
- `RAZORPAY_KEY_ID` - Razorpay API key
- `RAZORPAY_KEY_SECRET` - Razorpay secret key

## Local Development

To run the project locally:

1. Clone the repository
2. Copy `.env.example` to `.env` and fill in your credentials
3. Install dependencies using npm
4. Run the local development server: `node simple-server.js`

## Netlify Functions vs Express Server

The project has been configured for both approaches:

- **Simple Express Server** (`simple-server.js`): Used for local development
- **Netlify Functions** (`netlify/functions/`): Used for production deployment

The frontend automatically detects which environment it's running in and uses the appropriate endpoints.

## License

All rights reserved.