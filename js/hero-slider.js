/**
 * Hero Slider Functionality
 * Matches the exact design from RIDHI MEHRA website
 *

let currentSlideIndex = 0;
let slides, dots, totalSlides;
let autoSlideInterval;

// Declare global functions first
function changeSlide(direction) {
    if (!slides || slides.length === 0) return;
    showSlide(currentSlideIndex + direction);
    resetAutoSlide();
}

function currentSlide(slideNumber) {
    if (!slides || slides.length === 0) return;
    showSlide(slideNumber - 1);
    resetAutoSlide();
}

/**
 * Show specific slide
 * @param {number} index - Slide index to show
 *
function showSlide(index) {
    if (!slides || !dots) return;
    
    // Remove active class from all slides and dots
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    // Ensure index is within bounds
    if (index >= totalSlides) {
        currentSlideIndex = 0;
    } else if (index < 0) {
        currentSlideIndex = totalSlides - 1;
    } else {
        currentSlideIndex = index;
    }
    
    // Add active class to current slide and dot
    slides[currentSlideIndex].classList.add('active');
    if (dots[currentSlideIndex]) {
        dots[currentSlideIndex].classList.add('active');
    }
}

/**
 * Start automatic sliding
 *
function startAutoSlide() {
    autoSlideInterval = setInterval(() => {
        showSlide(currentSlideIndex + 1);
    }, 5000);
}

/**
 * Reset automatic sliding
 *
function resetAutoSlide() {
    clearInterval(autoSlideInterval);
    startAutoSlide();
}

/**
 * Initialize slider
 *
function initSlider() {
    // Initialize DOM elements
    slides = document.querySelectorAll('.slide');
    dots = document.querySelectorAll('.dot');
    totalSlides = slides.length;
    
    // Show first slide
    showSlide(0);
    
    // Start auto-slide
    startAutoSlide();
    
    // Add event listeners for keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            changeSlide(-1);
        } else if (e.key === 'ArrowRight') {
            changeSlide(1);
        }
    });
    
    // Pause auto-slide on hover
    const heroSlider = document.querySelector('.hero-slider');
    if (heroSlider) {
        heroSlider.addEventListener('mouseenter', () => {
            clearInterval(autoSlideInterval);
        });
        
        heroSlider.addEventListener('mouseleave', () => {
            startAutoSlide();
        });
    }
    
    // Add click event to shop now buttons
    const shopNowButtons = document.querySelectorAll('.shop-now-btn');
    shopNowButtons.forEach(button => {
        button.addEventListener('click', () => {
            window.location.href = 'shop.html';
        });
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initSlider);

// Make functions globally available immediately
window.changeSlide = changeSlide;
window.currentSlide = currentSlide;*/