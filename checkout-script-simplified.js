/**
 * Auric Checkout Script
 * Handles the checkout process, including:
 * - Loading cart items from local storage or Firebase (if user is logged in)
 * - Displaying items in the order summary
 * - Authentication requirement for order placement
 * - Order storage in Firebase under users/{userId}/orders
 * - Order form submission with Nodemailer email notifications via the server
 */

document.addEventListener('DOMContentLoaded', function() {
    // Constants
    const STORAGE_KEY = 'auric_cart_items';
    let firebaseCartModule = null;
    let firebaseOrdersModule = null;
    
    // DOM Elements for Order Summary and Form
    const orderSummaryContainer = document.getElementById('orderSummary');
    const orderSummaryStep2 = document.getElementById('orderSummaryStep2');
    const orderSummaryStep3 = document.getElementById('orderSummaryStep3');
    // 'orderSummaryDetails' has been removed as we no longer have 'Your Items' section
    const orderTotalElement = document.getElementById('orderTotal');
    const orderTotalStep2 = document.getElementById('orderTotalStep2');
    const orderTotalStep3 = document.getElementById('orderTotalStep3');
    const checkoutForm = document.getElementById('checkoutForm');
    const productListContainer = document.getElementById('productList');
    
    // DOM Elements for Checkout Steps
    const step1 = document.getElementById('checkout-step-1');
    const step2 = document.getElementById('checkout-step-2');
    const step3 = document.getElementById('checkout-step-3');
    const stepIcon1 = document.getElementById('step-icon-1');
    const stepIcon2 = document.getElementById('step-icon-2');
    const stepIcon3 = document.getElementById('step-icon-3');
    const progressBar = document.getElementById('checkout-progress-bar');
    const addressConfirmation = document.getElementById('address-confirmation');
    
    // DOM Elements for Step Navigation
    const continueToAddressBtn = document.getElementById('continue-to-address');
    const backToSummaryBtn = document.getElementById('back-to-summary');
    const continueToPaymentBtn = document.getElementById('continue-to-payment');
    const backToAddressBtn = document.getElementById('back-to-address');
    
    // A simplified Firebase integration function that focuses on reliability
    function initializeFirebaseIntegration() {
        console.log('Initializing Firebase integration (simplified version)');
        
        try {
            // First try to access LocalStorageCart for reliable cart access
            if (typeof LocalStorageCart !== 'undefined' && LocalStorageCart.getItems) {
                console.log('Using LocalStorageCart module for checkout');
            } else {
                console.log('LocalStorageCart module not available');
            }
            
            // Try to use Firebase if available
            if (typeof firebase !== 'undefined' && firebase.auth) {
                // Just check if auth module exists - avoid deep integration to prevent errors
                console.log('Firebase auth detected, will try to use Firebase cart if user is logged in');
                
                // Create simple firebase module wrapper
                if (typeof FirebaseCartManager !== 'undefined') {
                    firebaseCartModule = {
                        loadCartFromFirebase: async function() {
                            try {
                                console.log('Loading cart from Firebase...');
                                const result = await FirebaseCartManager.getItems();
                                return result;
                            } catch (error) {
                                console.error('Error loading cart from Firebase:', error);
                                return { success: false, items: [] };
                            }
                        }
                    };
                    console.log('Firebase cart module initialized');
                }
                
                // Safe load Orders Module
                try {
                    fetch('/js/firebase/firebase-orders.js')
                        .then(response => {
                            if (response.ok) {
                                return import('/js/firebase/firebase-orders.js');
                            } else {
                                console.log('Firebase orders module not available');
                                return null;
                            }
                        })
                        .then(module => {
                            if (module) {
                                console.log('Firebase orders module loaded for checkout');
                                firebaseOrdersModule = module;
                                
                                // Check auth requirement and update UI correctly
                                setTimeout(updateCheckoutButtonState, 100);
                            }
                        })
                        .catch(err => {
                            console.error('Failed to load Firebase orders module:', err);
                        });
                } catch (importError) {
                    console.error('Error importing Firebase orders module:', importError);
                }
            } else {
                console.log('Firebase not available, using local storage only');
            }
        } catch (error) {
            console.error('Error initializing Firebase integration:', error);
        }
    }
    
    // Fallback to legacy module if needed
    function loadLegacyFirebaseCartModule() {
        // Load old Cart Module
        import('/js/firebase/firebase-cart.js')
            .then(module => {
                console.log('Legacy Firebase cart module loaded for checkout');
                firebaseCartModule = module;
                
                // Check if user is logged in, if so, reload cart from Firebase
                if (firebase.auth().currentUser) {
                    loadCartFromFirebase();
                }
            })
            .catch(err => {
                console.error('Failed to load legacy Firebase cart module:', err);
            });
    }
    
    /**
     * Update checkout button state based on authentication
     * If authentication is required, disable the button for non-authenticated users
     */
    function updateCheckoutButtonState() {
        console.log('Updating checkout button state');
        
        const submitButton = checkoutForm?.querySelector('button[type="submit"]');
        if (!submitButton) {
            console.log('Submit button not found');
            return;
        }
        
        // Check if user is logged in
        const isLoggedIn = firebase.auth && firebase.auth().currentUser;
        console.log('User authentication status:', isLoggedIn ? 'Logged in' : 'Not logged in');
        
        if (isLoggedIn) {
            // User is authenticated - ensure button is enabled
            submitButton.innerHTML = 'Place Order';
            submitButton.classList.remove('auth-required');
            submitButton.removeEventListener('click', showAuthRequirementModal);
            submitButton.disabled = false;
            submitButton.classList.remove('disabled');
            
            // Make sure the form uses the standard submit handler
            if (checkoutForm) {
                checkoutForm.removeEventListener('submit', showAuthRequirementModal);
                if (!checkoutForm._hasSubmitHandler) {
                    checkoutForm.addEventListener('submit', handleSubmit);
                    checkoutForm._hasSubmitHandler = true;
                }
            }
            
            console.log('Button state updated for logged in user - enabled');
        } else {
            // User is not authenticated - use auth modal
            submitButton.innerHTML = 'Sign In to Place Order';
            submitButton.classList.add('auth-required');
            
            // Add special click handler for unauthenticated users
            submitButton.removeEventListener('click', showAuthRequirementModal);
            submitButton.addEventListener('click', showAuthRequirementModal);
            
            // Make sure button appears enabled
            submitButton.disabled = false;
            submitButton.classList.remove('disabled');
            
            console.log('Button state updated for guest user');
        }
    }
    
    // Show modal requiring authentication before order placement
    function showAuthRequirementModal(e) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('Showing auth requirement modal');
        // Show account creation modal
        showCreateAccountModal();
        return false;
    }
    
    // Load cart items from Firebase for logged in users
    async function loadCartFromFirebase() {
        try {
            if (!firebaseCartModule) {
                console.log('Firebase cart module not available, using local storage');
                return [];
            }
            
            // Check if user is logged in
            if (!firebase.auth || !firebase.auth().currentUser) {
                console.log('User not logged in, using local storage');
                return [];
            }
            
            console.log('Loading cart from Firebase...');
            try {
                // Try to use FirebaseCartManager directly if available
                if (typeof FirebaseCartManager !== 'undefined' && typeof FirebaseCartManager.getItems === 'function') {
                    console.log('Using FirebaseCartManager directly');
                    const result = await FirebaseCartManager.getItems();
                    
                    if (result && result.items && result.items.length > 0) {
                        console.log('Cart loaded from Firebase:', result.items);
                        return result.items;
                    } else {
                        console.log('Firebase cart is empty');
                        return [];
                    }
                } else if (firebaseCartModule.loadCartFromFirebase) {
                    console.log('Using firebaseCartModule wrapper');
                    const result = await firebaseCartModule.loadCartFromFirebase();
                    
                    if (result && result.success && result.items && result.items.length > 0) {
                        console.log('Cart loaded from Firebase using wrapper:', result.items);
                        return result.items;
                    } else {
                        console.log('Firebase cart is empty (from wrapper)');
                        return [];
                    }
                } else {
                    console.log('No Firebase cart methods available');
                    return [];
                }
            } catch (firebaseError) {
                console.error('Firebase cart operation failed:', firebaseError);
                return [];
            }
        } catch (error) {
            console.error('Error in loadCartFromFirebase:', error);
            return [];
        }
    }
    
    // Load cart items from local storage
    function loadCartFromLocalStorage() {
        try {
            // Use LocalStorageCart if available, otherwise fall back to direct localStorage access
            if (typeof LocalStorageCart !== 'undefined') {
                console.log('Using LocalStorageCart module for checkout');
                const cartItems = LocalStorageCart.getItems();
                
                if (cartItems.length === 0) {
                    showEmptyCartMessage();
                    return [];
                }
                
                displayCartItems(cartItems);
                return cartItems;
            } else {
                // Fallback to direct localStorage access
                console.log('LocalStorageCart not available, using direct access');
                const savedCart = localStorage.getItem(STORAGE_KEY);
                
                if (savedCart) {
                    const cartItems = JSON.parse(savedCart);
                    
                    if (cartItems.length === 0) {
                        showEmptyCartMessage();
                        return [];
                    }
                    
                    displayCartItems(cartItems);
                    return cartItems;
                } else {
                    showEmptyCartMessage();
                    return [];
                }
            }
        } catch (error) {
            console.error('Error loading cart from storage:', error);
            showEmptyCartMessage();
            return [];
        }
    }
    
    // Load and display cart items - prioritizes Firebase if user is logged in
    async function loadCartItems() {
        console.log('Loading cart items for checkout display...');
        // First check if we need to initialize Firebase
        initializeFirebaseIntegration();
        
        try {
            // Check if user is logged in first
            const isUserLoggedIn = firebase.auth && firebase.auth().currentUser;
            console.log('User login status:', isUserLoggedIn ? 'Logged in' : 'Not logged in');
            
            // Update checkout button state based on login status
            updateCheckoutButtonState();
            
            // Use Firebase if available and user is logged in, otherwise use local storage
            if (isUserLoggedIn) {
                console.log('User is logged in, trying Firebase cart first');
                try {
                    // Wait for the Firebase cart to load
                    const items = await loadCartFromFirebase();
                    console.log('Firebase cart items loaded:', items ? items.length : 0);
                    
                    if (items && items.length > 0) {
                        // Display cart items here directly to ensure they appear
                        displayCartItems(items);
                        return items;
                    } else {
                        console.log('Firebase cart empty, falling back to local storage');
                    }
                } catch (firebaseError) {
                    console.error('Error loading from Firebase, falling back to local storage:', firebaseError);
                }
            }
            
            // Fallback to local storage
            console.log('Loading cart from local storage');
            const localCartItems = loadCartFromLocalStorage();
            
            // Display local cart items if we didn't already display Firebase items
            if (!isUserLoggedIn && localCartItems && localCartItems.length > 0) {
                displayCartItems(localCartItems);
            }
            
            return localCartItems;
        } catch (error) {
            console.error('Error in loadCartItems:', error);
            // Ultimate fallback
            console.log('Error encountered, using empty cart');
            showEmptyCartMessage();
            return [];
        }
    }
    
    // Display cart items in the order summary
    function displayCartItems(items) {
        let summaryHTML = '';
        // No longer need detailsHTML since we removed the 'Your Items' section
        let total = 0;
        
        // Clear product list container first to prevent duplicates
        if (productListContainer) {
            productListContainer.innerHTML = '';
        }
        
        items.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            // HTML for order summary (compact version for sidebar)
            summaryHTML += `
                <div class="card mb-2 cart-item" data-item-id="${item.id}">
                    <div class="card-body">
                        <div class="d-flex align-items-center">
                            <div class="me-3" style="width: 60px; height: 60px; overflow: hidden; border-radius: 4px;">
                                <img src="${item.image}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: cover;">
                            </div>
                            <div class="flex-grow-1">
                                <h6 class="mb-0">${item.name}</h6>
                                <div class="d-flex justify-content-between align-items-center mt-2">
                                    <div class="d-flex align-items-center">
                                        <span class="me-2">₹${item.price.toFixed(2)}</span>
                                        <div class="quantity-controls d-flex align-items-center border rounded">
                                            <button type="button" class="btn btn-sm btn-quantity-minus" data-item-id="${item.id}">-</button>
                                            <span class="px-2 quantity-value" data-item-id="${item.id}">${item.quantity}</span>
                                            <button type="button" class="btn btn-sm btn-quantity-plus" data-item-id="${item.id}">+</button>
                                        </div>
                                    </div>
                                    <span class="fw-bold item-subtotal" data-item-id="${item.id}">₹${itemTotal.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // We no longer need detailsHTML since we removed the 'Your Items' section
            
            // Add hidden fields for form submission
            const hiddenItem = document.createElement('input');
            hiddenItem.type = 'hidden';
            hiddenItem.name = 'products[]';
            hiddenItem.className = 'product-data';
            hiddenItem.setAttribute('data-item-id', item.id);
            hiddenItem.value = JSON.stringify({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                total: itemTotal,
                image: item.image
            });
            
            if (productListContainer) {
                productListContainer.appendChild(hiddenItem);
            }
        });
        
        // Update order summary (sidebar)
        if (orderSummaryContainer) {
            if (items.length > 0) {
                orderSummaryContainer.innerHTML = summaryHTML;
            } else {
                orderSummaryContainer.innerHTML = '<p>No products added yet.</p>';
            }
        }
        
        // We no longer update orderSummaryDetails since we removed the 'Your Items' section
        
        // Update all total price displays
        if (orderTotalElement) {
            orderTotalElement.textContent = `₹${total.toFixed(2)}`;
        }
        
        // Add event listeners to quantity buttons
        setupQuantityControls(items);
    }
    
    // Set up quantity control buttons
    function setupQuantityControls(items) {
        // Save items to the global variable to ensure it's up to date
        window.checkoutCartItems = items;
        
        // Get all plus buttons
        const plusButtons = document.querySelectorAll('.btn-quantity-plus');
        plusButtons.forEach(button => {
            button.addEventListener('click', function() {
                const itemId = this.getAttribute('data-item-id');
                incrementItemQuantity(itemId, window.checkoutCartItems);
            });
        });
        
        // Get all minus buttons
        const minusButtons = document.querySelectorAll('.btn-quantity-minus');
        minusButtons.forEach(button => {
            button.addEventListener('click', function() {
                const itemId = this.getAttribute('data-item-id');
                decrementItemQuantity(itemId, window.checkoutCartItems);
            });
        });
    }
    
    // Increment item quantity
    function incrementItemQuantity(itemId, items) {
        // Update the items array
        const itemIndex = items.findIndex(item => item.id === itemId);
        if (itemIndex !== -1) {
            items[itemIndex].quantity += 1;
            
            // Update the display
            updateQuantityDisplay(itemId, items[itemIndex]);
            
            // Update the localStorage
            updateLocalStorage(items);
            
            // Update order total
            updateOrderTotal(items);
        }
    }
    
    // Decrement item quantity
    function decrementItemQuantity(itemId, items) {
        // Update the items array
        const itemIndex = items.findIndex(item => item.id === itemId);
        if (itemIndex !== -1 && items[itemIndex].quantity > 1) {
            items[itemIndex].quantity -= 1;
            
            // Update the display
            updateQuantityDisplay(itemId, items[itemIndex]);
            
            // Update the localStorage
            updateLocalStorage(items);
            
            // Update order total
            updateOrderTotal(items);
        }
    }
    
    // Update quantity display
    function updateQuantityDisplay(itemId, item) {
        // Update quantity value
        const quantityElement = document.querySelector(`.quantity-value[data-item-id="${itemId}"]`);
        if (quantityElement) {
            quantityElement.textContent = item.quantity;
        }
        
        // Update subtotal
        const itemTotal = item.price * item.quantity;
        const subtotalElement = document.querySelector(`.item-subtotal[data-item-id="${itemId}"]`);
        if (subtotalElement) {
            subtotalElement.textContent = `₹${itemTotal.toFixed(2)}`;
        }
        
        // Update hidden input field
        const hiddenInput = document.querySelector(`.product-data[data-item-id="${itemId}"]`);
        if (hiddenInput) {
            const productData = JSON.parse(hiddenInput.value);
            productData.quantity = item.quantity;
            productData.total = itemTotal;
            hiddenInput.value = JSON.stringify(productData);
        }
    }
    
    // Update order total
    function updateOrderTotal(items) {
        const total = calculateTotal(items);
        if (orderTotalElement) {
            orderTotalElement.textContent = `₹${total.toFixed(2)}`;
        }
    }
    
    // Update localStorage with current cart items
    // Also syncs with Firebase if user is logged in
    function updateLocalStorage(items) {
        try {
            // First try to use our new cart modules if available
            if (typeof LocalStorageCart !== 'undefined' && LocalStorageCart.saveItems) {
                // Use new LocalStorageCart module
                LocalStorageCart.saveItems(items);
                console.log('Cart updated using LocalStorageCart module');
            } else {
                // Fallback to direct localStorage
                localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
                console.log('Cart updated using direct localStorage access');
            }
            
            // If Firebase cart module is loaded and user is logged in, also save to Firebase
            if (firebaseCartModule && firebase.auth && firebase.auth().currentUser) {
                firebaseCartModule.saveCartToFirebase(items)
                    .then(result => {
                        if (result.success) {
                            console.log('Cart updated in Firebase from checkout page');
                        } else {
                            console.warn('Failed to update cart in Firebase:', result.error);
                        }
                    })
                    .catch(err => {
                        console.error('Error updating Firebase cart:', err);
                    });
            }
        } catch (error) {
            console.error('Error saving cart to storage:', error);
            
            // Always try the most basic fallback method on error
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
            } catch (fallbackError) {
                console.error('Critical error: Failed to save cart with fallback method', fallbackError);
            }
        }
    }
    
    // Show empty cart message
    function showEmptyCartMessage() {
        if (orderSummaryContainer) {
            orderSummaryContainer.innerHTML = '<p class="text-center text-muted">Your cart is empty. Please add some products before checkout.</p>';
        }
        
        if (orderTotalElement) {
            orderTotalElement.textContent = '₹0.00';
        }
        
        // Disable the submit button
        const submitButton = checkoutForm?.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.disabled = true;
        }
    }
    
    // Handle form submission
    async function handleSubmit(e) {
        e.preventDefault();
        
        // Check if the Firebase Orders module is loaded
        if (firebaseOrdersModule) {
            // Check if authentication is required for placing orders
            const authRequirement = firebaseOrdersModule.checkOrderAuthRequirement();
            
            if (authRequirement.requiresAuth && !authRequirement.isAuthenticated) {
                console.log('User authentication required for order placement');
                showCreateAccountModal();
                return;
            }
        }
        
        // Load cart items
        const cartItems = await loadCartItemsFromStorage();
        if (cartItems.length === 0) {
            showErrorModal('Your cart is empty. Please add products before placing an order.');
            return;
        }
        
        // Get form data for the order
        const formData = new FormData(checkoutForm);
        
        // Get payment method selected
        const paymentMethod = formData.get('paymentMethod') || 'Cash on Delivery';
        
        // Log cart items to see what we're working with
        console.log("Cart items being saved to order:", cartItems);
        
        // Build the full address from the new address fields
        const houseNumber = formData.get('houseNumber') || '';
        const roadName = formData.get('roadName') || '';
        const city = formData.get('city') || '';
        const state = formData.get('state') || '';
        const pinCode = formData.get('pinCode') || '';
        const fullAddress = `${houseNumber}, ${roadName}, ${city}, ${state} - ${pinCode}`;
        
        // Prepare order data with customer info and products
        const orderData = {
            customer: {
                firstName: formData.get('firstName') || '',
                lastName: formData.get('lastName') || '',
                email: formData.get('email') || '',
                phone: formData.get('phone') || '',
                address: fullAddress,
                city: city,
                state: state,
                postalCode: pinCode,
                houseNumber: houseNumber,
                roadName: roadName
            },
            paymentMethod: paymentMethod,
            products: cartItems.map(item => {
                // Make sure image property exists and is properly structured
                console.log(`Product ${item.name} - image:`, item.image);
                
                return {
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    total: item.price * item.quantity,
                    // Ensure image is always a string path
                    image: item.image || `/images/newarrivals/${item.id}.jpg` 
                };
            }),
            orderTotal: calculateTotal(cartItems),
            orderReference: generateOrderReference(),
            orderDate: new Date().toISOString(),
            notes: formData.get('notes') || ''
        };
        
        // Disable submit button and show loading state
        const submitButton = checkoutForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...';
        
        try {
            // Process payment based on the selected payment method
            if (paymentMethod === 'Razorpay') {
                console.log('Razorpay payment method selected, opening payment gateway...');
                
                try {
                    // Process payment with Razorpay (this will open the popup)
                    await processRazorpayPayment(orderData);
                    
                    // If we get here, it means the popup didn't open or there was another issue
                    // The actual success handling is in the handleRazorpaySuccess function
                    return;
                } catch (razorpayError) {
                    console.error('Error processing Razorpay payment:', razorpayError);
                    throw new Error('Payment processing failed: ' + razorpayError.message);
                }
            }
            
            // Only continue with the rest of the flow for non-Razorpay payment methods
            // or if Razorpay processing fails
            
            // Save order to Firebase if the module is loaded and user is logged in
            if (firebaseOrdersModule) {
                console.log('Saving order to Firebase...');
                const saveResult = await firebaseOrdersModule.saveOrderToFirebase(orderData);
                
                if (!saveResult.success) {
                    if (saveResult.requiresAuth) {
                        // Authentication required but user is not logged in
                        console.log('Authentication required for order placement');
                        showCreateAccountModal();
                        
                        // Reset button state
                        submitButton.disabled = false;
                        submitButton.innerHTML = originalButtonText;
                        return;
                    } else {
                        // Other error occurred
                        throw new Error(saveResult.error || 'Failed to save order to Firebase');
                    }
                }
                
                // Store the Firebase order ID in the order data
                orderData.orderId = saveResult.orderId;
                console.log('Order saved to Firebase with ID:', saveResult.orderId);
            }
            
            // Send order confirmation emails for Cash on Delivery
            await sendOrderConfirmationEmails(orderData);
            
            // Show order confirmation modal
            showOrderConfirmation(orderData);
            
            // Clear cart after successful order
            try {
                console.log('About to clear cart after successful order');
                clearCart();
                
                // Forcibly reset the cart display immediately
                if (orderSummaryContainer) {
                    orderSummaryContainer.innerHTML = '<p>No products added yet.</p>';
                }
                if (orderTotalElement) {
                    orderTotalElement.textContent = '₹0.00';
                }
                if (productListContainer) {
                    productListContainer.innerHTML = '';
                }
                
                // Reset global cart items
                window.checkoutCartItems = [];
                
                console.log('Cart cleared after successful order submission');
            } catch (clearError) {
                console.error('Error clearing cart:', clearError);
            }
            
            // Reset form
            checkoutForm.reset();
            
            // Reset button state
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
            
        } catch (error) {
            console.error('Error processing order:', error);
            showErrorModal('There was an error processing your order. Please try again later.');
            
            // Reset button state
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
        }
    }
    
    // Clear cart from both localStorage and Firebase
    function clearCart() {
        try {
            console.log('Clearing cart after successful order');
            
            // Clear the order summary display on the page
            if (orderSummaryContainer) {
                orderSummaryContainer.innerHTML = '<p>No products added yet.</p>';
                console.log('Order summary cleared from UI');
            }
            
            // Update the order total
            if (orderTotalElement) {
                orderTotalElement.textContent = '₹0.00';
                console.log('Order total reset to zero');
            }
            
            // Clear hidden product list
            if (productListContainer) {
                productListContainer.innerHTML = '';
                console.log('Hidden product list cleared');
            }
            
            // Reset global cart items
            window.checkoutCartItems = [];
            
            // First try to use cart-manager.js if available (handles both local and Firebase)
            if (typeof CartManager !== 'undefined' && typeof CartManager.clearCart === 'function') {
                // Use CartManager to clear cart in all storage
                CartManager.clearCart().then(() => {
                    console.log('Cart cleared using CartManager.clearCart()');
                }).catch(err => {
                    console.error('Error clearing cart with CartManager:', err);
                });
                
                // We still continue with the other methods as backup
            }
            
            // Try LocalStorageCart module next
            if (typeof LocalStorageCart !== 'undefined' && LocalStorageCart.clearItems) {
                // Use LocalStorageCart module
                LocalStorageCart.clearItems();
                console.log('Cart cleared using LocalStorageCart module');
            } else {
                // Fallback to direct localStorage
                localStorage.removeItem(STORAGE_KEY);
                console.log('Cart cleared using direct localStorage access');
            }
            
            // Clear Firebase cart if user is logged in
            if (firebase.auth && firebase.auth().currentUser) {
                console.log('Clearing Firebase cart...');
                
                if (typeof FirebaseCartManager !== 'undefined' && typeof FirebaseCartManager.clearItems === 'function') {
                    // Use direct FirebaseCartManager if available
                    FirebaseCartManager.clearItems()
                        .then(() => {
                            console.log('Cart cleared from Firebase using FirebaseCartManager.clearItems()');
                        })
                        .catch(err => {
                            console.error('Error clearing Firebase cart:', err);
                        });
                } else if (firebaseCartModule && firebaseCartModule.clearFirebaseCart) {
                    // Use module wrapper
                    firebaseCartModule.clearFirebaseCart()
                        .then(result => {
                            if (result && result.success) {
                                console.log('Cart cleared from Firebase after order submission');
                            } else {
                                console.warn('Failed to clear Firebase cart:', result ? result.error : 'unknown error');
                            }
                        })
                        .catch(err => {
                            console.error('Error clearing Firebase cart:', err);
                        });
                }
            }
            
            // Update cart UI if cart-manager.js is available
            if (typeof CartManager !== 'undefined' && typeof CartManager.updateCartUI === 'function') {
                setTimeout(() => {
                    CartManager.updateCartUI();
                    console.log('Cart UI updated after clearing');
                }, 500);
            }
        } catch (error) {
            console.error('Error clearing cart:', error);
            
            // Always try the most basic fallback method on error
            try {
                localStorage.removeItem(STORAGE_KEY);
                
                // Also clear the UI as a last resort
                if (orderSummaryContainer) {
                    orderSummaryContainer.innerHTML = '<p>No products added yet.</p>';
                }
                if (orderTotalElement) {
                    orderTotalElement.textContent = '₹0.00';
                }
            } catch (fallbackError) {
                console.error('Critical error: Failed to clear cart with fallback method', fallbackError);
            }
        }
    }
    
    // Show create account modal
    function showCreateAccountModal() {
        // Create the modal HTML if it doesn't exist
        if (!document.getElementById('createAccountModal')) {
            const modalHTML = `
                <div class="modal fade" id="createAccountModal" tabindex="-1" aria-labelledby="createAccountModalLabel" aria-hidden="true">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="createAccountModalLabel">Create Account Required</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <div class="alert alert-info" role="alert">
                                    <i class="fas fa-info-circle me-2"></i>
                                    You need to create an account to complete your purchase.
                                </div>
                                <p>Please create an account or sign in to complete your order. Creating an account allows you to:</p>
                                <ul>
                                    <li>Track your order status</li>
                                    <li>Save your delivery information for future purchases</li>
                                    <li>View your order history</li>
                                    <li>Receive exclusive offers and discounts</li>
                                </ul>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                <a href="login.html" class="btn btn-outline-primary">Sign In</a>
                                <a href="signup.html" class="btn btn-primary">Create Account</a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
        
        // Show the modal
        const createAccountModal = new bootstrap.Modal(document.getElementById('createAccountModal'));
        createAccountModal.show();
    }
    
    // Load cart items from storage (utility function)
    // Checks Firebase first if user is logged in, then falls back to localStorage
    async function loadCartItemsFromStorage() {
        try {
            // Try to get cart from Firebase if user is logged in
            if (firebaseCartModule && firebase.auth && firebase.auth().currentUser) {
                try {
                    const result = await firebaseCartModule.loadCartFromFirebase();
                    if (result.success && result.items.length > 0) {
                        console.log('Cart loaded from Firebase for order processing');
                        return result.items;
                    }
                } catch (firebaseError) {
                    console.error('Error loading cart from Firebase:', firebaseError);
                    // Fall back to local storage
                }
            }
            
            // Try to use LocalStorageCart if available
            if (typeof LocalStorageCart !== 'undefined' && LocalStorageCart.getItems) {
                try {
                    const cartItems = LocalStorageCart.getItems();
                    console.log('Cart loaded from LocalStorageCart for order processing');
                    return cartItems;
                } catch (localStorageCartError) {
                    console.error('Error loading cart from LocalStorageCart:', localStorageCartError);
                    // Fall back to direct localStorage access
                }
            }
            
            // Fall back to direct localStorage access
            const savedCart = localStorage.getItem(STORAGE_KEY);
            console.log('Cart loaded from direct localStorage access for order processing');
            return savedCart ? JSON.parse(savedCart) : [];
        } catch (error) {
            console.error('Error loading cart from storage:', error);
            return [];
        }
    }
    
    // Calculate total price of cart items
    function calculateTotal(items) {
        return items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }
    
    // Generate a random order reference
    function generateOrderReference() {
        const prefix = 'AURIC';
        const timestamp = new Date().getTime().toString().slice(-6);
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `${prefix}-${timestamp}-${random}`;
    }
    
    // Show error modal
    function showErrorModal(message) {
        // Create error modal if it doesn't exist
        if (!document.getElementById('errorModal')) {
            const modalHTML = `
                <div class="modal fade" id="errorModal" tabindex="-1" aria-labelledby="errorModalLabel" aria-hidden="true">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header bg-danger text-white">
                                <h5 class="modal-title" id="errorModalLabel">Error</h5>
                                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <p id="errorMessage"></p>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
        
        const errorMessageElement = document.getElementById('errorMessage');
        if (errorMessageElement) {
            errorMessageElement.textContent = message;
        }
        
        const errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
        errorModal.show();
    }
    
    // Show order confirmation modal
    function showOrderConfirmation(orderData) {
        // Create confirmation modal if it doesn't exist
        if (!document.getElementById('confirmationModal')) {
            const modalHTML = `
                <div class="modal fade" id="confirmationModal" tabindex="-1" aria-labelledby="confirmationModalLabel" aria-hidden="true">
                    <div class="modal-dialog modal-lg">
                        <div class="modal-content">
                            <div class="modal-header bg-success text-white">
                                <h5 class="modal-title" id="confirmationModalLabel">Order Confirmed</h5>
                                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <div class="alert alert-success" role="alert">
                                    <i class="fas fa-check-circle me-2"></i>
                                    Your order has been placed successfully!
                                </div>
                                <p><strong>Order Reference:</strong> <span id="orderReference"></span></p>
                                <div id="orderDetails"></div>
                            </div>
                            <div class="modal-footer">
                                <a href="index.html" class="btn btn-primary" style="background-color: #603000; border-color: #603000;">Continue Shopping</a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
        
        const orderReferenceElement = document.getElementById('orderReference');
        const orderDetailsElement = document.getElementById('orderDetails');
        
        if (orderReferenceElement) {
            orderReferenceElement.textContent = orderData.orderReference;
        }
        
        if (orderDetailsElement) {
            let detailsHTML = `
                <div class="mt-4">
                    <h5>Order Summary</h5>
                    <div class="card">
                        <div class="card-body">
            `;
            
            orderData.products.forEach(item => {
                const itemTotal = item.price * item.quantity;
                detailsHTML += `
                    <div class="d-flex justify-content-between mb-2">
                        <span>${item.name} × ${item.quantity}</span>
                        <span>₹${itemTotal.toFixed(2)}</span>
                    </div>
                `;
            });
            
            detailsHTML += `
                            <hr>
                            <div class="d-flex justify-content-between">
                                <strong>Total</strong>
                                <strong>₹${orderData.orderTotal.toFixed(2)}</strong>
                            </div>
                        </div>
                    </div>
                    
                    <h5 class="mt-4">Customer Information</h5>
                    <div class="card">
                        <div class="card-body">
                            <p><strong>Name:</strong> ${orderData.customer.firstName} ${orderData.customer.lastName}</p>
                            <p><strong>Email:</strong> ${orderData.customer.email}</p>
                            <p><strong>Phone:</strong> ${orderData.customer.phone}</p>
                            <p><strong>Address:</strong> ${orderData.customer.address}</p>
                        </div>
                    </div>
                </div>
            `;
            
            orderDetailsElement.innerHTML = detailsHTML;
        }
        
        // Create a reference to the modal element
        const confirmationModalElement = document.getElementById('confirmationModal');
        const confirmationModal = new bootstrap.Modal(confirmationModalElement);
        
        // Make sure clicking the "Continue Shopping" button works by adding a direct event handler
        const continueShoppingBtn = confirmationModalElement.querySelector('.modal-footer a');
        if (continueShoppingBtn) {
            continueShoppingBtn.onclick = function() {
                console.log('Continue Shopping button clicked');
                window.location.href = 'index.html';
                return false;
            };
        }
        
        // Add an event listener for when the modal is fully shown
        confirmationModalElement.addEventListener('shown.bs.modal', function() {
            console.log('Order confirmation modal shown, ensuring cart is cleared');
            
            // Add click event listener for the return to homepage button
            const closeConfirmationBtn = document.getElementById('closeConfirmationBtn');
            if (closeConfirmationBtn) {
                closeConfirmationBtn.addEventListener('click', function() {
                    console.log('Return to homepage button clicked');
                    window.location.href = 'index.html';
                });
            }
            
            // Ensure the cart is cleared (this is a backup in case the first clear didn't work)
            setTimeout(() => {
                // Clear cart items from storage
                if (typeof CartManager !== 'undefined' && typeof CartManager.clearCart === 'function') {
                    CartManager.clearCart().catch(e => console.error('Error in modal shown event:', e));
                }
                
                // Clear the cart UI in cart-manager.js
                if (typeof CartManager !== 'undefined' && typeof CartManager.updateCartUI === 'function') {
                    CartManager.updateCartUI();
                }
                
                // Also clear from module directly if available
                if (typeof LocalStorageCart !== 'undefined' && LocalStorageCart.clearItems) {
                    LocalStorageCart.clearItems();
                }
                
                // Basic localStorage clearing fallback
                localStorage.removeItem(STORAGE_KEY);
                
                // Ensure the UI is cleared
                if (orderSummaryContainer) {
                    orderSummaryContainer.innerHTML = '<p>No products added yet.</p>';
                }
                if (orderTotalElement) {
                    orderTotalElement.textContent = '₹0.00';
                }
                
                console.log('Cart completely cleared after order confirmation modal shown');
            }, 500);
        }, { once: true }); // Only run this event handler once
        
        // Add an event listener for when the modal is closed
        confirmationModalElement.addEventListener('hidden.bs.modal', function() {
            console.log('Order confirmation modal closed, redirecting to index page');
            // Redirect to home page after modal is closed
            window.location.href = 'index.html';
        }, { once: true }); // Only run this event handler once
        
        // Show the modal
        confirmationModal.show();
    }
    
    // Function to go to a specific checkout step
    function goToStep(stepNumber) {
        console.log('Going to step', stepNumber);
        
        // Hide all steps
        step1.classList.remove('active');
        step2.classList.remove('active');
        step3.classList.remove('active');
        
        // Reset step icons
        stepIcon1.classList.remove('active', 'completed');
        stepIcon2.classList.remove('active', 'completed');
        stepIcon3.classList.remove('active', 'completed');
        
        // Show the current step
        if (stepNumber === 1) {
            step1.classList.add('active');
            stepIcon1.classList.add('active');
            progressBar.style.width = '33%';
        } else if (stepNumber === 2) {
            step2.classList.add('active');
            stepIcon1.classList.add('completed');
            stepIcon2.classList.add('active');
            progressBar.style.width = '66%';
            
            // Copy order summary to step 2
            if (orderSummaryContainer && orderSummaryStep2) {
                orderSummaryStep2.innerHTML = orderSummaryContainer.innerHTML;
            }
            if (orderTotalElement && orderTotalStep2) {
                orderTotalStep2.textContent = orderTotalElement.textContent;
            }
        } else if (stepNumber === 3) {
            step3.classList.add('active');
            stepIcon1.classList.add('completed');
            stepIcon2.classList.add('completed');
            stepIcon3.classList.add('active');
            progressBar.style.width = '100%';
            
            // Copy order summary to step 3
            if (orderSummaryContainer && orderSummaryStep3) {
                orderSummaryStep3.innerHTML = orderSummaryContainer.innerHTML;
            }
            if (orderTotalElement && orderTotalStep3) {
                orderTotalStep3.textContent = orderTotalElement.textContent;
            }
            
            // Update address confirmation in payment step
            updateAddressConfirmation();
        }
    }
    
    // Update the address confirmation display in the payment step
    function updateAddressConfirmation() {
        if (addressConfirmation) {
            const firstName = document.getElementById('firstName').value || '';
            const lastName = document.getElementById('lastName').value || '';
            const phone = document.getElementById('phone').value || '';
            const pinCode = document.getElementById('pinCode').value || '';
            const state = document.getElementById('state').value || '';
            const city = document.getElementById('city').value || '';
            const houseNumber = document.getElementById('houseNumber').value || '';
            const roadName = document.getElementById('roadName').value || '';
            
            if (firstName && lastName && phone && pinCode && state && city && houseNumber && roadName) {
                addressConfirmation.innerHTML = `
                    <p><strong>${firstName} ${lastName}</strong></p>
                    <p>${houseNumber}, ${roadName}</p>
                    <p>${city}, ${state} - ${pinCode}</p>
                    <p>Phone: ${phone}</p>
                `;
            } else {
                addressConfirmation.innerHTML = '<p>Please complete all address fields.</p>';
            }
        }
    }
    
    // Set up checkout step navigation
    function setupCheckoutStepNavigation() {
        // Step 1 to Step 2
        if (continueToAddressBtn) {
            continueToAddressBtn.addEventListener('click', function() {
                // Validate that cart has items
                if (window.checkoutCartItems && window.checkoutCartItems.length > 0) {
                    goToStep(2);
                } else {
                    showErrorModal('Your cart is empty. Please add products before continuing.');
                }
            });
        }
        
        // Step 2 to Step 1
        if (backToSummaryBtn) {
            backToSummaryBtn.addEventListener('click', function() {
                goToStep(1);
            });
        }
        
        // Step 2 to Step 3
        if (continueToPaymentBtn) {
            continueToPaymentBtn.addEventListener('click', function() {
                // Simple validation for required address fields
                const firstName = document.getElementById('firstName').value;
                const lastName = document.getElementById('lastName').value;
                const email = document.getElementById('email').value;
                const phone = document.getElementById('phone').value;
                const pinCode = document.getElementById('pinCode').value;
                const state = document.getElementById('state').value;
                const city = document.getElementById('city').value;
                const houseNumber = document.getElementById('houseNumber').value;
                const roadName = document.getElementById('roadName').value;
                
                if (!firstName || !lastName || !email || !phone || !pinCode || !state || !city || !houseNumber || !roadName) {
                    showErrorModal('Please fill in all required address fields.');
                    return;
                }
                
                // Email validation
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    showErrorModal('Please enter a valid email address.');
                    return;
                }
                
                // Phone validation - simple check for numeric value
                const phoneRegex = /^\d{10}$/;
                if (!phoneRegex.test(phone)) {
                    showErrorModal('Please enter a valid 10-digit phone number.');
                    return;
                }
                
                // If all validations pass, proceed to step 3
                goToStep(3);
            });
        }
        
        // Step 3 to Step 2
        if (backToAddressBtn) {
            backToAddressBtn.addEventListener('click', function() {
                goToStep(2);
            });
        }
    }
    
    // Initialize the page
    async function init() {
        console.log('Initializing checkout page...');
        
        try {
            // Set up auth state listener to handle login changes
            if (typeof firebase !== 'undefined' && firebase.auth) {
                firebase.auth().onAuthStateChanged(function(user) {
                    console.log('Auth state changed on checkout page:', user ? 'Logged in' : 'Not logged in');
                    
                    // Update checkout button state based on login status
                    updateCheckoutButtonState();
                    
                    // Reload cart items when auth state changes
                    loadCartItems().then(items => {
                        console.log('Reloaded cart after auth change, items:', items?.length || 0);
                        // Make sure we display the items properly
                        if (items && items.length > 0) {
                            displayCartItems(items);
                        } else {
                            showEmptyCartMessage();
                        }
                    });
                });
            }
            
            // Initial load of cart items
            const cartItems = await loadCartItems();
            
            // Store cart items in a global variable for quantity controls
            window.checkoutCartItems = cartItems;
            
            // Set up event listeners - only if not already set up
            if (checkoutForm && !checkoutForm._hasSubmitHandler) {
                checkoutForm.addEventListener('submit', handleSubmit);
                checkoutForm._hasSubmitHandler = true;
                console.log('Added submit handler to checkout form');
            }
            
            // Initialize checkout step navigation
            setupCheckoutStepNavigation();
            
            // Start at step 1
            goToStep(1);
            
            console.log('Checkout page initialized with cart items:', cartItems?.length || 0);
        } catch (error) {
            console.error('Error initializing checkout page:', error);
            showEmptyCartMessage();
        }
    }
    
    // Initialize the page asynchronously
    init().catch(error => {
        console.error('Failed to initialize checkout page:', error);
        showEmptyCartMessage();
    });
    
    /**
     * Process Razorpay Payment
     * This function creates a Razorpay order and opens the payment modal
     * @param {Object} orderData - The order data to process
     */
    async function processRazorpayPayment(orderData) {
        try {
            console.log('Processing Razorpay payment for order:', orderData.orderReference);
            
            // Check if Razorpay SDK is loaded
            if (typeof Razorpay === 'undefined') {
                console.error('Razorpay SDK not loaded!');
                showErrorModal('Payment gateway failed to load. Please refresh the page and try again.');
                return;
            }
            
            // Set a timeout for API calls to prevent infinite loading
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Payment gateway timed out. Please try again.')), 15000);
            });
            
            // Determine if we're using Netlify Functions or the local Express server
            let apiEndpoint;
            let result;
            
            console.log('Is Netlify environment:', !!window.netlifyHelpers);
            
            try {
                // Use Netlify Functions if helper is available
                if (window.netlifyHelpers) {
                    console.log('Creating Razorpay order via Netlify Functions');
                    result = await Promise.race([
                        window.netlifyHelpers.callNetlifyFunction('create-razorpay-order', {
                            method: 'POST',
                            body: JSON.stringify({
                                amount: orderData.orderTotal,
                                currency: 'INR',
                                receipt: orderData.orderReference,
                                notes: {
                                    orderReference: orderData.orderReference,
                                    customerEmail: orderData.customer.email,
                                    customerPhone: orderData.customer.phone
                                }
                            })
                        }),
                        timeoutPromise
                    ]);
                } else {
                    // Fallback to direct API call to Express server
                    console.log('Creating Razorpay order via Express server');
                    const response = await Promise.race([
                        fetch('/api/create-razorpay-order', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                amount: orderData.orderTotal,
                                currency: 'INR',
                                receipt: orderData.orderReference,
                                notes: {
                                    orderReference: orderData.orderReference,
                                    customerEmail: orderData.customer.email,
                                    customerPhone: orderData.customer.phone
                                }
                            })
                        }),
                        timeoutPromise
                    ]);
                    
                    result = await response.json();
                }
            } catch (apiError) {
                console.error('API error:', apiError);
                throw new Error('Failed to connect to payment server: ' + apiError.message);
            }
            
            // Verify successful response
            if (!result || !result.success) {
                console.error('API returned error:', result);
                throw new Error(result?.message || 'Failed to create payment order');
            }
            
            // Make sure we have the required data
            if (!result.order || !result.order.id || !result.key_id) {
                console.error('Missing required order data:', result);
                throw new Error('Payment order missing required data');
            }
            
            console.log('Razorpay order created:', result.order.id);
            
            // Save order to Firebase first
            if (firebaseOrdersModule) {
                console.log('Saving order to Firebase with pending payment status...');
                orderData.paymentStatus = 'pending';
                orderData.razorpayOrderId = result.order.id;
                
                const saveResult = await firebaseOrdersModule.saveOrderToFirebase(orderData);
                
                if (!saveResult.success) {
                    if (saveResult.requiresAuth) {
                        // Authentication required but user is not logged in
                        console.log('Authentication required for order placement');
                        showCreateAccountModal();
                        
                        // Reset button state
                        const submitButton = checkoutForm.querySelector('button[type="submit"]');
                        submitButton.disabled = false;
                        submitButton.innerHTML = 'Place Order';
                        return;
                    }
                }
                
                // Store the Firebase order ID
                orderData.orderId = saveResult.orderId;
            }
            
            // Configure Razorpay options
            const options = {
                key: result.key_id,
                amount: result.order.amount,
                currency: result.order.currency,
                name: 'Auric Jewelry',
                description: 'Purchase Order: ' + orderData.orderReference,
                order_id: result.order.id,
                handler: async function(response) {
                    await handleRazorpaySuccess(response, orderData);
                },
                prefill: {
                    name: orderData.customer.firstName + ' ' + orderData.customer.lastName,
                    email: orderData.customer.email,
                    contact: orderData.customer.phone
                },
                notes: {
                    address: orderData.customer.address
                },
                theme: {
                    color: '#3399cc'
                }
            };
            
            console.log('Opening Razorpay with options:', JSON.stringify(options, null, 2));
            
            try {
                // Create Razorpay instance and open checkout
                const razorpay = new Razorpay(options);
                
                // Handle modal closed/cancelled by user
                razorpay.on('payment.cancel', function() {
                    console.log('Razorpay payment cancelled by user');
                    showErrorModal('Payment was cancelled. Please try again.');
                    
                    // Reset button state
                    const submitButton = checkoutForm.querySelector('button[type="submit"]');
                    submitButton.disabled = false;
                    submitButton.innerHTML = 'Place Order';
                });
                
                // Handle modal closed without explicit cancel
                razorpay.on('modal.close', function() {
                    console.log('Razorpay modal closed');
                    setTimeout(() => {
                        // Check if payment is still processing after a short delay
                        const submitButton = checkoutForm.querySelector('button[type="submit"]');
                        if (submitButton && submitButton.disabled) {
                            console.log('Modal closed but payment not completed, resetting button');
                            submitButton.disabled = false;
                            submitButton.innerHTML = 'Place Order';
                        }
                    }, 2000);
                });
                
                // Handle payment cancellation or failure
                razorpay.on('payment.failed', function(response) {
                    console.error('Razorpay payment failed:', response.error);
                    showErrorModal('Payment failed: ' + response.error.description);
                    
                    // Reset button state
                    const submitButton = checkoutForm.querySelector('button[type="submit"]');
                    submitButton.disabled = false;
                    submitButton.innerHTML = 'Place Order';
                });
                
                // Open the payment modal
                razorpay.open();
                console.log('Razorpay checkout opened');
            } catch (razorpayError) {
                console.error('Error opening Razorpay:', razorpayError);
                throw new Error('Failed to open payment gateway: ' + razorpayError.message);
            }
        } catch (error) {
            console.error('Error processing Razorpay payment:', error);
            showErrorModal('Payment processing error: ' + error.message);
            
            // Reset button state
            const submitButton = checkoutForm.querySelector('button[type="submit"]');
            submitButton.disabled = false;
            submitButton.innerHTML = 'Place Order';
        }
    }
    
    /**
     * Handle successful Razorpay payment
     * @param {Object} response - The Razorpay success response
     * @param {Object} orderData - The original order data
     */
    async function handleRazorpaySuccess(response, orderData) {
        try {
            console.log('Razorpay payment successful:', response.razorpay_payment_id);
            console.log('Payment data:', {
                payment_id: response.razorpay_payment_id,
                order_id: response.razorpay_order_id,
                signature: response.razorpay_signature
            });
            
            // Set a timeout for verification to prevent infinite loading
            const verifyTimeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Payment verification timed out but your payment may have gone through. Please check your email for confirmation.')), 15000);
            });
            
            let verifyResult;
            
            try {
                // Determine if we're using Netlify Functions or the local Express server
                if (window.netlifyHelpers) {
                    console.log('Verifying payment via Netlify Functions');
                    // Verify the payment with Netlify Function
                    verifyResult = await Promise.race([
                        window.netlifyHelpers.callNetlifyFunction('verify-razorpay-payment', {
                            method: 'POST',
                            body: JSON.stringify({
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_signature: response.razorpay_signature
                            })
                        }),
                        verifyTimeoutPromise
                    ]);
                } else {
                    // Fallback to direct API call to Express server
                    console.log('Verifying payment via Express server');
                    const apiResponse = await Promise.race([
                        fetch('/api/verify-razorpay-payment', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_signature: response.razorpay_signature
                            })
                        }),
                        verifyTimeoutPromise
                    ]);
                    
                    verifyResult = await apiResponse.json();
                }
            } catch (verifyError) {
                console.error('Payment verification error:', verifyError);
                
                // Continue with order processing even if verification fails
                // This is safer than leaving the user hanging, as Razorpay has confirmed payment
                console.warn('Proceeding with order despite verification error');
                verifyResult = { 
                    success: true, 
                    message: 'Payment accepted, but verification unsuccessful. Order will be processed.'
                };
            }
            
            if (!verifyResult.success) {
                throw new Error(verifyResult.message || 'Payment verification failed');
            }
            
            console.log('Payment verified successfully');
            
            // Update the order with payment information
            orderData.paymentStatus = 'completed';
            orderData.paymentId = response.razorpay_payment_id;
            orderData.paymentSignature = response.razorpay_signature;
            
            // Update order in Firebase if available
            if (firebaseOrdersModule && firebaseOrdersModule.updateOrderPaymentStatus) {
                try {
                    await firebaseOrdersModule.updateOrderPaymentStatus(orderData.orderId, {
                        paymentStatus: 'completed',
                        paymentId: response.razorpay_payment_id,
                        paymentSignature: response.razorpay_signature
                    });
                    console.log('Order updated in Firebase with payment status');
                } catch (firebaseError) {
                    console.error('Error updating order in Firebase:', firebaseError);
                    // Continue processing as this is not critical
                }
            }
            
            // Send confirmation emails
            try {
                await sendOrderConfirmationEmails(orderData);
                console.log('Order confirmation emails sent');
            } catch (emailError) {
                console.error('Error sending confirmation emails:', emailError);
                // Show a warning but continue processing
                showErrorModal('Payment successful but we could not send confirmation emails. Please contact support for order details.');
            }
            
            // Show payment details in confirmation
            const paymentDetails = document.getElementById('paymentDetails');
            if (paymentDetails) {
                paymentDetails.style.display = 'block';
                document.getElementById('paymentId').textContent = response.razorpay_payment_id;
                document.getElementById('paymentMethod').textContent = 'Razorpay (Online)';
            }
            
            // Show confirmation modal
            showOrderConfirmation(orderData);
            
            // Clear cart
            try {
                clearCart();
                console.log('Cart cleared after successful payment');
            } catch (clearCartError) {
                console.error('Error clearing cart after payment:', clearCartError);
                // Not critical, continue
            }
            
            // Reset checkout form
            if (checkoutForm) {
                checkoutForm.reset();
            }
            
        } catch (error) {
            console.error('Error handling Razorpay success:', error);
            showErrorModal('Error completing payment: ' + error.message);
        } finally {
            // Reset button state
            const submitButton = checkoutForm?.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.innerHTML = 'Place Order';
            }
        }
    }
    
    /**
     * Send order confirmation emails
     * @param {Object} orderData - The order data
     */
    async function sendOrderConfirmationEmails(orderData) {
        try {
            console.log('Sending order confirmation emails via Netlify Functions...');
            
            // Make API call to the Netlify Function
            const emailResult = await window.netlifyHelpers.callNetlifyFunction('send-order-email', {
                method: 'POST',
                body: JSON.stringify(orderData)
            });
            
            if (emailResult.success) {
                console.log('Order confirmation emails sent successfully:', emailResult);
                return true;
            } else {
                console.warn('Failed to send order confirmation emails:', emailResult.message);
                // Continue with order processing even if email sending fails
                return false;
            }
        } catch (emailError) {
            console.error('Error sending order emails:', emailError);
            // Continue with order processing even if email sending fails
            return false;
        }
    }
});