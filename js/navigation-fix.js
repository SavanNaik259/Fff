/**
 * Auric Navigation Coordinator
 * 
 * This script coordinates between multiple navigation systems:
 * - Mobile menu
 * - Cart panel
 * - Navigation dropdown
 * 
 * It ensures they don't interfere with each other and handles
 * proper state management when one system is activated.
 */

(function() {
  // Run immediately
  console.log('Navigation coordinator initializing');

  // Store navigation states
  let navState = {
    cartOpen: false,
    menuOpen: false,
    wishlistOpen: false,
    modalOpen: false
  };

  // Create safe references to DOM elements
  function getElement(selector) {
    return document.querySelector(selector);
  }

  // Safe element references
  let elements = {
    get cartPanel() { return getElement('.cart-panel'); },
    get cartOverlay() { return getElement('.cart-overlay'); },
    get navMenu() { return getElement('#navMenu'); },
    get menuOverlay() { return getElement('#menuOverlay'); },
    get mobileMenu() { return getElement('#mobileMenu'); },
    get wishlistPanel() { return getElement('.wishlist-panel'); },
    get wishlistOverlay() { return getElement('.wishlist-overlay'); }
  };

  // Open cart reliably
  window.openCartDirectly = function() {
    console.log('Navigation coordinator: Opening cart');
    
    // Close other panels first
    closeMenu();
    closeWishlist();
    
    const { cartPanel, cartOverlay } = elements;
    
    if (!cartPanel || !cartOverlay) {
      console.error('Cart elements not found!');
      return;
    }
    
    // Force display with important flags
    cartPanel.style.cssText = 'right: 0 !important; display: flex !important; visibility: visible !important; z-index: 999999 !important; opacity: 1 !important;';
    cartPanel.classList.add('active');
    
    cartOverlay.style.cssText = 'display: block !important; visibility: visible !important; z-index: 999998 !important;';
    cartOverlay.classList.add('active');
    
    // Prevent scrolling
    document.body.style.overflow = 'hidden';
    
    // Update state
    navState.cartOpen = true;
    
    console.log('Cart opened via coordinator');
    return false;
  };

  // Close cart reliably
  window.closeCartDirectly = function() {
    console.log('Navigation coordinator: Closing cart');
    
    const { cartPanel, cartOverlay } = elements;
    
    if (cartPanel) {
      cartPanel.style.right = '-400px';
      cartPanel.classList.remove('active');
    }
    
    if (cartOverlay) {
      cartOverlay.style.display = 'none';
      cartOverlay.classList.remove('active');
    }
    
    // Restore scrolling if no other panels are open
    if (!navState.menuOpen && !navState.wishlistOpen && !navState.modalOpen) {
      document.body.style.overflow = '';
    }
    
    // Update state
    navState.cartOpen = false;
    
    console.log('Cart closed via coordinator');
    return false;
  };

  // Open mobile menu reliably
  function openMenu() {
    console.log('Navigation coordinator: Opening menu');
    
    // Close other panels first
    closeCart();
    closeWishlist();
    
    // Handle both possible menu systems
    const { navMenu, menuOverlay, mobileMenu } = elements;
    
    if (navMenu) {
      navMenu.classList.add('active');
      if (menuOverlay) menuOverlay.classList.add('active');
    }
    
    if (mobileMenu) {
      mobileMenu.classList.add('active');
    }
    
    // Prevent scrolling
    document.body.style.overflow = 'hidden';
    
    // Update state
    navState.menuOpen = true;
    
    console.log('Menu opened via coordinator');
    return false;
  }

  // Close mobile menu reliably
  function closeMenu() {
    console.log('Navigation coordinator: Closing menu');
    
    // Handle both possible menu systems
    const { navMenu, menuOverlay, mobileMenu } = elements;
    
    if (navMenu) {
      navMenu.classList.remove('active');
      if (menuOverlay) menuOverlay.classList.remove('active');
    }
    
    if (mobileMenu) {
      mobileMenu.classList.remove('active');
    }
    
    // Restore scrolling if no other panels are open
    if (!navState.cartOpen && !navState.wishlistOpen && !navState.modalOpen) {
      document.body.style.overflow = '';
    }
    
    // Update state
    navState.menuOpen = false;
    
    console.log('Menu closed via coordinator');
    return false;
  }

  // Open wishlist reliably
  function openWishlist() {
    console.log('Navigation coordinator: Opening wishlist');
    
    // Close other panels first
    closeCart();
    closeMenu();
    
    const { wishlistPanel, wishlistOverlay } = elements;
    
    if (!wishlistPanel || !wishlistOverlay) {
      console.error('Wishlist elements not found!');
      return;
    }
    
    // Apply styles
    wishlistPanel.style.right = '0';
    wishlistPanel.classList.add('active');
    
    wishlistOverlay.style.display = 'block';
    wishlistOverlay.classList.add('active');
    
    // Prevent scrolling
    document.body.style.overflow = 'hidden';
    
    // Update state
    navState.wishlistOpen = true;
    
    console.log('Wishlist opened via coordinator');
    return false;
  }

  // Close wishlist reliably
  function closeWishlist() {
    console.log('Navigation coordinator: Closing wishlist');
    
    const { wishlistPanel, wishlistOverlay } = elements;
    
    if (wishlistPanel) {
      wishlistPanel.style.right = '-400px';
      wishlistPanel.classList.remove('active');
    }
    
    if (wishlistOverlay) {
      wishlistOverlay.style.display = 'none';
      wishlistOverlay.classList.remove('active');
    }
    
    // Restore scrolling if no other panels are open
    if (!navState.cartOpen && !navState.menuOpen && !navState.modalOpen) {
      document.body.style.overflow = '';
    }
    
    // Update state
    navState.wishlistOpen = false;
    
    console.log('Wishlist closed via coordinator');
    return false;
  }

  // Menu button click handler
  function handleMenuButtonClick(e) {
    if (e) e.preventDefault();
    openMenu();
    return false;
  }

  // Close menu button click handler
  function handleCloseMenuClick(e) {
    if (e) e.preventDefault();
    closeMenu();
    return false;
  }

  // Cart button click handler
  function handleCartButtonClick(e) {
    if (e) e.preventDefault();
    window.openCartDirectly();
    return false;
  }

  // Close cart button click handler
  function handleCloseCartClick(e) {
    if (e) e.preventDefault();
    window.closeCartDirectly();
    return false;
  }

  // Wishlist button click handler
  function handleWishlistButtonClick(e) {
    if (e) e.preventDefault();
    openWishlist();
    return false;
  }

  // Close wishlist button click handler
  function handleCloseWishlistClick(e) {
    if (e) e.preventDefault();
    closeWishlist();
    return false;
  }

  // Set up event handlers
  function setupEventHandlers() {
    console.log('Setting up navigation event handlers');
    
    // Menu buttons
    document.querySelectorAll('#navToggle, #menuButton').forEach(el => {
      if (el) {
        // Remove any existing handlers and replace with our own
        const newEl = el.cloneNode(true);
        if (el.parentNode) el.parentNode.replaceChild(newEl, el);
        newEl.addEventListener('click', handleMenuButtonClick);
      }
    });
    
    // Close menu buttons
    document.querySelectorAll('#closeMenu, #closeButton').forEach(el => {
      if (el) {
        // Remove any existing handlers and replace with our own
        const newEl = el.cloneNode(true);
        if (el.parentNode) el.parentNode.replaceChild(newEl, el);
        newEl.addEventListener('click', handleCloseMenuClick);
      }
    });
    
    // Menu overlays
    document.querySelectorAll('#menuOverlay').forEach(el => {
      if (el) {
        // Remove any existing handlers and replace with our own
        const newEl = el.cloneNode(true);
        if (el.parentNode) el.parentNode.replaceChild(newEl, el);
        newEl.addEventListener('click', handleCloseMenuClick);
      }
    });
    
    // Cart buttons
    document.querySelectorAll('.cart-toggle, .cart-icon-container, #cartToggleButton, .mobile-cart-toggle').forEach(el => {
      if (el) {
        // Remove any existing handlers and replace with our own
        const newEl = el.cloneNode(true);
        if (el.parentNode) el.parentNode.replaceChild(newEl, el);
        newEl.addEventListener('click', handleCartButtonClick);
      }
    });
    
    // Close cart buttons
    document.querySelectorAll('.close-cart-btn').forEach(el => {
      if (el) {
        // Remove any existing handlers and replace with our own
        const newEl = el.cloneNode(true);
        if (el.parentNode) el.parentNode.replaceChild(newEl, el);
        newEl.addEventListener('click', handleCloseCartClick);
      }
    });
    
    // Cart overlays
    document.querySelectorAll('.cart-overlay').forEach(el => {
      if (el) {
        // Remove any existing handlers and replace with our own
        const newEl = el.cloneNode(true);
        if (el.parentNode) el.parentNode.replaceChild(newEl, el);
        newEl.addEventListener('click', handleCloseCartClick);
      }
    });
    
    // Wishlist buttons
    document.querySelectorAll('.wishlist-toggle, .wishlist-icon-container').forEach(el => {
      if (el) {
        // Remove any existing handlers and replace with our own
        const newEl = el.cloneNode(true);
        if (el.parentNode) el.parentNode.replaceChild(newEl, el);
        newEl.addEventListener('click', handleWishlistButtonClick);
      }
    });
    
    // Close wishlist buttons
    document.querySelectorAll('.close-wishlist-btn').forEach(el => {
      if (el) {
        // Remove any existing handlers and replace with our own
        const newEl = el.cloneNode(true);
        if (el.parentNode) el.parentNode.replaceChild(newEl, el);
        newEl.addEventListener('click', handleCloseWishlistClick);
      }
    });
    
    // Wishlist overlays
    document.querySelectorAll('.wishlist-overlay').forEach(el => {
      if (el) {
        // Remove any existing handlers and replace with our own
        const newEl = el.cloneNode(true);
        if (el.parentNode) el.parentNode.replaceChild(newEl, el);
        newEl.addEventListener('click', handleCloseWishlistClick);
      }
    });
    
    console.log('Navigation event handlers set up');
  }

  // Make all functions available globally
  window.openCart = window.openCartDirectly;
  window.closeCart = window.closeCartDirectly;
  window.openMenu = openMenu;
  window.closeMenu = closeMenu;
  window.openMobileMenu = openMenu;
  window.closeMobileMenu = closeMenu;
  window.openWishlist = openWishlist;
  window.closeWishlist = closeWishlist;

  // Initialize when DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupEventHandlers);
  } else {
    setupEventHandlers();
  }

  // Also set up on window load
  window.addEventListener('load', setupEventHandlers);
  
  // Run setup now
  setupEventHandlers();
  
  console.log('Navigation coordinator initialized');
})();