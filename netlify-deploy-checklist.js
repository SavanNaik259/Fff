/**
 * Netlify Deploy Checklist
 * 
 * This script checks common issues with Netlify deployments of the Auric Jewelry site.
 * Add this script to your HTML before deploying to diagnose and fix problems.
 * 
 * Usage: <script src="/netlify-deploy-checklist.js"></script>
 */

(function() {
  console.log('🔍 Running Netlify deployment checklist...');
  
  document.addEventListener('DOMContentLoaded', function() {
    let checksPassed = 0;
    let checksFailed = 0;
    const totalChecks = 5;
    
    // Create status display
    const statusContainer = document.createElement('div');
    statusContainer.style.position = 'fixed';
    statusContainer.style.bottom = '10px';
    statusContainer.style.left = '10px';
    statusContainer.style.padding = '10px';
    statusContainer.style.background = '#f0f0f0';
    statusContainer.style.border = '1px solid #ccc';
    statusContainer.style.borderRadius = '5px';
    statusContainer.style.zIndex = '9999';
    statusContainer.style.maxWidth = '300px';
    statusContainer.style.fontSize = '12px';
    statusContainer.style.fontFamily = 'monospace';
    
    const statusTitle = document.createElement('h4');
    statusTitle.textContent = 'Netlify Deploy Checklist';
    statusTitle.style.margin = '0 0 5px 0';
    statusTitle.style.fontSize = '14px';
    
    const statusList = document.createElement('ul');
    statusList.style.margin = '0';
    statusList.style.padding = '0 0 0 20px';
    
    // Close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.style.padding = '2px 5px';
    closeButton.style.marginTop = '5px';
    closeButton.style.fontSize = '10px';
    
    closeButton.addEventListener('click', function() {
      document.body.removeChild(statusContainer);
    });
    
    // Add to document
    statusContainer.appendChild(statusTitle);
    statusContainer.appendChild(statusList);
    statusContainer.appendChild(closeButton);
    document.body.appendChild(statusContainer);
    
    // Update status display
    function addStatus(message, passed, details = '') {
      const item = document.createElement('li');
      item.style.marginBottom = '5px';
      if (passed) {
        item.style.color = 'green';
        item.innerHTML = '✅ ' + message;
        checksPassed++;
      } else {
        item.style.color = 'red';
        item.innerHTML = '❌ ' + message;
        checksFailed++;
      }
      
      if (details) {
        const detailsElem = document.createElement('div');
        detailsElem.style.fontSize = '10px';
        detailsElem.style.color = '#666';
        detailsElem.style.marginLeft = '15px';
        detailsElem.textContent = details;
        item.appendChild(detailsElem);
      }
      
      statusList.appendChild(item);
      
      // Update summary
      const summary = document.createElement('div');
      summary.style.marginTop = '10px';
      summary.style.borderTop = '1px solid #ccc';
      summary.style.paddingTop = '5px';
      summary.innerHTML = `${checksPassed}/${totalChecks} checks passed`;
      
      // Replace existing summary if it exists
      const existingSummary = statusContainer.querySelector('.summary');
      if (existingSummary) {
        statusContainer.removeChild(existingSummary);
      }
      
      summary.className = 'summary';
      statusContainer.insertBefore(summary, closeButton);
    }
    
    // Check 1: Verify Netlify environment detection
    if (typeof window.netlifyHelpers !== 'undefined' && window.netlifyHelpers.isProduction) {
      addStatus('Netlify environment detected', true);
    } else {
      addStatus('Netlify environment not detected', false, 
               'Make sure netlify-helpers.js is included and working properly');
    }
    
    // Check 2: Verify Razorpay SDK is loaded
    if (typeof Razorpay !== 'undefined') {
      addStatus('Razorpay SDK loaded', true);
    } else {
      addStatus('Razorpay SDK not loaded', false, 
               'Make sure checkout.razorpay.com/v1/checkout.js is included in the document');
    }
    
    // Check 3: Check API endpoint availability
    const apiTest = async () => {
      try {
        // Test if Netlify Functions are accessible
        const testEndpoint = '/.netlify/functions/health';
        const response = await fetch(testEndpoint);
        
        if (response.ok) {
          const data = await response.json();
          const razorpayConfigured = data.razorpayConfig && 
                                    data.razorpayConfig.key_id === 'Set' && 
                                    data.razorpayConfig.key_secret === 'Set';
          
          if (razorpayConfigured) {
            addStatus('Razorpay API keys configured', true);
          } else {
            addStatus('Razorpay API keys not configured', false,
                     'Make sure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables are set in Netlify');
          }
          
          addStatus('Netlify Functions accessible', true);
        } else {
          addStatus('Netlify Functions not accessible', false,
                   `Failed to access ${testEndpoint}: ${response.status} ${response.statusText}`);
          
          // Automatically add Razorpay check as failed
          addStatus('Razorpay API keys status unknown', false, 
                   'Cannot check Razorpay configuration because health endpoint is not accessible');
        }
      } catch (error) {
        addStatus('Netlify Functions error', false, 
                 `Error accessing functions: ${error.message}`);
        
        // Automatically add Razorpay check as failed
        addStatus('Razorpay API keys status unknown', false, 
                 'Cannot check Razorpay configuration because health endpoint is not accessible');
      }
    };
    
    // Check 4: Validate checkout script has the correct Razorpay implementation
    if (typeof window.processRazorpayPayment === 'function') {
      // This is a simplistic check - just checking if the function exists
      addStatus('Checkout script loaded with Razorpay handler', true);
    } else {
      // Check for the script
      const scripts = document.querySelectorAll('script');
      let checkoutScriptFound = false;
      
      for (const script of scripts) {
        if (script.src && script.src.includes('checkout-script')) {
          checkoutScriptFound = true;
          break;
        }
      }
      
      if (checkoutScriptFound) {
        addStatus('Checkout script loaded but Razorpay handler not found', false,
                 'The script is loaded but processRazorpayPayment function is not accessible');
      } else {
        addStatus('Checkout script not found', false,
                 'Make sure checkout-script-simplified.js is included in the document');
      }
    }
    
    // Run async tests
    apiTest();
  });
})();