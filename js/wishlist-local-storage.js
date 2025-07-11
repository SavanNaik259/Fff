/**
 * Auric Local Storage Wishlist Manager
 * 
 * This module handles wishlist functionality using browser's localStorage
 * It's used when the user is not logged in or Firebase is not available
 */

const LocalStorageWishlist = (function() {
    // Storage key for wishlist data
    const STORAGE_KEY = 'auric_wishlist_items';
    
    /**
     * Load wishlist items from localStorage
     * @returns {Array} Array of wishlist items
     */
    function getItems() {
        try {
            const savedWishlist = localStorage.getItem(STORAGE_KEY);
            if (savedWishlist) {
                const items = JSON.parse(savedWishlist);
                console.log('Wishlist loaded from localStorage:', items.length, 'items');
                return items;
            }
        } catch (error) {
            console.error('Error loading wishlist from localStorage:', error);
        }
        return [];
    }
    
    /**
     * Save wishlist items to localStorage
     * @param {Array} items - Array of wishlist items to save
     * @returns {Boolean} - Success status
     */
    function saveItems(items) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
            console.log('Wishlist saved to localStorage');
            return true;
        } catch (error) {
            console.error('Error saving wishlist to localStorage:', error);
            return false;
        }
    }
    
    /**
     * Clear all wishlist data from localStorage
     * @returns {Boolean} - Success status
     */
    function clearItems() {
        try {
            localStorage.removeItem(STORAGE_KEY);
            console.log('Wishlist cleared from localStorage');
            return true;
        } catch (error) {
            console.error('Error clearing wishlist from localStorage:', error);
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
    exports.LocalStorageWishlist = LocalStorageWishlist;
}