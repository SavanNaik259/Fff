# Netlify Deployment Guide for Auric Jewelry

This guide explains how to deploy the Auric Jewelry E-commerce website on Netlify with serverless functions.

## Prerequisites

1. A Netlify account (sign up at [netlify.com](https://www.netlify.com))
2. A GitHub repository with your project code
3. Razorpay account (for payment processing)
4. Email account for sending order confirmations

## Deployment Steps

### 1. Push Your Code to GitHub

Make sure your project code is pushed to a GitHub repository. Netlify will deploy from this source.

### 2. Connect to Netlify

1. Log in to your Netlify account
2. Click "New site from Git"
3. Choose GitHub as your Git provider
4. Authorize Netlify to access your GitHub account
5. Select your Auric Jewelry repository

### 3. Configure Build Settings

On the Netlify deployment configuration screen:

- **Branch to deploy**: `main` (or your preferred branch)
- **Build command**: Leave empty (as specified in netlify.toml)
- **Publish directory**: `.` (the root directory, as specified in netlify.toml)

### 4. Configure Environment Variables

After the initial deployment, go to Site settings > Environment variables, and add the following variables from your `.env.example` file:

- `EMAIL_SERVICE` (e.g., gmail)
- `EMAIL_USER` (your email address)
- `EMAIL_PASS` (your email account password or app password)
- `EMAIL_SECURE` (true)
- `OWNER_EMAIL` (store owner's email)
- `RAZORPAY_KEY_ID` (from your Razorpay dashboard)
- `RAZORPAY_KEY_SECRET` (from your Razorpay dashboard)

### 5. Deploy the Site

Click "Deploy site" and wait for the deployment to complete.

## Testing After Deployment

1. Once deployed, open your site URL (e.g., `your-site-name.netlify.app`)
2. Test the health check endpoint: `your-site-name.netlify.app/.netlify/functions/health`
3. Navigate to the checkout page and test the complete order flow

## Troubleshooting

### Common Issues and Solutions

#### 1. Netlify Functions Not Working (Order Email and Razorpay)

If your order confirmation emails and Razorpay integration aren't working:

1. **Check Function Logs**: In the Netlify dashboard, go to Functions > Logs to see detailed error messages
2. **Verify Environment Variables**: Make sure all environment variables are correctly set:
   - Go to Site settings > Environment variables
   - Verify EMAIL_USER, EMAIL_PASS, EMAIL_SERVICE, OWNER_EMAIL, RAZORPAY_KEY_ID, and RAZORPAY_KEY_SECRET are all set
   - Consider reimporting your .env file using the "Import from .env file" option

3. **Dependencies Installation**: Ensure your function dependencies are being installed:
   - Verify the build command in netlify.toml is correctly set to `cd netlify/functions && npm install`
   - Check build logs to confirm dependencies are installing
   - If needed, manually install dependencies by going to the Netlify dashboard > Deploys > Trigger deploy > Clear cache and deploy site

4. **CORS Issues**: If you're seeing CORS errors in the browser console:
   - Confirm your Netlify Functions have proper CORS headers
   - Try accessing the functions directly by visiting `your-site.netlify.app/.netlify/functions/health`

5. **Function Path Issues**: If your frontend can't find the functions:
   - Make sure netlify-helpers.js is using the correct path (/.netlify/functions)
   - Test function URLs directly in the browser
   - Check network tab in browser dev tools for 404 errors

#### 2. Specific Fixes for Current Deployment

If you continue to have issues with your current-demo.netlify.app deployment:

1. **Redeploy with Updated Code**: The changes we've made to improve error handling and fix path issues should resolve most problems
2. **Check Function Execution**: In the Netlify dashboard, check if your functions are being called (Functions > Invocations)
3. **Test Direct Function URLs**:
   - Test health endpoint: https://current-demo.netlify.app/.netlify/functions/health
   - If health check works but other functions don't, the issue is in the function implementation
4. **Clear Browser Cache**: Have users clear their browser cache when testing

## Additional Configuration

### Custom Domain

To use a custom domain:

1. Go to Site settings > Domain management
2. Click "Add custom domain"
3. Follow the instructions to configure your DNS settings

### Function Optimization

For better performance:

1. Consider using Netlify's Edge Functions for location-based optimizations
2. Implement caching strategies for frequently accessed data

## Resources

- [Netlify Functions Documentation](https://docs.netlify.com/functions/overview/)
- [Environment Variables in Netlify](https://docs.netlify.com/configure-builds/environment-variables/)
- [Troubleshooting Netlify Functions](https://docs.netlify.com/functions/debugging/)
- [Razorpay Integration Documentation](https://razorpay.com/docs/)