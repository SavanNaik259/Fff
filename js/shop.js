/**
 * Auric Shop Page 
 * 
 * This script handles the shop page functionality:
 * 1. Product filtering by category and availability
 * 2. Sorting products by price (low-high, high-low)
 * 3. Sorting products by newest
 * 4. Modal filter UI
 * 5. Dropdown sort UI
 */

// Wait for DOM to fully load before initializing
document.addEventListener('DOMContentLoaded', function() {
    // Initialize shop functionality
    initShop();
});

/**
 * Initialize shop page functionality
 */
function initShop() {
    // Get DOM elements
    const elements = {
        productsGrid: document.getElementById('products-grid'),
        filterOption: document.querySelector('.filter-option'),
        sortOption: document.getElementById('sortOption'),
        sortDropdown: document.getElementById('sortDropdown'),
        sortDropdownOptions: document.querySelectorAll('.sort-dropdown-option'),
        filterModal: document.querySelector('.filter-modal'),
        closeFilterModalBtn: document.getElementById('closeFilterModal') || document.querySelector('.close-filter-modal'),
        applyFilterBtn: document.getElementById('applyFilterBtn') || document.querySelector('.apply-filter-btn'),
        clearFilterBtn: document.getElementById('clearFilterBtn') || document.querySelector('.clear-filter-btn')
    };

    // Check if we're on the shop page
    if (!elements.productsGrid) {
        console.log('Not on shop page, exiting shop.js initialization');
        return;
    }

    console.log('Shop page detected, initializing shop functionality');
    
    // Check if the dropdown exists, create it if it doesn't
    if (!elements.sortDropdown) {
        console.log('Sort dropdown not found, creating one');
        elements.sortDropdown = document.createElement('div');
        elements.sortDropdown.className = 'sort-dropdown';
        elements.sortDropdown.id = 'sortDropdown';
        
        // Add options to the dropdown
        elements.sortDropdown.innerHTML = `
            <div class="sort-dropdown-option" data-sort="featured">Featured</div>
            <div class="sort-dropdown-option" data-sort="price-low-high">Price: Low to High</div>
            <div class="sort-dropdown-option" data-sort="price-high-low">Price: High to Low</div>
            <div class="sort-dropdown-option" data-sort="newest">Newest</div>
        `;
        
        // Append to the shop filter header
        const shopFilterHeader = document.querySelector('.shop-filter-header');
        if (shopFilterHeader) {
            shopFilterHeader.appendChild(elements.sortDropdown);
            console.log('Sort dropdown created and appended to shop filter header');
        }
    }

    // Store original product elements
    const originalProducts = Array.from(document.querySelectorAll('.product-item'));
    console.log('Found product items:', originalProducts.length);

    // Current filter and sort settings
    const settings = {
        category: 'all',
        availability: [],
        sortBy: 'featured'
    };

    // Setup filter button - Opens the filter modal when clicked
    if (elements.filterOption && elements.filterModal) {
        elements.filterOption.addEventListener('click', function() {
            console.log('Filter option clicked');
            elements.filterModal.classList.add('active');
        });
    }

    // Setup close filter modal button
    if (elements.closeFilterModalBtn && elements.filterModal) {
        elements.closeFilterModalBtn.addEventListener('click', function() {
            console.log('Close filter modal button clicked');
            elements.filterModal.classList.remove('active');
        });
    }

    // Setup sort dropdown toggle
    if (elements.sortOption && elements.sortDropdown) {
        console.log('Found sort option and dropdown:', elements.sortOption, elements.sortDropdown);
        
        // Direct toggle function for the sort dropdown
        function toggleSortDropdown(event) {
            if (event) {
                event.stopPropagation();
                event.preventDefault();
            }
            
            console.log('Toggle sort dropdown called');
            elements.sortOption.classList.toggle('active');
            elements.sortDropdown.classList.toggle('active');
            
            // Position the dropdown properly
            if (elements.sortDropdown.classList.contains('active')) {
                const sortRect = elements.sortOption.getBoundingClientRect();
                console.log('Sort option position:', sortRect);
                
                // Set position relative to the shop filter header
                const shopFilterHeader = document.querySelector('.shop-filter-header');
                if (shopFilterHeader) {
                    // First reset any existing styles
                    elements.sortDropdown.style.cssText = '';
                    
                    // Apply correct positioning and styling
                    elements.sortDropdown.style.position = 'absolute';
                    elements.sortDropdown.style.top = '100%';
                    elements.sortDropdown.style.right = '25px';
                    elements.sortDropdown.style.zIndex = '1000';
                    elements.sortDropdown.style.width = '200px';
                    elements.sortDropdown.style.marginTop = '5px';
                    elements.sortDropdown.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                    
                    console.log('Dropdown positioned correctly');
                }
            }
        }
        
        // Toggle dropdown when clicking sort option
        elements.sortOption.addEventListener('click', toggleSortDropdown);

        // Close dropdown when clicking outside
        document.addEventListener('click', function() {
            if (elements.sortDropdown.classList.contains('active')) {
                elements.sortOption.classList.remove('active');
                elements.sortDropdown.classList.remove('active');
            }
        });

        // Prevent dropdown from closing when clicking inside
        elements.sortDropdown.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }

    // Setup sort dropdown options
    // Re-query for dropdowns as we might have added them dynamically
    elements.sortDropdownOptions = document.querySelectorAll('.sort-dropdown-option');
    
    if (elements.sortDropdownOptions && elements.sortDropdownOptions.length > 0) {
        console.log('Setting up sort dropdown options:', elements.sortDropdownOptions.length);
        
        elements.sortDropdownOptions.forEach(option => {
            // Remove any existing click listeners first to avoid duplicates
            const oldOption = option.cloneNode(true);
            option.parentNode.replaceChild(oldOption, option);
            
            // Add click listener to the fresh option element
            oldOption.addEventListener('click', function(e) {
                e.stopPropagation(); // Prevent event bubbling
                
                const sortValue = this.getAttribute('data-sort');
                console.log('Sort option selected:', sortValue);
                
                // Update settings
                settings.sortBy = sortValue;
                
                // Update active class
                document.querySelectorAll('.sort-dropdown-option').forEach(opt => opt.classList.remove('active'));
                this.classList.add('active');
                
                // Update sort option text
                const sortText = this.textContent;
                const sortSpan = elements.sortOption.querySelector('span');
                if (sortSpan) {
                    sortSpan.textContent = sortText;
                }
                
                // Close dropdown
                elements.sortDropdown.classList.remove('active');
                elements.sortOption.classList.remove('active');
                
                // Apply filters and sort
                applyFiltersAndSort();
            });
        });
    } else {
        console.warn('No sort dropdown options found!');
    }

    // Setup apply filter button
    if (elements.applyFilterBtn && elements.filterModal) {
        elements.applyFilterBtn.addEventListener('click', function() {
            console.log('Apply filter button clicked');
            
            // Get selected category
            const categoryRadios = document.querySelectorAll('input[name="category"]');
            let selectedCategory = 'all';
            
            categoryRadios.forEach(radio => {
                if (radio.checked) {
                    selectedCategory = radio.value;
                }
            });
            
            // Get selected availability options
            const availabilityCheckboxes = document.querySelectorAll('input[name="availability"]');
            const selectedAvailability = [];
            
            availabilityCheckboxes.forEach(checkbox => {
                if (checkbox.checked) {
                    selectedAvailability.push(checkbox.value);
                }
            });
            
            // Update settings
            settings.category = selectedCategory;
            settings.availability = selectedAvailability;
            
            console.log('Updated filter settings:', settings);
            
            // Close filter modal
            elements.filterModal.classList.remove('active');
            
            // Apply filters and sort
            applyFiltersAndSort();
        });
    }

    // Setup clear filter button
    if (elements.clearFilterBtn) {
        elements.clearFilterBtn.addEventListener('click', function() {
            console.log('Clear filter button clicked');
            
            // Reset all filter inputs
            const categoryRadios = document.querySelectorAll('input[name="category"]');
            const availabilityCheckboxes = document.querySelectorAll('input[name="availability"]');
            
            // Reset category to 'all'
            categoryRadios.forEach(radio => {
                radio.checked = radio.value === 'all';
            });
            
            // Uncheck all availability options
            availabilityCheckboxes.forEach(checkbox => {
                checkbox.checked = false;
            });
            
            // Update settings
            settings.category = 'all';
            settings.availability = [];
            
            console.log('Filter settings cleared:', settings);
            
            // No need to close the modal, user will do that manually
            // by clicking Apply or the X button
        });
    }

    // Initialize shop with default view showing all products
    setTimeout(() => {
        console.log('Initializing default shop view - showing all products');
        // Initially just display all products without filtering/sorting
        displayAllProducts(originalProducts);
    }, 100);

    /**
     * Apply current filters and sorting to products
     */
    function applyFiltersAndSort() {
        console.log('Applying filters and sort with settings:', settings);
        
        // Filter products
        let filteredProducts = filterProducts(originalProducts, settings.category, settings.availability);
        console.log('Filtered products count:', filteredProducts.length);
        
        // Sort filtered products
        const sortedProducts = sortProducts(filteredProducts, settings.sortBy);
        console.log('Sorted products count:', sortedProducts.length);
        
        // Display products
        displayProducts(sortedProducts);
    }

    /**
     * Filter products by category and availability
     */
    function filterProducts(products, category, availability) {
        // First filter by category
        let filteredByCategory = products;
        
        if (category !== 'all') {
            console.log('Filtering by category:', category);
            filteredByCategory = products.filter(product => {
                return product.dataset.category === category;
            });
        }
        
        // Then filter by availability if any are selected
        if (availability && availability.length > 0) {
            console.log('Filtering by availability:', availability);
            return filteredByCategory.filter(product => {
                const badge = product.querySelector('.product-badge');
                if (!badge) return false;
                
                const badgeText = badge.textContent.trim().toLowerCase();
                
                return availability.some(option => {
                    if (option === 'ready-to-ship') {
                        return badgeText.includes('ready to ship');
                    } else if (option === 'made-to-order') {
                        return badgeText.includes('made to order');
                    }
                    return false;
                });
            });
        }
        
        return filteredByCategory;
    }

    /**
     * Sort products by selected criteria
     */
    function sortProducts(products, sortBy) {
        console.log('Sorting products by:', sortBy);
        
        const productsCopy = [...products]; // Create a copy to avoid modifying original
        
        switch (sortBy) {
            case 'price-low-high':
                return productsCopy.sort((a, b) => {
                    const priceA = parseFloat(a.dataset.price);
                    const priceB = parseFloat(b.dataset.price);
                    return priceA - priceB;
                });
                
            case 'price-high-low':
                return productsCopy.sort((a, b) => {
                    const priceA = parseFloat(a.dataset.price);
                    const priceB = parseFloat(b.dataset.price);
                    return priceB - priceA;
                });
                
            case 'newest':
                return productsCopy.sort((a, b) => {
                    const dateA = new Date(a.dataset.date);
                    const dateB = new Date(b.dataset.date);
                    return dateB - dateA; // Newest first
                });
                
            case 'featured':
            default:
                // For featured, keep original order
                return productsCopy;
        }
    }

    /**
     * Display all products in the grid without filtering
     * Used for initial page load
     */
    function displayAllProducts(products) {
        console.log('Displaying all products in grid without filtering');
        
        // Clear grid first
        elements.productsGrid.innerHTML = '';
        
        if (products.length === 0) {
            // Show no products message
            const noProducts = document.createElement('div');
            noProducts.className = 'no-results';
            noProducts.innerHTML = '<p>No products available in shop.</p>';
            elements.productsGrid.appendChild(noProducts);
            return;
        }
        
        // Add all products with animation
        products.forEach(product => {
            // Clone the node to remove any existing animation classes
            const productClone = product.cloneNode(true);
            productClone.classList.add('visible');
            
            // Re-attach event listener to wishlist button
            const wishlistBtn = productClone.querySelector('.add-to-wishlist');
            if (wishlistBtn) {
                wishlistBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // If WishlistManager exists, toggle product in wishlist
                    if (typeof WishlistManager !== 'undefined' && WishlistManager.toggleWishlistItem) {
                        WishlistManager.toggleWishlistItem(productClone.dataset.productId);
                    }
                });
            }
            
            elements.productsGrid.appendChild(productClone);
        });
        
        // Re-initialize wishlist buttons for newly added elements
        if (typeof WishlistManager !== 'undefined' && WishlistManager.updateWishlistUI) {
            setTimeout(() => {
                WishlistManager.updateWishlistUI();
            }, 100);
        }
    }

    /**
     * Display filtered/sorted products in the grid
     * Used when filters or sorting are applied
     */
    function displayProducts(products) {
        console.log('Displaying filtered/sorted products in grid');
        
        // Clear grid first
        elements.productsGrid.innerHTML = '';
        
        if (products.length === 0) {
            // Show no results message
            const noResults = document.createElement('div');
            noResults.className = 'no-results';
            noResults.innerHTML = '<p>No products match your filters. Please try different criteria.</p>';
            elements.productsGrid.appendChild(noResults);
            return;
        }
        
        // Only display a subset of products (limited to first 4 items)
        const limitedProducts = products.slice(0, 4);
        console.log(`Showing ${limitedProducts.length} products out of ${products.length} total matches`);
        
        // Add products with animation
        limitedProducts.forEach(product => {
            // Clone the node to remove any existing animation classes
            const productClone = product.cloneNode(true);
            productClone.classList.add('visible');
            
            // Re-attach event listener to wishlist button
            const wishlistBtn = productClone.querySelector('.add-to-wishlist');
            if (wishlistBtn) {
                wishlistBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // If WishlistManager exists, toggle product in wishlist
                    if (typeof WishlistManager !== 'undefined' && WishlistManager.toggleWishlistItem) {
                        WishlistManager.toggleWishlistItem(productClone.dataset.productId);
                    }
                });
            }
            
            elements.productsGrid.appendChild(productClone);
        });
        
        // If there are more products than shown, add a message
        if (products.length > limitedProducts.length) {
            const moreProductsMessage = document.createElement('div');
            moreProductsMessage.className = 'more-products-message';
            moreProductsMessage.innerHTML = `
                <p>Showing ${limitedProducts.length} out of ${products.length} matching products</p>
                <button id="showAllProductsBtn" class="show-all-btn">Show All Matching Products</button>
            `;
            elements.productsGrid.appendChild(moreProductsMessage);
            
            // Add event listener to show all button
            const showAllBtn = document.getElementById('showAllProductsBtn');
            if (showAllBtn) {
                showAllBtn.addEventListener('click', () => {
                    // Display all matching products when button is clicked
                    displayAllMatchingProducts(products);
                });
            }
        }
        
        // Re-initialize wishlist buttons for newly added elements
        if (typeof WishlistManager !== 'undefined' && WishlistManager.updateWishlistUI) {
            setTimeout(() => {
                WishlistManager.updateWishlistUI();
            }, 100);
        }
    }
    
    /**
     * Display all matching products without limitation
     * Used when user clicks "Show All" button
     */
    function displayAllMatchingProducts(products) {
        console.log('Displaying all matching products without limitation');
        
        // Clear grid first
        elements.productsGrid.innerHTML = '';
        
        // Add all matching products with animation
        products.forEach(product => {
            // Clone the node to remove any existing animation classes
            const productClone = product.cloneNode(true);
            productClone.classList.add('visible');
            
            // Re-attach event listener to wishlist button
            const wishlistBtn = productClone.querySelector('.add-to-wishlist');
            if (wishlistBtn) {
                wishlistBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // If WishlistManager exists, toggle product in wishlist
                    if (typeof WishlistManager !== 'undefined' && WishlistManager.toggleWishlistItem) {
                        WishlistManager.toggleWishlistItem(productClone.dataset.productId);
                    }
                });
            }
            
            elements.productsGrid.appendChild(productClone);
        });
        
        // Re-initialize wishlist buttons for newly added elements
        if (typeof WishlistManager !== 'undefined' && WishlistManager.updateWishlistUI) {
            setTimeout(() => {
                WishlistManager.updateWishlistUI();
            }, 100);
        }
    }

    // Add click detection to document for debugging
    document.addEventListener('click', function(e) {
        console.log('Click detected:', e.target);
    });
}