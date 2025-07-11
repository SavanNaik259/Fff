// Banner rotator script
document.addEventListener('DOMContentLoaded', function() {
    console.log('Banner rotator script loaded');
    
    // Banner content options
    const bannerTexts = [
        'Save 21% on exclusive selections - <a href="#">Shop Now</a>',
        'Free shipping on orders over ₹5000 - <a href="#">Learn More</a>',
        'New arrivals for the festive season - <a href="#">View Collection</a>'
    ];
    
    // Elements
    const bannerText = document.querySelector('.promo-banner p');
    const prevButton = document.querySelector('.banner-prev');
    const nextButton = document.querySelector('.banner-next');
    
    let currentBannerIndex = 0;
    
    // Function to display a specific banner with fade transition
    function showBanner(index) {
        console.log('Showing banner ' + index);
        
        // Fade out
        bannerText.classList.add('fade-out');
        
        // Wait for fade out to complete then change text and fade in
        setTimeout(function() {
            bannerText.innerHTML = bannerTexts[index];
            
            // Force reflow to ensure the fade-in animation works
            void bannerText.offsetWidth;
            
            // Fade in
            bannerText.classList.remove('fade-out');
            bannerText.classList.add('fade-in');
            
            console.log('Banner content updated to: ' + index);
        }, 300);
    }
    
    // Function to display the next banner
    function nextBanner() {
        currentBannerIndex = (currentBannerIndex + 1) % bannerTexts.length;
        showBanner(currentBannerIndex);
    }
    
    // Function to display the previous banner
    function prevBanner() {
        currentBannerIndex = (currentBannerIndex - 1 + bannerTexts.length) % bannerTexts.length;
        showBanner(currentBannerIndex);
    }
    
    // Add event listeners to the buttons
    if (prevButton) {
        prevButton.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Prev banner button clicked');
            prevBanner();
        });
    }
    
    if (nextButton) {
        nextButton.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Next banner button clicked');
            nextBanner();
        });
    }
    
    // Auto-rotate the banner every 5 seconds
    let bannerInterval = setInterval(nextBanner, 5000);
    
    console.log('Banner auto-rotation set up');
    
    // Set initial opacity
    bannerText.classList.add('fade-in');
    
    // Show the first banner after a slight delay for the page to load
    setTimeout(function() {
        showBanner(0);
    }, 500);
});