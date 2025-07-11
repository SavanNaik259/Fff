// Simple Slider Script
document.addEventListener('DOMContentLoaded', function() {
    // Get all slides and dots
    const slides = document.querySelectorAll('.hero-slider .slide');
    const dots = document.querySelectorAll('.hero-slider .slider-dot');
    let currentSlide = 0;
    
    // Function to show a specific slide
    function showSlide(n) {
        // Hide all slides
        for (let i = 0; i < slides.length; i++) {
            slides[i].classList.remove('active');
            dots[i].classList.remove('active');
        }
        
        // Show the specific slide
        slides[n].classList.add('active');
        dots[n].classList.add('active');
    }
    
    // Function to advance to the next slide
    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }
    
    // Start auto-sliding
    setInterval(nextSlide, 3000);
    
    // Add click events to dots
    for (let i = 0; i < dots.length; i++) {
        dots[i].addEventListener('click', function() {
            currentSlide = i;
            showSlide(currentSlide);
        });
    }
    
    // Initialize the slider
    showSlide(0);
    
    console.log("Slider initialized with " + slides.length + " slides");
});