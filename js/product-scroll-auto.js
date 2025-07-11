
/**
 * Auto-scroll Product Category Section
 * Automatically scrolls the product category section to center the second product card
 */

document.addEventListener('DOMContentLoaded', function() {
    // Wait for content to load before scrolling
    setTimeout(function() {
        autoScrollProductCategory();
    }, 1000); // Increased timeout to ensure all content is loaded
});

// Also try when window is fully loaded
window.addEventListener('load', function() {
    setTimeout(function() {
        autoScrollProductCategory();
    }, 500);
});

function autoScrollProductCategory() {
    const productScrollContainer = document.querySelector('.you-may-also-like .product-scroll-container');
    
    if (!productScrollContainer) {
        console.log('Product scroll container not found');
        return;
    }

    const productItems = productScrollContainer.querySelectorAll('.product-item');
    
    if (productItems.length < 3) {
        console.log('Not enough products to scroll - found:', productItems.length);
        return;
    }

    console.log('Starting auto-scroll for product category section');

    // Calculate scroll position to show 2 products scrolled past
    const firstProduct = productItems[0];
    const secondProduct = productItems[1];
    
    if (firstProduct && secondProduct) {
        // Ensure elements are rendered before calculating dimensions
        setTimeout(() => {
            const firstProductWidth = firstProduct.offsetWidth;
            const secondProductWidth = secondProduct.offsetWidth;
            
            console.log('First product width:', firstProductWidth);
            console.log('Second product width:', secondProductWidth);
            
            if (firstProductWidth === 0 || secondProductWidth === 0) {
                console.log('Product dimensions not ready, retrying...');
                setTimeout(autoScrollProductCategory, 500);
                return;
            }
            
            // Calculate gap between products
            const containerStyles = window.getComputedStyle(productScrollContainer);
            const gap = parseInt(containerStyles.gap) || 5; // Default gap from CSS
            
            // Calculate scroll position to center the second product card
            const containerWidth = productScrollContainer.clientWidth;
            
            // Responsive calculation based on screen size
            let scrollAmount;
            if (containerWidth <= 480) {
                // Small mobile devices - show more of the second product
                scrollAmount = firstProductWidth + gap + (secondProductWidth * 0.73);
            } else if (containerWidth <= 768) {
                // Medium mobile devices and tablets
                scrollAmount = firstProductWidth + gap + (secondProductWidth * 0.67);
            } else {
                // Desktop - your original calculation works fine
                scrollAmount = firstProductWidth + gap + (secondProductWidth / 0);
            }
            
            console.log('Container width:', containerWidth);
            console.log('Device type:', containerWidth <= 480 ? 'Small mobile' : containerWidth <= 768 ? 'Medium mobile' : 'Desktop');
            console.log('Calculated scroll amount:', scrollAmount);
            
            // Smooth scroll to the calculated position
            productScrollContainer.scrollTo({
                left: Math.max(0, scrollAmount),
                behavior: 'smooth'
            });
            
            console.log('Auto-scrolled product category section to center second product');
        }, 100);
    }
}
