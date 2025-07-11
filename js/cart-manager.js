/**
 * Auric Cart Manager
 * 
 * A simplified cart management system that handles both local storage and Firebase.
 * - Uses local storage when user is not logged in
 * - Uses Firebase when user is logged in
 * - Automatically switches between storage methods on login/logout
 * - Firebase cart data is stored at path: users/{userId}/carts/current
 */

// Make the CartManager available as a global variable
window.CartManager = (function() {
    // Private cart data storage
    let cartItems = [];
    let isAuthListenerSet = false;
    
    /**
     * Initialize the cart system
     * This runs when the page loads
     */
    function init() {
        console.log('Initializing cart system...');
        
        // Load cart data initially
        loadCart();
        
        // Set up cart UI elements
        setupCartPanel();
        
        // Set up event listeners
        setupEventListeners();
        
        // Set up authentication listener
        setupAuthListener();
        
        // Create global functions for direct HTML access
        window.openCart = openCartPanel;
        window.closeCart = closeCartPanel;
        window.toggleCart = toggleCartPanel;
        
        console.log('Cart system initialized with', cartItems.length, 'items');
        console.log('Global cart functions created: openCart, closeCart, toggleCart');
    }
    
    /**
     * Set up authentication state listener
     * This handles switching between local storage and Firebase on login/logout
     */
    function setupAuthListener() {
        if (isAuthListenerSet) return;
        
        // Only setup if Firebase is available
        if (typeof firebase !== 'undefined' && firebase.auth) {
            firebase.auth().onAuthStateChanged(async (user) => {
                if (user) {
                    console.log('User logged in, switching to Firebase storage');
                    
                    // Make sure FirebaseCartManager is available
                    if (typeof FirebaseCartManager === 'undefined') {
                        console.warn('FirebaseCartManager not available, loading module dynamically');
                        
                        try {
                            // Dynamically load the Firebase cart manager if not already loaded
                            const script = document.createElement('script');
                            script.src = '/js/firebase/firebase-cart-manager.js';
                            document.head.appendChild(script);
                            
                            // Wait for script to load
                            await new Promise((resolve) => {
                                script.onload = resolve;
                                script.onerror = () => {
                                    console.error('Failed to load FirebaseCartManager');
                                    resolve();
                                };
                            });
                            
                            // Initialize if loaded
                            if (typeof FirebaseCartManager !== 'undefined') {
                                FirebaseCartManager.init();
                            }
                        } catch (error) {
                            console.error('Error loading FirebaseCartManager:', error);
                        }
                    }
                    
                    // Check if FirebaseCartManager is now available
                    if (typeof FirebaseCartManager !== 'undefined') {
                        try {
                            // First try to get items from Firebase
                            const result = await FirebaseCartManager.getItems();
                            
                            if (result.success) {
                                // If user had items in local storage, we need to handle the merge
                                const localItems = LocalStorageCart.getItems();
                                
                                if (localItems.length > 0 && result.items.length > 0) {
                                    console.log('Merging local and Firebase carts');
                                    // Merge carts, preferring the higher quantity for duplicate items
                                    const mergedItems = mergeCartItems(localItems, result.items);
                                    cartItems = mergedItems;
                                    
                                    // Save merged cart to Firebase (local storage will be cleared)
                                    await FirebaseCartManager.saveItems(mergedItems);
                                } else if (localItems.length > 0) {
                                    console.log('Moving local cart to Firebase');
                                    // User has items in local storage but not in Firebase
                                    cartItems = localItems;
                                    await FirebaseCartManager.saveItems(localItems);
                                } else {
                                    console.log('Using existing Firebase cart');
                                    // User has items in Firebase but not in local storage
                                    cartItems = result.items;
                                }
                                
                                // Clear local storage as we're now using Firebase
                                LocalStorageCart.clearItems();
                            } else {
                                console.warn('Failed to load cart from Firebase:', result.error);
                            }
                        } catch (error) {
                            console.error('Error during cart synchronization:', error);
                            // Keep using local storage if sync fails
                        }
                    } else {
                        console.warn('FirebaseCartManager still not available after loading attempt');
                    }
                } else {
                    console.log('User logged out, switching to local storage');
                    // Load from local storage on logout
                    cartItems = LocalStorageCart.getItems();
                }
                
                // Update UI after login/logout
                updateCartUI();
            });
            
            isAuthListenerSet = true;
        }
    }
    
    /**
     * Merge two cart arrays, preserving the higher quantity for duplicate items
     * @param {Array} cart1 - First cart array
     * @param {Array} cart2 - Second cart array
     * @returns {Array} Merged cart array
     */
    function mergeCartItems(cart1, cart2) {
        const mergedMap = new Map();
        
        // Add all items from first cart
        cart1.forEach(item => {
            mergedMap.set(item.id, {...item});
        });
        
        // Merge with second cart, taking higher quantity
        cart2.forEach(item => {
            if (mergedMap.has(item.id)) {
                const existingItem = mergedMap.get(item.id);
                existingItem.quantity = Math.max(existingItem.quantity, item.quantity);
            } else {
                mergedMap.set(item.id, {...item});
            }
        });
        
        return Array.from(mergedMap.values());
    }
    
    /**
     * Load cart data from the appropriate storage
     * Uses Firebase if logged in, otherwise local storage
     */
    async function loadCart() {
        if (isUserLoggedIn()) {
            console.log('User logged in, loading cart from Firebase');
            try {
                // Make sure FirebaseCartManager is loaded and initialized
                if (typeof FirebaseCartManager !== 'undefined') {
                    const result = await FirebaseCartManager.getItems();
                    if (result.success) {
                        cartItems = result.items;
                    } else {
                        console.warn('Failed to load cart from Firebase:', result.error);
                        cartItems = [];
                    }
                } else {
                    console.warn('FirebaseCartManager not available, falling back to local storage');
                    cartItems = LocalStorageCart.getItems();
                }
            } catch (error) {
                console.error('Error loading cart from Firebase:', error);
                cartItems = [];
            }
        } else {
            console.log('User not logged in, loading cart from local storage');
            cartItems = LocalStorageCart.getItems();
        }
        
        // Update UI after loading
        updateCartUI();
    }
    
    /**
     * Save cart data to the appropriate storage
     * Uses Firebase if logged in, otherwise local storage
     */
    async function saveCart() {
        if (isUserLoggedIn()) {
            console.log('User logged in, saving cart to Firebase');
            try {
                // Make sure FirebaseCartManager is loaded and initialized
                if (typeof FirebaseCartManager !== 'undefined') {
                    await FirebaseCartManager.saveItems(cartItems);
                } else {
                    console.warn('FirebaseCartManager not available, saving to local storage only');
                    LocalStorageCart.saveItems(cartItems);
                }
            } catch (error) {
                console.error('Error saving cart to Firebase:', error);
                // Fallback to local storage
                LocalStorageCart.saveItems(cartItems);
            }
        } else {
            console.log('User not logged in, saving cart to local storage');
            LocalStorageCart.saveItems(cartItems);
        }
        
        // Update UI after saving
        updateCartUI();
    }
    
    /**
     * Check if user is currently logged in
     * @returns {Boolean} True if user is logged in
     */
    function isUserLoggedIn() {
        return typeof firebase !== 'undefined' && 
               firebase.auth && 
               firebase.auth().currentUser !== null;
    }
    
    // ======================================================
    // SECTION: CART OPERATIONS
    // ======================================================
    
    /**
     * Add a product to the cart
     * @param {Object} product - Product to add
     * @param {Number} quantity - Quantity to add (default: 1)
     */
    async function addToCart(product, quantity = 1) {
        if (!product || !product.id) {
            console.error('Invalid product', product);
            return;
        }
        
        // Check if the item already exists in the cart
        const existingItemIndex = cartItems.findIndex(item => item.id === product.id);
        
        if (existingItemIndex >= 0) {
            // Update quantity if item already exists
            cartItems[existingItemIndex].quantity += quantity;
            console.log('Updated quantity for', product.name);
        } else {
            // Add new item to cart
            cartItems.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: quantity
            });
            console.log('Added new item to cart:', product.name);
        }
        
        // Save cart
        await saveCart();
        
        // Show the cart panel
        openCartPanel();
    }
    
    /**
     * Remove a product from the cart
     * @param {String} productId - ID of the product to remove
     */
    async function removeFromCart(productId) {
        const initialLength = cartItems.length;
        cartItems = cartItems.filter(item => item.id !== productId);
        
        if (cartItems.length !== initialLength) {
            console.log('Item removed from cart');
            await saveCart();
        }
    }
    
    /**
     * Update the quantity of a product in the cart
     * @param {String} productId - ID of the product to update
     * @param {Number} newQuantity - New quantity (must be > 0)
     */
    async function updateQuantity(productId, newQuantity) {
        const item = cartItems.find(item => item.id === productId);
        
        if (item) {
            // Ensure quantity is at least 1
            item.quantity = Math.max(1, newQuantity);
            console.log('Updated quantity for', item.name, 'to', item.quantity);
            await saveCart();
        }
    }
    
    /**
     * Increment the quantity of a product in the cart
     * @param {String} productId - ID of the product to increment
     */
    async function incrementQuantity(productId) {
        const item = cartItems.find(item => item.id === productId);
        if (item) {
            await updateQuantity(productId, item.quantity + 1);
        }
    }
    
    /**
     * Decrement the quantity of a product in the cart
     * @param {String} productId - ID of the product to decrement
     */
    async function decrementQuantity(productId) {
        const item = cartItems.find(item => item.id === productId);
        if (item && item.quantity > 1) {
            await updateQuantity(productId, item.quantity - 1);
        }
    }
    
    /**
     * Clear all items from the cart
     */
    async function clearCart() {
        cartItems = [];
        console.log('Cart cleared');
        await saveCart();
    }
    
    /**
     * Calculate the total price of all items in the cart
     * @returns {Number} Total price
     */
    function calculateTotal() {
        return cartItems.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    }
    
    /**
     * Get the total number of items in the cart
     * @returns {Number} Total item count
     */
    function getItemCount() {
        return cartItems.reduce((count, item) => count + item.quantity, 0);
    }
    
    // ======================================================
    // SECTION: UI OPERATIONS
    // ======================================================
    
    /**
     * Set up the cart panel UI
     */
    function setupCartPanel() {
        // First check for overlay
        if (!document.querySelector('.cart-overlay')) {
            document.body.insertAdjacentHTML('beforeend', '<div class="cart-overlay"></div>');
        }
        
        // Check if the cart panel exists but don't create a new one if it already exists
        // This ensures we respect the existing cart panel in pages like index.html
        const existingCartPanel = document.querySelector('.cart-panel');
        
        if (!existingCartPanel) {
            // Create cart panel HTML if it doesn't exist
            const cartPanelHTML = `
                <div class="cart-panel">
                    <div class="cart-panel-header">
                        <h3>Your Cart</h3>
                        <button class="close-cart-btn">&times;</button>
                    </div>
                    <div class="cart-items">
                        <!-- Cart items will be generated here -->
                    </div>
                    <div class="cart-panel-footer">
                        <div class="cart-panel-subtotal">
                            <span>Subtotal:</span>
                            <span class="subtotal-amount">₹0.00</span>
                        </div>
                        <div class="cart-panel-buttons">
                            <a href="#" class="view-cart-btn">Continue Shopping</a>
                            <a href="checkout.html" class="checkout-btn">Checkout</a>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', cartPanelHTML);
        }
        
        // Add cart icon to navigation
        const navIcons = document.querySelector('.nav-icons');
        if (navIcons) {
            // Check if cart icon already exists
            if (!navIcons.querySelector('.cart-icon-container')) {
                const cartIconHTML = `
                    <a href="#" class="icon-link cart-toggle">
                        <div class="cart-icon-container">
                            <i class="fas fa-shopping-cart"></i>
                            <span class="cart-count">0</span>
                        </div>
                    </a>
                `;
                
                navIcons.insertAdjacentHTML('beforeend', cartIconHTML);
            }
        }
    }
    
    /**
     * Set up all event listeners for cart functionality
     */
    function setupEventListeners() {
        // Delegate events to document to handle dynamically added elements
        document.addEventListener('click', function(e) {
            // Open cart panel when cart icon is clicked (from main nav or mobile nav)
            if (e.target.closest('.cart-toggle') || e.target.closest('.mobile-cart-toggle')) {
                e.preventDefault();
                toggleCartPanel();
            }
            
            // Close cart panel when close button or overlay is clicked
            if (e.target.closest('.close-cart-btn') || e.target.classList.contains('cart-overlay')) {
                closeCartPanel();
            }
            
            // Add to cart button click - except on the product detail page (that has its own handler)
            // Check if we're on a product detail page 
            const isProductDetailPage = document.querySelector('.product-detail-container') !== null;
            
            // Only handle small buttons or regular buttons when NOT on product detail page
            if (e.target.closest('.add-to-cart-btn-small') || 
                (e.target.closest('.add-to-cart-btn') && !isProductDetailPage))
            {
                e.preventDefault();
                
                const button = e.target.closest('.add-to-cart-btn') || e.target.closest('.add-to-cart-btn-small');
                const productContainer = button.closest('[data-product-id]');
                
                if (productContainer) {
                    const productId = productContainer.dataset.productId;
                    const productName = productContainer.querySelector('.product-name')?.textContent || 
                                       productContainer.querySelector('.product-title')?.textContent || 
                                       'Product';
                    
                    // Get price from the product (handle different formats)
                    let priceElem = productContainer.querySelector('.price-value') || 
                                   productContainer.querySelector('.current-price');
                    
                    // Extract price value (remove currency symbol, commas, etc.)
                    let price = 0;
                    if (priceElem) {
                        price = parseFloat(priceElem.textContent.replace(/[^0-9.]/g, ''));
                    }
                    
                    // Find image source
                    let imageSrc = '';
                    const imageElem = productContainer.querySelector('.product-image img') || 
                                     productContainer.querySelector('.main-product-image');
                    
                    if (imageElem) {
                        imageSrc = imageElem.src;
                    }
                    
                    // Get quantity if available (for product detail page)
                    let quantity = 1;
                    const quantityInput = productContainer.querySelector('.quantity-input');
                    if (quantityInput) {
                        quantity = parseInt(quantityInput.value) || 1;
                    }
                    
                    // Create product object
                    const product = {
                        id: productId,
                        name: productName,
                        price: price,
                        image: imageSrc
                    };
                    
                    // Add to cart
                    addToCart(product, quantity);
                }
            }
            
            // Quantity increment button click
            if (e.target.closest('.quantity-btn.increment')) {
                const productId = e.target.closest('.cart-item').dataset.productId;
                if (productId) {
                    incrementQuantity(productId);
                }
            }
            
            // Quantity decrement button click
            if (e.target.closest('.quantity-btn.decrement')) {
                const productId = e.target.closest('.cart-item').dataset.productId;
                if (productId) {
                    decrementQuantity(productId);
                }
            }
            
            // Remove item button click
            if (e.target.closest('.remove-item-btn')) {
                const productId = e.target.closest('.cart-item').dataset.productId;
                if (productId) {
                    removeFromCart(productId);
                }
            }
        });
    }
    
    /**
     * Update all cart UI elements
     */
    function updateCartUI() {
        // Update cart count display
        const cartCountElements = document.querySelectorAll('.cart-count');
        const itemCount = getItemCount();
        
        cartCountElements.forEach(element => {
            element.textContent = itemCount;
            // Always show the count, even when it's zero
            element.style.display = 'flex';
        });
        
        // Update mobile menu shopping bag count
        const mobileMenuShoppingBag = document.querySelector('.mobile-account-link i.fa-shopping-bag');
        if (mobileMenuShoppingBag) {
            const mobileCountElement = document.querySelector('.mobile-cart-count');
            if (mobileCountElement) {
                mobileCountElement.textContent = itemCount;
            } else {
                // Fallback to updating the entire link if span not found
                const parentLink = mobileMenuShoppingBag.parentNode;
                parentLink.innerHTML = `<i class="fas fa-shopping-bag"></i> Shopping Bag (<span class="mobile-cart-count">${itemCount}</span>)`;
            }
        }
        
        // Update cart items display
        const cartItemsContainer = document.querySelector('.cart-items');
        if (cartItemsContainer) {
            if (cartItems.length === 0) {
                // Show empty cart message
                cartItemsContainer.innerHTML = '<div class="empty-cart-message">Your cart is empty</div>';
            } else {
                // Generate HTML for each cart item
                let cartItemsHTML = '';
                
                cartItems.forEach(item => {
                    const itemTotal = (item.price * item.quantity).toFixed(2);
                    
                    cartItemsHTML += `
                        <div class="cart-item" data-product-id="${item.id}">
                            <div class="cart-item-image">
                                <img src="${item.image}" alt="${item.name}">
                            </div>
                            <div class="cart-item-details">
                                <div class="cart-item-name">${item.name}</div>
                                <div class="cart-item-price">₹${item.price.toFixed(2)}</div>
                                <div class="cart-item-quantity">
                                    <button class="quantity-btn decrement">-</button>
                                    <input type="text" class="quantity-input" value="${item.quantity}" readonly>
                                    <button class="quantity-btn increment">+</button>
                                </div>
                                <div class="cart-item-total">₹${itemTotal}</div>
                            </div>
                            <button class="remove-item-btn">&times;</button>
                        </div>
                    `;
                });
                
                cartItemsContainer.innerHTML = cartItemsHTML;
            }
        }
        
        // Update subtotal amount
        const subtotalElement = document.querySelector('.subtotal-amount');
        if (subtotalElement) {
            subtotalElement.textContent = `₹${calculateTotal().toFixed(2)}`;
        }
        
        // Update checkout button visibility
        const checkoutBtn = document.querySelector('.checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.style.display = cartItems.length > 0 ? 'block' : 'none';
        }
    }
    
    /**
     * Open the cart panel
     */
    function openCartPanel() {
        const cartPanel = document.querySelector('.cart-panel');
        const cartOverlay = document.querySelector('.cart-overlay');
        
        console.log('Opening cart panel:', cartPanel ? 'Panel found' : 'Panel NOT found');
        console.log('Cart overlay:', cartOverlay ? 'Overlay found' : 'Overlay NOT found');
        
        if (cartPanel && cartOverlay) {
            // Force display to ensure visibility (needed for index.html)
            cartPanel.style.display = 'flex';
            
            // Ensure any inline styles are removed that could interfere
            cartPanel.style.removeProperty('right');
            
            // Add active classes
            cartPanel.classList.add('active');
            cartOverlay.classList.add('active');
            
            // Force the right position with inline style for maximum compatibility
            cartPanel.style.right = '0px';
            cartPanel.style.zIndex = '9999';
            
            // Prevent scrolling
            document.body.style.overflow = 'hidden';
            
            console.log('Cart panel activated with forced display');
        } else {
            console.error('Cart panel or overlay not found in the DOM');
            
            // Try to create them if they don't exist (fallback)
            if (!cartPanel) {
                setupCartPanel();
                // Try again with the newly created panel
                const newCartPanel = document.querySelector('.cart-panel');
                if (newCartPanel) {
                    newCartPanel.classList.add('active');
                    newCartPanel.style.right = '0px';
                    console.log('Created and activated new cart panel');
                }
            }
            
            if (!cartOverlay) {
                document.body.insertAdjacentHTML('beforeend', '<div class="cart-overlay"></div>');
                const newOverlay = document.querySelector('.cart-overlay');
                if (newOverlay) {
                    newOverlay.classList.add('active');
                    console.log('Created and activated new cart overlay');
                }
            }
            
            // Prevent scrolling in any case
            document.body.style.overflow = 'hidden';
        }
    }
    
    /**
     * Close the cart panel
     */
    function closeCartPanel() {
        const cartPanel = document.querySelector('.cart-panel');
        const cartOverlay = document.querySelector('.cart-overlay');
        
        console.log('Closing cart panel:', cartPanel ? 'Panel found' : 'Panel NOT found');
        console.log('Cart overlay:', cartOverlay ? 'Overlay found' : 'Overlay NOT found');
        
        if (cartPanel) {
            // Remove active classes
            cartPanel.classList.remove('active');
            
            // Force position with inline style to ensure it's moved off-screen
            cartPanel.style.right = '-400px';
            
            // Ensure display style does not override the removal of active class
            // Wait a bit to allow transition to complete
            setTimeout(() => {
                if (!cartPanel.classList.contains('active')) {
                    // Only modify these if still inactive
                    cartPanel.style.zIndex = '9998'; // Lower z-index when closed
                }
            }, 300); // Match transition time
            
            console.log('Cart panel closed');
        }
        
        if (cartOverlay) {
            cartOverlay.classList.remove('active');
        }
        
        // Restore scrolling in any case
        document.body.style.overflow = '';
        
        // Create a global function for direct HTML onclick access if it doesn't exist
        if (typeof window.closeCart !== 'function') {
            window.closeCart = closeCartPanel;
            console.log('Global closeCart function created');
        }
    }
    
    /**
     * Toggle the cart panel open/closed
     */
    function toggleCartPanel() {
        const cartPanel = document.querySelector('.cart-panel');
        
        if (cartPanel && cartPanel.classList.contains('active')) {
            closeCartPanel();
        } else {
            openCartPanel();
        }
    }
    
    // Public API
    return {
        init: init,
        addToCart: addToCart,
        removeFromCart: removeFromCart,
        updateQuantity: updateQuantity,
        incrementQuantity: incrementQuantity,
        decrementQuantity: decrementQuantity,
        clearCart: clearCart,
        getCartItems: () => [...cartItems], // Return copy of items array
        getItemCount: getItemCount,
        calculateTotal: calculateTotal,
        openCartPanel: openCartPanel,
        closeCartPanel: closeCartPanel,
        toggleCartPanel: toggleCartPanel
    };
})();

// We'll initialize CartManager from main.js to ensure a single initialization point
// This prevents double initialization issues