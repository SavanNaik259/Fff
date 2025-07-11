/**
 * Auric Firebase Cart Manager
 * 
 * This module handles cart functionality using Firebase Firestore
 * Cart data is stored at path: users/{userId}/carts/current
 * It's used when the user is logged in
 */

// Firebase Cart Manager using IIFE pattern
const FirebaseCartManager = (function() {
    // Constants
    const CART_COLLECTION = 'carts';
    const CURRENT_CART_DOC = 'current';
    
    // Private variables
    let db;
    let auth;
    let isInitialized = false;
    
    /**
     * Initialize the Firebase cart manager
     * @returns {Boolean} Success status
     */
    function init() {
        try {
            // Check if Firebase is available
            if (typeof firebase === 'undefined') {
                console.warn('Firebase not available, cannot initialize FirebaseCartManager');
                return false;
            }
            
            // Initialize Firebase references
            db = firebase.firestore();
            auth = firebase.auth();
            isInitialized = true;
            
            console.log('Firebase Cart Manager initialized');
            return true;
        } catch (error) {
            console.error('Error initializing Firebase Cart Manager:', error);
            return false;
        }
    }
    
    /**
     * Check if a user is currently logged in
     * @returns {Boolean} True if user is logged in, false otherwise
     */
    function isUserLoggedIn() {
        return isInitialized && auth.currentUser !== null;
    }
    
    /**
     * Get the current user's ID if logged in
     * @returns {String|null} User ID or null if not logged in
     */
    function getCurrentUserId() {
        if (!isUserLoggedIn()) return null;
        return auth.currentUser.uid;
    }
    
    /**
     * Get reference to user's current cart document
     * @returns {Object|null} Firestore document reference or null if not logged in
     */
    function getCurrentCartRef() {
        const userId = getCurrentUserId();
        if (!userId) return null;
        
        return db.collection('users')
            .doc(userId)
            .collection(CART_COLLECTION)
            .doc(CURRENT_CART_DOC);
    }
    
    /**
     * Load cart items from Firebase
     * @returns {Promise<Object>} Cart items and success status
     */
    async function getItems() {
        try {
            if (!isUserLoggedIn()) {
                return { success: false, items: [], error: 'User not logged in' };
            }
            
            const cartRef = getCurrentCartRef();
            console.log('Loading cart from Firebase path:', cartRef.path);
            
            try {
                // Set a timeout to detect if Firebase is too slow (offline mode)
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('Firebase timeout - likely offline')), 5000);
                });
                
                // Race between Firebase request and timeout
                let cartDoc;
                try {
                    cartDoc = await Promise.race([
                        cartRef.get(),
                        timeoutPromise
                    ]);
                } catch (raceError) {
                    console.warn('Firebase operation timed out:', raceError);
                    throw raceError; // Re-throw for the outer catch block to handle
                }
                
                if (cartDoc.exists) {
                    const cartData = cartDoc.data();
                    
                    // Make sure items array exists
                    if (cartData.items && Array.isArray(cartData.items)) {
                        console.log('Found', cartData.items.length, 'items in Firebase cart');
                        return { success: true, items: cartData.items };
                    } else {
                        console.warn('Firebase cart document exists but items array is missing or invalid');
                        return { success: true, items: [] };
                    }
                } else {
                    console.log('No existing cart in Firebase - document does not exist');
                    return { success: true, items: [] };
                }
            } catch (timeoutError) {
                console.warn('Firebase operation timed out or network is offline');
                
                // Get last known cart from session storage if available
                try {
                    const cachedCart = sessionStorage.getItem('firebase_cart_cache');
                    if (cachedCart) {
                        const parsedCart = JSON.parse(cachedCart);
                        console.log('Using cached cart data from session storage:', parsedCart.length, 'items');
                        return { success: true, items: parsedCart, fromCache: true };
                    }
                } catch (cacheError) {
                    console.error('Error accessing cache:', cacheError);
                }
                
                return { success: false, items: [], error: 'Firebase is offline, no cached data available' };
            }
        } catch (error) {
            console.error('Error loading cart from Firebase:', error);
            return { success: false, items: [], error: error.message };
        }
    }
    
    /**
     * Save cart items to Firebase
     * @param {Array} items - Array of cart items to save
     * @returns {Promise<Object>} Success status and any error message
     */
    async function saveItems(items) {
        try {
            if (!isUserLoggedIn()) {
                return { success: false, error: 'User not logged in' };
            }
            
            // Save a cache copy in sessionStorage for offline fallback
            try {
                sessionStorage.setItem('firebase_cart_cache', JSON.stringify(items));
                console.log('Saved cart cache to sessionStorage');
            } catch (cacheError) {
                console.warn('Failed to cache cart in sessionStorage:', cacheError);
            }
            
            const cartRef = getCurrentCartRef();
            console.log('Saving cart to Firebase path:', cartRef.path);
            console.log('Cart items being saved:', items.length, 'items');
            
            try {
                // Set a timeout for Firebase operations
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('Firebase save timeout - likely offline')), 5000);
                });
                
                // Race between Firebase save and timeout
                await Promise.race([
                    cartRef.set({
                        items: items,
                        updatedAt: firebase.firestore.Timestamp.now(),
                        userId: getCurrentUserId()
                    }),
                    timeoutPromise
                ]);
                
                console.log('Cart saved to Firebase successfully');
                return { success: true };
            } catch (timeoutError) {
                console.warn('Firebase save operation timed out or network is offline');
                console.log('Using cached cart data instead');
                
                // Return success but with an offline flag
                // The cart is saved in sessionStorage, so data isn't lost
                return { 
                    success: true, 
                    offline: true, 
                    message: 'Cart saved locally, will sync when online'
                };
            }
        } catch (error) {
            console.error('Error saving cart to Firebase:', error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Add a product to the cart
     * If the product already exists, update its quantity
     * @param {Object} product - Product to add
     * @param {Number} quantity - Quantity to add (default: 1)
     * @returns {Promise<Object>} Success status
     */
    async function addItem(product, quantity = 1) {
        try {
            if (!isUserLoggedIn()) {
                return { success: false, error: 'User not logged in' };
            }
            
            const result = await getItems();
            let cartItems = result.items || [];
            
            // Check if item already exists
            const existingItemIndex = cartItems.findIndex(item => item.id === product.id);
            
            if (existingItemIndex >= 0) {
                // Update quantity if item exists
                cartItems[existingItemIndex].quantity += quantity;
            } else {
                // Add new item
                cartItems.push({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    quantity: quantity
                });
            }
            
            // Save updated cart back to Firebase
            return await saveItems(cartItems);
        } catch (error) {
            console.error('Error adding item to Firebase cart:', error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Update quantity of an item in the cart
     * @param {String} productId - ID of product to update
     * @param {Number} newQuantity - New quantity (must be > 0)
     * @returns {Promise<Object>} Success status
     */
    async function updateItemQuantity(productId, newQuantity) {
        try {
            if (!isUserLoggedIn()) {
                return { success: false, error: 'User not logged in' };
            }
            
            // Ensure quantity is at least 1
            const quantity = Math.max(1, newQuantity);
            
            const result = await getItems();
            let cartItems = result.items || [];
            
            // Find item and update quantity
            const itemIndex = cartItems.findIndex(item => item.id === productId);
            
            if (itemIndex !== -1) {
                cartItems[itemIndex].quantity = quantity;
                return await saveItems(cartItems);
            } else {
                return { success: false, error: 'Item not found in cart' };
            }
        } catch (error) {
            console.error('Error updating quantity in Firebase cart:', error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Remove an item from the cart
     * @param {String} productId - ID of product to remove
     * @returns {Promise<Object>} Success status
     */
    async function removeItem(productId) {
        try {
            if (!isUserLoggedIn()) {
                return { success: false, error: 'User not logged in' };
            }
            
            const result = await getItems();
            let cartItems = result.items || [];
            
            // Filter out the item to remove
            const updatedItems = cartItems.filter(item => item.id !== productId);
            
            return await saveItems(updatedItems);
        } catch (error) {
            console.error('Error removing item from Firebase cart:', error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Clear all items from the cart
     * @returns {Promise<Object>} Success status
     */
    async function clearItems() {
        try {
            if (!isUserLoggedIn()) {
                return { success: false, error: 'User not logged in' };
            }
            
            return await saveItems([]);
        } catch (error) {
            console.error('Error clearing Firebase cart:', error);
            return { success: false, error: error.message };
        }
    }
    
    // Public API
    return {
        init,
        isUserLoggedIn,
        getItems,
        saveItems,
        addItem,
        updateItemQuantity,
        removeItem,
        clearItems
    };
})();

// Initialize when this script loads
document.addEventListener('DOMContentLoaded', function() {
    FirebaseCartManager.init();
});