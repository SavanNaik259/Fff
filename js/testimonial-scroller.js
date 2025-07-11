/**
 * Auric Video Player Functionality
 * 
 * This script adds functionality to video sections:
 * 1. Buy and Watch video section
 * 2. Customer Testimonials section
 * with custom play button controls and ensuring only one video plays at a time
 */

document.addEventListener('DOMContentLoaded', function() {
    initBuyAndWatchVideos();
    initCustomerTestimonialVideos();
});

function initBuyAndWatchVideos() {
    const scrollContainer = document.querySelector('.testimonials-scroll');
    
    // Exit if the container doesn't exist on this page
    if (!scrollContainer) return;
    
    const videoContainers = scrollContainer.querySelectorAll('.video-container');
    const videos = scrollContainer.querySelectorAll('.testimonial-video');
    
    // Navigation buttons removed - using natural scroll behavior
    
    // Add scroll focus detection for video transitions
    const addScrollFocusEffect = () => {
        const observerOptions = {
            root: scrollContainer,
            rootMargin: '0px',
            threshold: 0.7 // Video needs to be 70% visible to be considered "in focus"
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const videoItem = entry.target;
                if (entry.isIntersecting && entry.intersectionRatio >= 0.7) {
                    // Video is in focus
                    videoItem.classList.add('in-focus');
                } else {
                    // Video is out of focus
                    videoItem.classList.remove('in-focus');
                }
            });
        }, observerOptions);
        
        // Observe all video items
        const videoItems = scrollContainer.querySelectorAll('.testimonial-item');
        videoItems.forEach(item => {
            observer.observe(item);
        });
    };
    
    // Initialize scroll focus effect
    addScrollFocusEffect();
    
    // Initially center the second video
    setTimeout(() => {
        const videoItems = scrollContainer.querySelectorAll('.testimonial-item');
        if (videoItems.length >= 2) {
            const secondVideo = videoItems[1];
            const containerCenter = scrollContainer.clientWidth / 2;
            const videoCenter = secondVideo.offsetLeft + (secondVideo.offsetWidth / 2);
            const scrollPosition = videoCenter - containerCenter;
            
            scrollContainer.scrollTo({
                left: scrollPosition,
                behavior: 'smooth'
            });
            console.log('Initially centering second video at position:', scrollPosition);
        }
    }, 500); // Short delay to ensure elements are rendered
    
    // Set up play button functionality
    videoContainers.forEach((container, index) => {
        const video = container.querySelector('.testimonial-video');
        const playButton = container.querySelector('.play-button');
        const playButtonOverlay = container.querySelector('.play-button-overlay');
        
        // Add initial transition setup
        container.classList.remove('playing');
        
        // Click on play button or video container plays the video
        container.addEventListener('click', function(e) {
            // Don't trigger if clicking on the link icon
            if (e.target.closest('.video-link-icon')) return;
            
            if (video.paused) {
                // First pause all other videos and remove playing class
                videos.forEach(v => {
                    if (v !== video && !v.paused) {
                        v.pause();
                        // Show play button on other videos
                        v.closest('.video-container').querySelector('.play-button-overlay').style.display = 'flex';
                        // Remove playing class
                        v.closest('.video-container').classList.remove('playing');
                    }
                });
                
                // Add playing class with smooth transition
                container.classList.add('playing');
                
                // Then play this video
                video.play();
                // Hide play button when playing
                playButtonOverlay.style.display = 'none';
            } else {
                // Pause the video
                video.pause();
                // Show play button when paused
                playButtonOverlay.style.display = 'flex';
                // Remove playing class
                container.classList.remove('playing');
            }
        });
        
        // When video ends, show play button again
        video.addEventListener('ended', function() {
            playButtonOverlay.style.display = 'flex';
        });
        
        // Make testimonial videos play one at a time
        video.addEventListener('play', function() {
            // Hide play button when playing
            playButtonOverlay.style.display = 'none';
            
            // Pause all other videos
            videos.forEach(v => {
                if (v !== video && !v.paused) {
                    v.pause();
                    // Show play button on other videos
                    v.closest('.video-container').querySelector('.play-button-overlay').style.display = 'flex';
                }
            });
        });
        
        // Show play button when video is paused
        video.addEventListener('pause', function() {
            playButtonOverlay.style.display = 'flex';
        });
    });
}

