/**
 * Debug Netlify Functions
 * Add this script temporarily to your HTML pages to debug API calls
 * 
 * Instructions:
 * 1. Add <script src="/debug-endpoints.js"></script> to your checkout.html
 * 2. Deploy your site with this file
 * 3. Open your site and check the console for API call debugging info
 */

(function() {
  console.log('Debug script loaded for Netlify Functions');
  
  // 1. Check if Netlify Helpers are loaded
  if (typeof window.netlifyHelpers !== 'undefined') {
    console.log('✅ Netlify helpers loaded correctly');
    console.log('API Base URL:', window.netlifyHelpers.getApiBaseUrl());
    console.log('Is Production Environment:', window.netlifyHelpers.isProduction);
  } else {
    console.error('❌ Netlify helpers NOT loaded. Check if netlify-helpers.js is included before this script');
  }
  
  // 2. Test direct API calls to functions
  const testEndpoints = async () => {
    const endpoints = ['health', 'create-razorpay-order', 'send-order-email'];
    
    console.log('Testing API endpoints directly...');
    
    // Test health endpoint directly
    try {
      const response = await fetch('/.netlify/functions/health');
      const data = await response.json();
      console.log('✅ Health endpoint response:', data);
    } catch (error) {
      console.error('❌ Health endpoint error:', error);
    }
    
    // Log all endpoints for manual testing
    console.log('Manual testing URLs:');
    endpoints.forEach(endpoint => {
      console.log(`- ${window.location.origin}/.netlify/functions/${endpoint}`);
    });
  };
  
  // 3. Monitor network requests to detect API calls
  if (window.netlifyHelpers) {
    // Save original function
    const originalCallFunction = window.netlifyHelpers.callNetlifyFunction;
    
    // Replace with monitored version
    window.netlifyHelpers.callNetlifyFunction = function(endpoint, options = {}) {
      console.log('🔍 Calling Netlify Function:', endpoint);
      console.log('  With options:', JSON.stringify(options, null, 2));
      
      return originalCallFunction(endpoint, options)
        .then(result => {
          console.log('✅ API call succeeded:', endpoint);
          console.log('  Result:', result);
          return result;
        })
        .catch(error => {
          console.error('❌ API call failed:', endpoint);
          console.error('  Error:', error);
          throw error;
        });
    };
    
    console.log('💡 API call monitoring enabled');
  }
  
  // Run the tests when page is loaded
  if (document.readyState === 'complete') {
    testEndpoints();
  } else {
    window.addEventListener('load', testEndpoints);
  }
})();