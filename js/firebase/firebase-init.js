/**
 * Firebase Initialization Module
 * 
 * This module ensures Firebase is properly initialized before any Firebase operations.
 * It handles both automatic initialization and manual initialization with retry capability.
 */

// Create a global FirebaseInit object
window.FirebaseInit = (function() {
  let initialized = false;
  let initAttempts = 0;
  const MAX_INIT_ATTEMPTS = 3;
  
  /**
   * Initialize Firebase if not already initialized
   * @param {boolean} forceNew - Force a new initialization even if Firebase is already initialized
   * @returns {boolean} - Success status
   */
  function initFirebase(forceNew = false) {
    if (!window.firebase) {
      console.error('Firebase SDK not found. Make sure Firebase scripts are loaded.');
      return false;
    }
    
    if (initialized && !forceNew) {
      console.log('Firebase already initialized, skipping initialization');
      return true;
    }
    
    try {
      // Check if Firebase is already initialized
      try {
        const app = firebase.app();
        console.log('Firebase already initialized by another module');
        initialized = true;
        return true;
      } catch (appError) {
        // If app/no-app error, initialize Firebase
        if (appError.code === 'app-compat/no-app') {
          console.log('No Firebase app found, initializing now');
          
          // Check if firebaseConfig is available
          if (typeof firebaseConfig === 'undefined') {
            console.error('Firebase config not found. Make sure firebaseConfig is defined.');
            return false;
          }
          
          // Initialize Firebase with config
          firebase.initializeApp(firebaseConfig);
          
          // Enable persistence for auth
          try {
            firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
          } catch (persistenceError) {
            console.warn('Could not set persistence:', persistenceError);
            // Non-critical error, continue
          }
          
          initialized = true;
          console.log('Firebase initialized successfully');
          return true;
        } else {
          // If it's some other error, rethrow
          throw appError;
        }
      }
    } catch (error) {
      // Handle initialization errors
      console.error('Firebase initialization error:', error);
      initAttempts++;
      
      if (initAttempts < MAX_INIT_ATTEMPTS) {
        console.log(`Firebase init failed, will retry (attempt ${initAttempts})`);
      } else {
        console.error(`Firebase initialization failed after ${MAX_INIT_ATTEMPTS} attempts`);
      }
      
      return false;
    }
  }
  
  /**
   * Reset the initialization state and attempt counter
   */
  function resetState() {
    initialized = false;
    initAttempts = 0;
  }
  
  /**
   * Check if Firebase is initialized
   * @returns {boolean} - Whether Firebase is initialized
   */
  function isInitialized() {
    return initialized;
  }
  
  /**
   * Get the current init attempt count
   * @returns {number} - Current initialization attempt count
   */
  function getAttemptCount() {
    return initAttempts;
  }
  
  // Attempt initialization when script loads
  // This makes it work automatically on any page that includes this script
  initFirebase();
  
  // Return public API
  return {
    initFirebase,
    resetState,
    isInitialized,
    getAttemptCount
  };
})();