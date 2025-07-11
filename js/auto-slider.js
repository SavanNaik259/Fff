// Improved slider with fade transitions
/*
document.addEventListener('DOMContentLoaded', function() {
    console.log('Auto-slider script loaded and executing');
    
    // Get all slides and dots
    const slides = document.querySelectorAll('.hero-slider .slide');
    const dots = document.querySelectorAll('.hero-slider .slider-dot');
    let currentSlide = 0;
    let slideInterval;
    
    console.log('Found ' + slides.length + ' slides and ' + dots.length + ' dots');
    
    // Function to show a specific slide
    function showSlide(index) {
        console.log('Showing slide ' + index);
        
        // Make all slides use opacity transition
        for (let i = 0; i < slides.length; i++) {
            // First reset display for all slides, so we can use opacity transition
            slides[i].style.display = 'block';
            
            // Remove active class from dots
            if (dots[i]) {
                dots[i].classList.remove('active');
            }
        }
        
        // Wait a tiny bit for the display:block to take effect
        setTimeout(() => {
            // Now transition opacity for all slides
            for (let i = 0; i < slides.length; i++) {
                // Hide all slides with a fade
                slides[i].style.opacity = '0';
                slides[i].style.zIndex = '0';
            }
            
            // Show the current slide with a fade in
            if (slides[index]) {
                slides[index].style.opacity = '1';
                slides[index].style.zIndex = '1';
            }
            
            // Set active dot
            if (dots[index]) {
                dots[index].classList.add('active');
            }
        }, 50);
    }
    
    // Function to advance to next slide
    function nextSlide() {
        currentSlide++;
        if (currentSlide >= slides.length) {
            currentSlide = 0;
        }
        console.log('Auto-advancing to slide ' + currentSlide);
        showSlide(currentSlide);
    }
    
    // Set up click handlers for dots
    for (let i = 0; i < dots.length; i++) {
        dots[i].addEventListener('click', function() {
            console.log('Dot clicked for slide ' + i);
            currentSlide = i;
            showSlide(currentSlide);
            
            // Reset the timer when a dot is clicked
            if (slideInterval) {
                clearInterval(slideInterval);
                slideInterval = setInterval(nextSlide, 3000);
            }
        });
    }
    
    // Initialize the first slide
    setTimeout(() => {
        showSlide(0);
    }, 300); // Small delay for initial load
    
    // Set up auto-sliding
    console.log('Setting up auto-slide interval');
    slideInterval = setInterval(nextSlide, 3000);
});*/