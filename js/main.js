// Direct function to toggle cart
function toggleCartDirectly() {
    console.log('Direct cart toggle called');
    const cartPanel = document.querySelector('.cart-panel');
    const cartOverlay = document.querySelector('.cart-overlay');
    
    if (cartPanel && cartOverlay) {
        if (cartPanel.classList.contains('active')) {
            // Close cart
            cartPanel.classList.remove('active');
            cartOverlay.classList.remove('active');
            document.body.style.overflow = '';
        } else {
            // Open cart
            cartPanel.style.right = '0px';
            cartPanel.classList.add('active');
            cartOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    } else {
        console.error('Cart panel or overlay not found:', 
                     cartPanel ? 'Panel found' : 'Panel MISSING', 
                     cartOverlay ? 'Overlay found' : 'Overlay MISSING');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - initializing menu system');
    
    // Add direct event listeners for cart toggle buttons
    const cartButtons = document.querySelectorAll('.cart-toggle, .cart-icon-container, #cartToggleButton, .mobile-cart-toggle');
    cartButtons.forEach(button => {
        console.log('Adding direct event listener to cart button:', button);
        button.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Cart button clicked directly');
            toggleCartDirectly();
        });
    });
    
    // Add direct event listeners for close button and overlay
    document.addEventListener('click', function(e) {
        // Close cart when close button, overlay, or continue shopping button is clicked
        if (e.target.closest('.close-cart-btn') || 
            e.target.classList.contains('cart-overlay') || 
            e.target.closest('.continue-shopping-btn')) {
            
            console.log('Close button, overlay, or continue shopping clicked directly');
            const cartPanel = document.querySelector('.cart-panel');
            const cartOverlay = document.querySelector('.cart-overlay');
            
            if (cartPanel && cartOverlay) {
                cartPanel.classList.remove('active');
                cartOverlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    });
    
    // Initialize CartManager if available
    if (window.CartManager && typeof CartManager.init === 'function') {
        // Initialize cart manager
        CartManager.init();
        console.log("CartManager initialized from main.js");
        
        // Ensure cart counts are updated immediately
        setTimeout(function() {
            // Update cart counts
            const cartCount = CartManager.getItemCount();
            console.log("Initial cart count:", cartCount);
            
            // Update all cart count badges
            document.querySelectorAll('.cart-count').forEach(function(el) {
                el.textContent = cartCount;
            });
            
            // Update mobile cart count
            const mobileCountElement = document.querySelector('.mobile-cart-count');
            if (mobileCountElement) {
                mobileCountElement.textContent = cartCount;
            }
        }, 100); // Short delay to ensure everything is loaded
        
        // Make cart functions available globally
        window.openCart = function() {
            console.log("Global openCart called");
            CartManager.openCartPanel();
        };
        
        window.closeCart = function() {
            console.log("Global closeCart called");
            CartManager.closeCartPanel();
        };
        
        window.toggleCart = function() {
            console.log("Global toggleCart called");
            CartManager.toggleCartPanel();
        };
        
        // Set up event listeners for cart buttons
        const cartToggleButton = document.getElementById('cartToggleButton');
        if (cartToggleButton) {
            cartToggleButton.addEventListener('click', function(e) {
                e.preventDefault();
                console.log("Cart toggle button clicked");
                toggleCart();
            });
            console.log("Added event listener to cart toggle button");
        }
        
        // Mobile cart toggle
        const mobileCartToggle = document.querySelector('.mobile-cart-toggle');
        if (mobileCartToggle) {
            mobileCartToggle.addEventListener('click', function(e) {
                e.preventDefault();
                console.log("Mobile cart toggle clicked");
                toggleCart();
            });
            console.log("Added event listener to mobile cart toggle");
        }
    }
    
    // Menu elements
    const menuToggle = document.getElementById('menuToggle');
    const closeMenu = document.getElementById('closeMenu');
    const sidebarMenu = document.getElementById('sidebarMenu');
    const menuOverlay = document.getElementById('menuOverlay');
    
    // Debug elements presence
    console.log('menuToggle:', menuToggle ? 'found' : 'missing');
    console.log('closeMenu:', closeMenu ? 'found' : 'missing');
    console.log('sidebarMenu:', sidebarMenu ? 'found' : 'missing');
    console.log('menuOverlay:', menuOverlay ? 'found' : 'missing');
    
    // Menu toggle functionality
    if (menuToggle) {
        menuToggle.addEventListener('click', function(e) {
            console.log('Menu toggle clicked');
            if (sidebarMenu) {
                sidebarMenu.classList.add('active');
                console.log('Added active class to sidebarMenu');
            }
            if (menuOverlay) {
                menuOverlay.classList.add('active');
                console.log('Added active class to menuOverlay');
            }
            document.body.style.overflow = 'hidden';
        });
    }
    
    if (closeMenu) {
        closeMenu.addEventListener('click', function(e) {
            console.log('Close menu clicked');
            if (sidebarMenu) {
                sidebarMenu.classList.remove('active');
                console.log('Removed active class from sidebarMenu');
            }
            if (menuOverlay) {
                menuOverlay.classList.remove('active');
                console.log('Removed active class from menuOverlay');
            }
            document.body.style.overflow = '';
        });
    }
    
    if (menuOverlay) {
        menuOverlay.addEventListener('click', function(e) {
            console.log('Menu overlay clicked');
            if (sidebarMenu) {
                sidebarMenu.classList.remove('active');
                console.log('Removed active class from sidebarMenu');
            }
            if (menuOverlay) {
                menuOverlay.classList.remove('active');
                console.log('Removed active class from menuOverlay');
            }
            document.body.style.overflow = '';
        });
    }
    
    // Global helper functions for debugging
    window.toggleSidebar = function() {
        console.log('Manual sidebar toggle called');
        if (sidebarMenu) {
            sidebarMenu.classList.toggle('active');
            console.log('Toggled sidebarMenu');
        }
        if (menuOverlay) {
            menuOverlay.classList.toggle('active'); 
            console.log('Toggled menuOverlay');
        }
    };

    // Submenu toggle functionality
    const submenuItems = {
        'earringsLink': 'earringsSubmenu',
        'necklaceLink': 'necklaceSubmenu',
        'banglesLink': 'banglesSubmenu',
        'chainsLink': 'chainsSubmenu',
        'accessoriesLink': 'accessoriesSubmenu',
        'collectionsLink': 'collectionsSubmenu'
    };

    // Set up event listeners for each submenu toggle
    for (const linkId in submenuItems) {
        const link = document.getElementById(linkId);
        const submenuId = submenuItems[linkId];
        
        if (link) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                const submenu = document.getElementById(submenuId);
                
                // Only toggle if submenu exists
                if (submenu) {
                    submenu.classList.toggle('active');
                    
                    // Toggle icon rotation
                    const icon = this.querySelector('i');
                    if (icon) {
                        if (submenu.classList.contains('active')) {
                            icon.classList.remove('fa-chevron-right');
                            icon.classList.add('fa-chevron-down');
                        } else {
                            icon.classList.remove('fa-chevron-down');
                            icon.classList.add('fa-chevron-right');
                        }
                    }
                }
            });
        }
    }
});