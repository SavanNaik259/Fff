/**
 * Global Error Handler for Auric
 * 
 * This module provides global error handling for uncaught exceptions and unhandled promise rejections.
 * It helps identify and log errors that might otherwise be silently failing in the console.
 */

// Self-executing function to create scoped handler
(function() {
    // Handler for uncaught exceptions
    window.addEventListener('error', function(event) {
        console.error('Global error caught:', event.error);
        
        // Log additional details if available
        if (event.filename) {
            console.error(`Error occurred in file: ${event.filename}, line: ${event.lineno}, column: ${event.colno}`);
        }
        
        // Prevent error from bubbling up (optional)
        // event.preventDefault();
    });
    
    // Handler for unhandled promise rejections
    window.addEventListener('unhandledrejection', function(event) {
        // Log the promise rejection reason
        console.error('Unhandled Promise Rejection:', event.reason);
        
        // Add additional debugging context
        if (event.reason && event.reason.stack) {
            console.error('Rejection stack:', event.reason.stack);
        }
        
        // Optional: identify the source of the rejection if possible
        console.error('Promise rejection source information:', {
            firebase: typeof firebase !== 'undefined',
            firestore: typeof firebase !== 'undefined' && typeof firebase.firestore === 'function',
            auth: typeof firebase !== 'undefined' && typeof firebase.auth === 'function'
        });
        
        // Prevent the error from showing in the console (optional)
        // event.preventDefault();
    });
    
    // Log that error handler is initialized
    console.log('Global error and promise rejection handlers initialized');
})();