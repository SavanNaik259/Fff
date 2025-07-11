/**
 * Product Gallery - Thumbnail Image Gallery Functionality
 * Allows users to click on thumbnail images to change the main product image
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get all thumbnail elements
    const thumbnails = document.querySelectorAll('.thumbnail');
    const mainImage = document.querySelector('.main-product-image');
    
    if (thumbnails.length > 0 && mainImage) {
        // Add click event listener to each thumbnail
        thumbnails.forEach(thumbnail => {
            thumbnail.addEventListener('click', function() {
                // Remove active class from all thumbnails
                thumbnails.forEach(thumb => thumb.classList.remove('active'));
                
                // Add active class to the clicked thumbnail
                this.classList.add('active');
                
                // Get the image path from the data attribute
                const imagePath = this.getAttribute('data-image');
                
                // Update the main image source
                mainImage.src = imagePath;
                
                // Add a subtle animation to show the image is changing
                mainImage.style.opacity = '0.7';
                setTimeout(() => {
                    mainImage.style.opacity = '1';
                }, 200);
            });
        });
        
        // Add hover effect for better user experience
        thumbnails.forEach(thumbnail => {
            thumbnail.addEventListener('mouseenter', function() {
                if (!this.classList.contains('active')) {
                    this.style.transform = 'scale(1.05)';
                    this.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                }
            });
            
            thumbnail.addEventListener('mouseleave', function() {
                if (!this.classList.contains('active')) {
                    this.style.transform = 'scale(1)';
                    this.style.boxShadow = 'none';
                }
            });
        });
        
        console.log('Product gallery thumbnail functionality initialized');
    }
});