function initCustomerTestimonialVideos() {
    const scrollContainer = document.querySelector('.customer-testimonials-scroll');
    
    // Exit if the container doesn't exist on this page
    if (!scrollContainer) return;
    
    const videoContainers = scrollContainer.querySelectorAll('.video-container');
    const videos = scrollContainer.querySelectorAll('.testimonial-video');
    
    // Navigation buttons removed - using swipe gestures only
    
    // Get all testimonial items
    let currentIndex = 0;
    const getTestimonialItems = () => scrollContainer.querySelectorAll('.customer-testimonial-item');
    
    // Function to scroll to specific testimonial with precise positioning
    const scrollToTestimonial = (index) => {
        const items = getTestimonialItems();
        if (index >= 0 && index < items.length) {
            const targetItem = items[index];
            const containerWidth = scrollContainer.clientWidth;
            const itemWidth = targetItem.offsetWidth;
            const gap = 20;
            
            // Calculate exact center position
            const itemLeft = targetItem.offsetLeft;
            const scrollPosition = itemLeft - (containerWidth / 2) + (itemWidth / 2);
            
            // Use immediate positioning to prevent multiple scrolls
            scrollContainer.style.scrollBehavior = 'auto';
            scrollContainer.scrollLeft = Math.max(0, scrollPosition);
            
            // Re-enable smooth scrolling after positioning
            setTimeout(() => {
                scrollContainer.style.scrollBehavior = 'smooth';
            }, 50);
            
            currentIndex = index;
        }
    };
    
    // Disable default scroll behavior completely and handle all touch events manually
    let startX = 0;
    let startY = 0;
    let isSwipeDetected = false;
    let swipeThreshold = 30; // Minimum distance for swipe
    let isProcessingSwipe = false;
    
    // Disable native scrolling
    scrollContainer.style.overflowX = 'hidden';
    
    scrollContainer.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        isSwipeDetected = false;
        isProcessingSwipe = false;
    }, { passive: true });
    
    scrollContainer.addEventListener('touchmove', (e) => {
        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;
        const diffX = Math.abs(currentX - startX);
        const diffY = Math.abs(currentY - startY);
        
        // Check if this is a horizontal swipe
        if (diffX > diffY && diffX > 10) {
            e.preventDefault(); // Prevent any default scrolling
            isSwipeDetected = true;
        }
    }, { passive: false });
    
    scrollContainer.addEventListener('touchend', (e) => {
        if (!isSwipeDetected || isProcessingSwipe) return;
        
        const endX = e.changedTouches[0].clientX;
        const diffX = startX - endX;
        
        // Check if swipe distance meets threshold
        if (Math.abs(diffX) > swipeThreshold) {
            isProcessingSwipe = true;
            const items = getTestimonialItems();
            
            if (diffX > 0 && currentIndex < items.length - 1) {
                // Swiped left - go to next video
                scrollToTestimonial(currentIndex + 1);
            } else if (diffX < 0 && currentIndex > 0) {
                // Swiped right - go to previous video
                scrollToTestimonial(currentIndex - 1);
            }
            
            // Reset processing flag after animation completes
            setTimeout(() => {
                isProcessingSwipe = false;
            }, 500);
        }
        
        isSwipeDetected = false;
    }, { passive: true });
    
    // Also disable mouse wheel scrolling for consistency
    scrollContainer.addEventListener('wheel', (e) => {
        e.preventDefault();
        
        if (isProcessingSwipe) return;
        
        isProcessingSwipe = true;
        const items = getTestimonialItems();
        
        if (e.deltaX > 0 && currentIndex < items.length - 1) {
            // Scroll right - go to next video
            scrollToTestimonial(currentIndex + 1);
        } else if (e.deltaX < 0 && currentIndex > 0) {
            // Scroll left - go to previous video
            scrollToTestimonial(currentIndex - 1);
        }
        
        setTimeout(() => {
            isProcessingSwipe = false;
        }, 500);
    }, { passive: false });
    
    // Initial scroll position - center on the first video
    setTimeout(() => {
        scrollToTestimonial(0);
    }, 300);
    
    // Navigation is now handled purely through swipe gestures
    // Track current position for scroll snap behavior
    let scrollTimeout;
    scrollContainer.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            // Find which testimonial is most visible
            const items = getTestimonialItems();
            const containerLeft = scrollContainer.scrollLeft;
            const containerCenter = containerLeft + scrollContainer.clientWidth / 2;
            
            let closestIndex = 0;
            let closestDistance = Infinity;
            
            items.forEach((item, index) => {
                const itemCenter = item.offsetLeft + item.offsetWidth / 2;
                const distance = Math.abs(containerCenter - itemCenter);
                
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestIndex = index;
                }
            });
            
            currentIndex = closestIndex;
        }, 100);
    });
    
    // Set up play button functionality
    videoContainers.forEach((container, index) => {
        const video = container.querySelector('.testimonial-video');
        const playButton = container.querySelector('.customer-play-button');
        const playButtonOverlay = container.querySelector('.play-button-overlay');
        
        // Click on play button or video container plays the video
        container.addEventListener('click', function(e) {
            if (video.paused) {
                // First pause all other videos
                videos.forEach(v => {
                    if (v !== video && !v.paused) {
                        v.pause();
                        // Show play button on other videos
                        v.closest('.video-container').querySelector('.play-button-overlay').style.display = 'flex';
                    }
                });
                
                // Then play this video
                video.play();
                // Hide play button when playing
                playButtonOverlay.style.display = 'none';
            } else {
                // Pause the video
                video.pause();
                // Show play button when paused
                playButtonOverlay.style.display = 'flex';
            }
        });
        
        // When video ends, show play button again
        video.addEventListener('ended', function() {
            playButtonOverlay.style.display = 'flex';
        });
        
        // Make testimonial videos play one at a time
        video.addEventListener('play', function() {
            // Hide play button when playing
            playButtonOverlay.style.display = 'none';
            
            // Pause all other videos
            videos.forEach(v => {
                if (v !== video && !v.paused) {
                    v.pause();
                    // Show play button on other videos
                    v.closest('.video-container').querySelector('.play-button-overlay').style.display = 'flex';
                }
            });
        });
        
        // Show play button when video is paused
        video.addEventListener('pause', function() {
            playButtonOverlay.style.display = 'flex';
        });
    });
}