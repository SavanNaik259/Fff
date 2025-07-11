/**
 * Razorpay Debug Script
 * 
 * This script helps debug Razorpay integration issues by checking:
 * 1. If Razorpay SDK is loaded correctly
 * 2. If API endpoints are accessible
 * 3. If network calls to Razorpay functions are successful
 * 
 * Add to checkout.html: <script src="/razorpay-debug.js"></script>
 */

(function() {
  console.log('🔍 Razorpay Debug Script loaded');
  
  // Wait for DOM to be fully loaded
  document.addEventListener('DOMContentLoaded', function() {
    // 1. Check if Razorpay is loaded
    if (typeof Razorpay !== 'undefined') {
      console.log('✅ Razorpay SDK is loaded correctly');
    } else {
      console.error('❌ Razorpay SDK is NOT loaded. Check if the script src="https://checkout.razorpay.com/v1/checkout.js" is included');
    }
    
    // 2. Check Netlify Functions availability
    if (typeof window.netlifyHelpers !== 'undefined') {
      console.log('✅ Netlify helpers loaded correctly');
      console.log('   API Base URL:', window.netlifyHelpers.getApiBaseUrl());
      console.log('   Is Production:', window.netlifyHelpers.isProduction);
      
      // Test health endpoint through Netlify helper
      window.netlifyHelpers.callNetlifyFunction('health')
        .then(data => {
          console.log('✅ Health endpoint response:', data);
          
          // Check if Razorpay keys are configured
          if (data.razorpayConfig && data.razorpayConfig.key_id === 'Set') {
            console.log('✅ Razorpay API Key is configured on server');
          } else {
            console.error('❌ Razorpay API Key is NOT configured on server');
          }
        })
        .catch(error => {
          console.error('❌ Health endpoint error:', error);
        });
    } else {
      console.error('❌ Netlify helpers NOT loaded. Check if netlify-helpers.js is included');
    }
    
    // 3. Add button to test Razorpay order creation
    const debugContainer = document.createElement('div');
    debugContainer.style.position = 'fixed';
    debugContainer.style.bottom = '20px';
    debugContainer.style.right = '20px';
    debugContainer.style.padding = '10px';
    debugContainer.style.background = '#f0f0f0';
    debugContainer.style.border = '1px solid #ccc';
    debugContainer.style.borderRadius = '5px';
    debugContainer.style.zIndex = '9999';
    
    const heading = document.createElement('h4');
    heading.textContent = 'Razorpay Debug';
    heading.style.margin = '0 0 10px 0';
    
    const testButton = document.createElement('button');
    testButton.textContent = 'Test Razorpay Order Creation';
    testButton.style.padding = '8px 12px';
    testButton.style.cursor = 'pointer';
    
    testButton.addEventListener('click', function() {
      console.log('🔍 Testing Razorpay order creation...');
      
      // Make test request to create order
      window.netlifyHelpers.callNetlifyFunction('create-razorpay-order', {
        method: 'POST',
        body: JSON.stringify({
          amount: 1,  // Minimum amount (1 rupee)
          currency: 'INR',
          receipt: 'debug-test-' + Date.now(),
          notes: { debug: 'true' }
        })
      })
        .then(data => {
          console.log('✅ Test order created successfully:', data);
          
          // Show success in UI
          const resultDiv = document.createElement('div');
          resultDiv.textContent = 'Order created: ' + (data.order ? data.order.id : 'Unknown');
          resultDiv.style.marginTop = '10px';
          resultDiv.style.color = 'green';
          
          // Check if we already have a result display
          const existingResult = debugContainer.querySelector('.debug-result');
          if (existingResult) {
            debugContainer.removeChild(existingResult);
          }
          
          resultDiv.className = 'debug-result';
          debugContainer.appendChild(resultDiv);
        })
        .catch(error => {
          console.error('❌ Test order creation failed:', error);
          
          // Show error in UI
          const resultDiv = document.createElement('div');
          resultDiv.textContent = 'Error: ' + error.message;
          resultDiv.style.marginTop = '10px';
          resultDiv.style.color = 'red';
          
          // Check if we already have a result display
          const existingResult = debugContainer.querySelector('.debug-result');
          if (existingResult) {
            debugContainer.removeChild(existingResult);
          }
          
          resultDiv.className = 'debug-result';
          debugContainer.appendChild(resultDiv);
        });
    });
    
    // Close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.style.padding = '8px 12px';
    closeButton.style.marginLeft = '10px';
    closeButton.style.cursor = 'pointer';
    
    closeButton.addEventListener('click', function() {
      document.body.removeChild(debugContainer);
    });
    
    // Assemble the debug container
    debugContainer.appendChild(heading);
    debugContainer.appendChild(testButton);
    debugContainer.appendChild(closeButton);
    
    // Add to document
    document.body.appendChild(debugContainer);
  });
})();