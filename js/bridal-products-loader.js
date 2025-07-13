
/**
 * Bridal Products Loader
 * Dynamically loads products EXCLUSIVELY from Firebase Cloud Storage
 */

const BridalProductsLoader = (function() {
    let storage;
    let isInitialized = false;
    let cachedProducts = null;
    let lastFetchTime = 0;
    const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes cache for better optimization
    const MAX_PRODUCTS_TO_FETCH = 6; // Limit products fetched

    /**
     * Initialize Firebase Storage connection
     */
    function init() {
        try {
            console.log('Initializing Bridal Products Loader...');
            console.log('Firebase available:', typeof firebase !== 'undefined');

            if (typeof firebase !== 'undefined') {
                console.log('Firebase object:', firebase);
                console.log('Firebase apps:', firebase.apps);

                storage = firebase.storage();
                console.log('Storage instance:', storage);

                isInitialized = true;
                console.log('Bridal Products Loader initialized successfully');
                return true;
            } else {
                console.error('Firebase not available - make sure Firebase scripts are loaded');
                return false;
            }
        } catch (error) {
            console.error('Error initializing Bridal Products Loader:', error);
            console.error('Error details:', {
                message: error.message,
                code: error.code,
                stack: error.stack
            });
            return false;
        }
    }

    /**
     * Load bridal products EXCLUSIVELY from Firebase Cloud Storage
     */
    async function loadBridalProducts(forceRefresh = false) {
        if (!isInitialized) {
            console.error('Bridal Products Loader not initialized - Firebase connection failed');
            return [];
        }

        // Check memory cache first
        const now = Date.now();
        if (!forceRefresh && cachedProducts && (now - lastFetchTime) < CACHE_DURATION) {
            console.log('Using memory cached bridal products');
            return cachedProducts;
        }

        // Check localStorage cache
        if (!forceRefresh) {
            try {
                const stored = localStorage.getItem('bridalProducts');
                const storedTime = localStorage.getItem('bridalProductsTime');
                if (stored && storedTime && (now - parseInt(storedTime)) < CACHE_DURATION) {
                    console.log('Using localStorage cached bridal products');
                    cachedProducts = JSON.parse(stored);
                    lastFetchTime = parseInt(storedTime);
                    return cachedProducts;
                }
            } catch (e) {
                console.warn('Error reading from localStorage cache:', e);
            }
        }

        let products = [];

        try {
            // Load products EXCLUSIVELY from Firebase Cloud Storage via server endpoint
            console.log('Loading bridal products from Cloud Storage via server...');
            
            // Use different endpoint for Netlify vs local development
            const apiEndpoint = window.location.hostname.includes('netlify') || window.location.hostname.includes('.app') 
                ? '/.netlify/functions/load-products-bridal'
                : '/api/load-products/bridal';
            
            const response = await fetch(apiEndpoint, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                cache: 'default' // Use browser's default caching behavior
            });
            
            if (!response.ok) {
                throw new Error(`Server error: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            if (!data.success) {
                console.error('Server returned error:', data.error);
                console.error('Error message:', data.message);
                
                // Check if this is a Firebase configuration error on Netlify
                if (data.error && data.error.includes('Firebase Admin not configured')) {
                    console.error('NETLIFY DEPLOYMENT ISSUE: Firebase Admin credentials not set up');
                    console.error('Please check NETLIFY_DEPLOYMENT_FIX.md for setup instructions');
                }
                
                products = data.products || [];
                
                // If no products and there's an error, show a helpful message
                if (products.length === 0 && data.error) {
                    console.error('No products loaded due to error:', data.error);
                }
            } else {
                products = data.products || [];
            }
            console.log('Successfully loaded products via server:', products.length);
            
            // Validate and filter products
            products = products.filter(product => {
                const isValid = product.name && product.price && product.image;
                if (!isValid) {
                    console.warn('Skipping invalid product from Storage:', product);
                }
                return isValid;
            });
            
            // Limit products if needed
            if (products.length > MAX_PRODUCTS_TO_FETCH) {
                products = products.slice(0, MAX_PRODUCTS_TO_FETCH);
            }

            // Cache the results in memory and localStorage
            cachedProducts = products;
            lastFetchTime = now;

            try {
                localStorage.setItem('bridalProducts', JSON.stringify(products));
                localStorage.setItem('bridalProductsTime', now.toString());
            } catch (e) {
                console.warn('Error saving to localStorage cache:', e);
            }

            console.log('Final product count loaded:', products.length);
            return products;
            
        } catch (error) {
            console.error('Error loading bridal products:', error);
            console.error('Error details:', {
                message: error.message,
                code: error.code,
                stack: error.stack
            });
            return [];
        }
    }

    /**
     * Generate HTML for a product item
     */
    function generateProductHTML(product) {
        const formattedPrice = new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0
        }).format(product.price);

        return `
            <div class="arrival-item bridal-card" data-product-id="${product.id}">
                <a href="#" style="text-decoration: none; color: inherit;">
                    <div class="arrival-image">
                        <img src="${product.image}" alt="${product.name}" loading="lazy">
                        <button class="add-to-wishlist"><i class="far fa-heart"></i></button>
                    </div>
                    <div class="arrival-details">
                        <h3 class="arrival-title">${product.name}</h3>
                        <div class="product-pricing">
                            <span class="current-price">${formattedPrice}</span>
                        </div>
                    </div>
                </a>
            </div>
        `;
    }

    /**
     * Update the Bridal Edit section with loaded products
     */
    async function updateBridalSection() {
        const bridalGrid = document.querySelector('.bridal-edit .arrivals-grid');

        if (!bridalGrid) {
            console.warn('Bridal grid element not found');
            return;
        }

        try {
            // Show loading state without clearing existing products
            const existingLoadingMsg = bridalGrid.querySelector('.loading-products');
            if (!existingLoadingMsg) {
                const loadingDiv = document.createElement('div');
                loadingDiv.className = 'loading-products';
                loadingDiv.style.cssText = `
                    grid-column: 1 / -1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 60px 20px;
                    text-align: center;
                    color: #5a3f2a;
                    font-family: 'Lato', sans-serif;
                `;
                loadingDiv.innerHTML = `
                    <div class="loading-spinner" style="
                        width: 40px;
                        height: 40px;
                        border: 3px solid #f3f3f3;
                        border-top: 3px solid #5a3f2a;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                        margin-bottom: 15px;
                    "></div>
                    <p style="margin: 0; font-size: 16px; font-weight: 500;">Loading Products...</p>
                    <style>
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                    </style>
                `;
                bridalGrid.insertBefore(loadingDiv, bridalGrid.firstChild);
            }

            // Load products from Firebase
            const products = await loadBridalProducts();

            // Remove loading indicator
            const loadingElements = bridalGrid.querySelectorAll('.loading-products');
            loadingElements.forEach(el => el.remove());

            if (products.length > 0) {
                // Firebase products found - show only these
                console.log('Firebase products found, showing only Firebase products');
                const firebaseProductsHTML = products.map(product => generateProductHTML(product)).join('');
                bridalGrid.innerHTML = firebaseProductsHTML;
            } else {
                // No Firebase products found - show message
                console.log('No products found in Firebase');
                
                // Check if we're on Netlify and show appropriate message
                const isNetlify = window.location.hostname.includes('netlify') || window.location.hostname.includes('.app');
                const messageText = isNetlify 
                    ? 'If you recently deployed to Netlify, please ensure Firebase Admin credentials are configured in your Netlify environment variables.'
                    : 'Products will appear here once they are added through the admin panel.';
                
                bridalGrid.innerHTML = `
                    <div class="no-products-message" style="grid-column: 1 / -1; text-align: center; padding: 40px 20px;">
                        <i class="fas fa-gem" style="font-size: 48px; color: #5a3f2a; margin-bottom: 20px;"></i>
                        <h3 style="color: #5a3f2a; margin-bottom: 10px;">No Products Available</h3>
                        <p style="color: #666;">${messageText}</p>
                    </div>
                `;
            }

            // Reinitialize any event listeners if needed
            if (window.reinitializeProductEvents) {
                window.reinitializeProductEvents();
            }

            console.log('Bridal section updated with', products.length, 'products');
        } catch (error) {
            console.error('Error updating bridal section:', error);
            console.error('Error details:', {
                message: error.message,
                code: error.code,
                stack: error.stack
            });

            // Show detailed error message
            const loadingElements = bridalGrid.querySelectorAll('.loading-products');
            loadingElements.forEach(el => el.remove());

            const existingErrorMsg = bridalGrid.querySelector('.loading-error');
            if (!existingErrorMsg) {
                const errorDiv = document.createElement('div');
                errorDiv.className = 'loading-error';
                errorDiv.style.cssText = 'color: red; padding: 10px; margin: 10px; border: 1px solid red; background: #ffe6e6;';
                errorDiv.innerHTML = `
                    <strong>Error loading bridal products:</strong><br>
                    ${error.message}<br>
                    <small>Check console for details. Showing default collection.</small>
                `;
                bridalGrid.insertBefore(errorDiv, bridalGrid.firstChild);
            }
        }
    }

    /**
     * Clear cached products (useful after adding/editing products)
     */
    function clearCache() {
        cachedProducts = null;
        lastFetchTime = 0;
        try {
            localStorage.removeItem('bridalProducts');
            localStorage.removeItem('bridalProductsTime');
        } catch (e) {
            console.warn('Error clearing localStorage cache:', e);
        }
        console.log('Bridal products cache cleared');
    }

    // Public API
    return {
        init,
        loadBridalProducts,
        updateBridalSection,
        clearCache
    };
})();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for Firebase to initialize
    setTimeout(() => {
        if (BridalProductsLoader.init()) {
            // Force refresh to bypass any cache issues
            BridalProductsLoader.loadBridalProducts(true).then(products => {
                console.log('Initial load completed with', products.length, 'products');
                BridalProductsLoader.updateBridalSection();
            }).catch(error => {
                console.error('Initial load failed:', error);
                BridalProductsLoader.updateBridalSection();
            });
        }
    }, 1000);
});
