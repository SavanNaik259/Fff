/**
 * Auric Firebase Cart Management System
 * Handles storing and retrieving cart items from Firebase Firestore
 * For authenticated users, cart data is stored at path: users/{userId}/carts
 * 
 * This module works alongside the existing local storage cart system,
 * syncing data between local storage and Firestore when a user is logged in.
 */

// Access Firebase instances that should be already initialized in the HTML
const db = firebase.firestore();
const auth = firebase.auth();

// Cart collection name
const CART_COLLECTION = 'carts';

/**
 * Save cart items to Firebase for the current user
 * @param {Array} cartItems - Array of cart items to save
 * @returns {Promise<Object>} - Success status and any error message
 */
export async function saveCartToFirebase(cartItems) {
  try {
    const user = auth.currentUser;
    
    // Only proceed if user is logged in
    if (!user) {
      console.log('User not logged in, cart not saved to Firebase');
      return { success: false, error: 'User not logged in' };
    }
    
    // Create a cart document in the users collection at path users/{userId}/carts
    // This matches the exact path requested: users/{userId}/carts
    const cartRef = db.collection('users').doc(user.uid).collection(CART_COLLECTION).doc('current');
    
    // Debug the cart items being saved
    console.log('Saving cart to Firebase path:', `users/${user.uid}/carts/current`);
    console.log('Cart items being saved:', JSON.stringify(cartItems));
    
    // Save the cart data with more detailed error handling
    try {
      await cartRef.set({
        items: cartItems,
        updatedAt: firebase.firestore.Timestamp.now(),
        userId: user.uid
      });
      
      console.log('Cart saved to Firebase successfully');
      return { success: true };
    } catch (innerError) {
      console.error('Detailed Firebase save error:', innerError);
      throw innerError; // Re-throw to be caught by the outer catch
    }
  } catch (error) {
    console.error('Error saving cart to Firebase:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Load cart items from Firebase for the current user
 * @returns {Promise<Object>} - Cart items and success status
 */
export async function loadCartFromFirebase() {
  try {
    const user = auth.currentUser;
    
    // Only proceed if user is logged in
    if (!user) {
      console.log('User not logged in, no cart to load from Firebase');
      return { success: false, items: [], error: 'User not logged in' };
    }
    
    // Get the cart document from users/{userId}/carts path
    const cartRef = db.collection('users').doc(user.uid).collection(CART_COLLECTION).doc('current');
    console.log('Loading cart from Firebase path:', `users/${user.uid}/carts/current`);
    const cartDoc = await cartRef.get();
    
    if (cartDoc.exists) {
      const cartData = cartDoc.data();
      console.log('Cart loaded from Firebase');
      console.log('Cart data from Firebase:', JSON.stringify(cartData));
      
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
  } catch (error) {
    console.error('Error loading cart from Firebase:', error);
    return { success: false, items: [], error: error.message };
  }
}

/**
 * Add a single item to Firebase cart
 * @param {Object} product - Product to add
 * @param {Number} quantity - Quantity to add
 * @returns {Promise<Object>} - Success status
 */
export async function addItemToFirebaseCart(product, quantity = 1) {
  try {
    const user = auth.currentUser;
    
    // Only proceed if user is logged in
    if (!user) {
      return { success: false, error: 'User not logged in' };
    }
    
    const cartResult = await loadCartFromFirebase();
    let cartItems = cartResult.items || [];
    
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
    return await saveCartToFirebase(cartItems);
  } catch (error) {
    console.error('Error adding item to Firebase cart:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update item quantity in Firebase cart
 * @param {String} productId - ID of product to update
 * @param {Number} newQuantity - New quantity (must be > 0)
 * @returns {Promise<Object>} - Success status
 */
export async function updateQuantityInFirebaseCart(productId, newQuantity) {
  try {
    const user = auth.currentUser;
    
    // Only proceed if user is logged in
    if (!user) {
      return { success: false, error: 'User not logged in' };
    }
    
    // Ensure quantity is at least 1
    const quantity = Math.max(1, newQuantity);
    
    const cartResult = await loadCartFromFirebase();
    let cartItems = cartResult.items || [];
    
    // Find item and update quantity
    const itemIndex = cartItems.findIndex(item => item.id === productId);
    
    if (itemIndex !== -1) {
      cartItems[itemIndex].quantity = quantity;
      return await saveCartToFirebase(cartItems);
    } else {
      return { success: false, error: 'Item not found in cart' };
    }
  } catch (error) {
    console.error('Error updating quantity in Firebase cart:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Remove item from Firebase cart
 * @param {String} productId - ID of product to remove
 * @returns {Promise<Object>} - Success status
 */
export async function removeItemFromFirebaseCart(productId) {
  try {
    const user = auth.currentUser;
    
    // Only proceed if user is logged in
    if (!user) {
      return { success: false, error: 'User not logged in' };
    }
    
    const cartResult = await loadCartFromFirebase();
    let cartItems = cartResult.items || [];
    
    // Filter out the item to remove
    const updatedItems = cartItems.filter(item => item.id !== productId);
    
    return await saveCartToFirebase(updatedItems);
  } catch (error) {
    console.error('Error removing item from Firebase cart:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Clear all items from Firebase cart
 * @returns {Promise<Object>} - Success status
 */
export async function clearFirebaseCart() {
  try {
    const user = auth.currentUser;
    
    // Only proceed if user is logged in
    if (!user) {
      return { success: false, error: 'User not logged in' };
    }
    
    return await saveCartToFirebase([]);
  } catch (error) {
    console.error('Error clearing Firebase cart:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Sync cart between localStorage and Firebase
 * 1. If user logs in and has items in localStorage, save to Firebase
 * 2. If user logs in and has items in Firebase but not localStorage, load from Firebase
 * 3. If user logs in and has items in both, merge and save to both
 * 
 * @param {Array} localCartItems - Cart items from localStorage
 * @param {Function} updateLocalStorage - Function to update localStorage
 * @returns {Promise<Array>} - Array of merged cart items
 */
export async function syncCartWithFirebase(localCartItems, updateLocalStorage) {
  try {
    const user = auth.currentUser;
    
    // Only proceed if user is logged in
    if (!user) {
      console.log('User not logged in, no sync needed');
      return localCartItems;
    }
    
    // Load cart from Firebase
    const firebaseCartResult = await loadCartFromFirebase();
    const firebaseCartItems = firebaseCartResult.items || [];
    
    // If both sources have items, we need to merge
    if (localCartItems.length > 0 && firebaseCartItems.length > 0) {
      console.log('Merging carts from localStorage and Firebase');
      
      // Create a map for easier merging
      const mergedItemsMap = new Map();
      
      // Add all local items to the map
      localCartItems.forEach(item => {
        mergedItemsMap.set(item.id, item);
      });
      
      // Merge with Firebase items (Firebase quantity takes precedence if item exists in both)
      firebaseCartItems.forEach(item => {
        if (mergedItemsMap.has(item.id)) {
          // Item exists in both, take the higher quantity
          const localItem = mergedItemsMap.get(item.id);
          mergedItemsMap.set(item.id, {
            ...item,
            quantity: Math.max(localItem.quantity, item.quantity)
          });
        } else {
          // Item only in Firebase, add it
          mergedItemsMap.set(item.id, item);
        }
      });
      
      // Convert map back to array
      const mergedItems = Array.from(mergedItemsMap.values());
      
      // Save merged cart to both sources
      await saveCartToFirebase(mergedItems);
      if (updateLocalStorage && typeof updateLocalStorage === 'function') {
        updateLocalStorage(mergedItems);
      }
      
      return mergedItems;
    } 
    // If only localStorage has items, save to Firebase
    else if (localCartItems.length > 0) {
      console.log('Saving localStorage cart to Firebase');
      await saveCartToFirebase(localCartItems);
      return localCartItems;
    } 
    // If only Firebase has items, update localStorage
    else if (firebaseCartItems.length > 0) {
      console.log('Loading Firebase cart to localStorage');
      if (updateLocalStorage && typeof updateLocalStorage === 'function') {
        updateLocalStorage(firebaseCartItems);
      }
      return firebaseCartItems;
    }
    
    // Both are empty, return empty array
    return [];
  } catch (error) {
    console.error('Error syncing cart with Firebase:', error);
    // Return local cart items as fallback
    return localCartItems;
  }
}

/**
 * Set up auth state observer to sync cart when auth state changes
 * @param {Function} getLocalCartItems - Function to get items from localStorage
 * @param {Function} updateLocalStorage - Function to update localStorage
 * @returns {Function} - Unsubscribe function
 */
export function observeAuthStateForCartSync(getLocalCartItems, updateLocalStorage) {
  return auth.onAuthStateChanged(async (user) => {
    if (user) {
      // User signed in, sync cart
      console.log('User signed in, syncing cart with Firebase');
      const localItems = typeof getLocalCartItems === 'function' ? getLocalCartItems() : [];
      await syncCartWithFirebase(localItems, updateLocalStorage);
      
      // Test Firebase database connectivity
      testFirebaseConnection();
    } else {
      // User signed out, nothing to do (keep local cart)
      console.log('User signed out, keeping local cart only');
    }
  });
}

/**
 * Test function to verify Firebase Firestore connectivity
 * This function attempts to write a test document and then read it back
 * to confirm that Firebase is properly connected and permissions are working
 */
async function testFirebaseConnection() {
  try {
    console.log('Testing Firebase Firestore connectivity...');
    const user = auth.currentUser;
    
    if (!user) {
      console.log('No user logged in, cannot test Firebase connection');
      return;
    }
    
    // Try to write a test document
    const testDocRef = db.collection('users').doc(user.uid).collection('tests').doc('connection-test');
    const testData = { 
      timestamp: firebase.firestore.Timestamp.now(),
      message: 'Connection test successful',
      browser: navigator.userAgent
    };
    
    console.log('Writing test document to Firebase...');
    await testDocRef.set(testData);
    console.log('Test document successfully written to Firebase!');
    
    // Try to read it back
    console.log('Reading test document from Firebase...');
    const docSnapshot = await testDocRef.get();
    
    if (docSnapshot.exists) {
      console.log('Test document successfully read from Firebase!');
      console.log('Test document data:', docSnapshot.data());
      console.log('✅ Firebase connection is working properly!');
    } else {
      console.warn('Test document was written but could not be read back');
    }
  } catch (error) {
    console.error('Firebase connection test failed:', error);
    console.log('Firebase security rules might be preventing write operations');
  }
}