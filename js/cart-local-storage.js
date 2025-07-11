/**
 * Auric Local Storage Cart Manager
 * 
 * This module handles cart functionality using browser's localStorage
 * It's used when the user is not logged in or Firebase is not available
 */

const LocalStorageCart = (function() {
    // Storage key for cart data
    const STORAGE_KEY = 'auric_cart_items';
    
    /**
     * Load cart items from localStorage
     * @returns {Array} Array of cart items
     */
    function getItems() {
        try {
            const savedCart = localStorage.getItem(STORAGE_KEY);
            if (savedCart) {
                const items = JSON.parse(savedCart);
                console.log('Cart loaded from localStorage:', items.length, 'items');
                return items;
            }
        } catch (error) {
            console.error('Error loading cart from localStorage:', error);
        }
        return [];
    }
    
    /**
     * Save cart items to localStorage
     * @param {Array} items - Array of cart items to save
     * @returns {Boolean} - Success status
     */
    function saveItems(items) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
            console.log('Cart saved to localStorage');
            return true;
        } catch (error) {
            console.error('Error saving cart to localStorage:', error);
            return false;
        }
    }
    
    /**
     * Clear all cart data from localStorage
     * @returns {Boolean} - Success status
     */
    function clearItems() {
        try {
            localStorage.removeItem(STORAGE_KEY);
            console.log('Cart cleared from localStorage');
            return true;
        } catch (error) {
            console.error('Error clearing cart from localStorage:', error);
            return false;
        }
    }
    
    // Public API
    return {
        getItems,
        saveItems,
        clearItems
    };
})();

// Export for ES module compatibility
if (typeof exports !== 'undefined') {
    exports.LocalStorageCart = LocalStorageCart;
}