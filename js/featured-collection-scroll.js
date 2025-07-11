/**
 * Featured Collection Scroll Arrows
 * Handles smooth scrolling for the featured collection section
 */

document.addEventListener('DOMContentLoaded', function() {
    const leftArrow = document.getElementById('featuredScrollLeft');
    const rightArrow = document.getElementById('featuredScrollRight');
    const container = document.getElementById('featuredProductContainer');

    console.log('Featured collection elements:', {
        leftArrow: leftArrow,
        rightArrow: rightArrow,
        container: container
    });

    if (!leftArrow || !rightArrow || !container) {
        console.log('Missing elements for featured collection arrows');
        return; // Exit if elements don't exist
    }

    console.log('Featured collection arrows initialized successfully');

    // Calculate scroll amount based on container width
    function getScrollAmount() {
        const containerWidth = container.clientWidth;
        const itemWidth = 275; // Approximate item width including margin
        const visibleItems = Math.floor(containerWidth / itemWidth);
        // Scroll by exactly one screen width for better UX
        return containerWidth * 0.8; // Scroll 80% of container width
    }

    // Smooth scroll function
    function smoothScroll(element, targetScrollLeft, duration = 400) {
        const startScrollLeft = element.scrollLeft;
        const distance = targetScrollLeft - startScrollLeft;
        const startTime = performance.now();

        function animation(currentTime) {
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            
            // Ease-out function for smooth animation
            const easeOut = 1 - Math.pow(1 - progress, 3);
            
            element.scrollLeft = startScrollLeft + (distance * easeOut);
            
            if (progress < 1) {
                requestAnimationFrame(animation);
            }
        }
        
        requestAnimationFrame(animation);
    }

    // Left arrow click handler
    leftArrow.addEventListener('click', function() {
        const scrollAmount = getScrollAmount();
        const newScrollPosition = Math.max(0, container.scrollLeft - scrollAmount);
        smoothScroll(container, newScrollPosition);
    });

    // Right arrow click handler
    rightArrow.addEventListener('click', function() {
        const scrollAmount = getScrollAmount();
        const maxScroll = container.scrollWidth - container.clientWidth;
        const newScrollPosition = Math.min(maxScroll, container.scrollLeft + scrollAmount);
        smoothScroll(container, newScrollPosition);
    });

    // Update arrow visibility based on scroll position
    function updateArrowVisibility() {
        const scrollLeft = container.scrollLeft;
        const maxScroll = container.scrollWidth - container.clientWidth;
        
        // Show/hide left arrow
        if (scrollLeft <= 0) {
            leftArrow.style.opacity = '0.5';
            leftArrow.style.cursor = 'default';
        } else {
            leftArrow.style.opacity = '1';
            leftArrow.style.cursor = 'pointer';
        }
        
        // Show/hide right arrow
        if (scrollLeft >= maxScroll) {
            rightArrow.style.opacity = '0.5';
            rightArrow.style.cursor = 'default';
        } else {
            rightArrow.style.opacity = '1';
            rightArrow.style.cursor = 'pointer';
        }
    }

    // Listen for scroll events to update arrow visibility
    container.addEventListener('scroll', updateArrowVisibility);
    
    // Listen for window resize to recalculate
    window.addEventListener('resize', updateArrowVisibility);
    
    // Initial arrow visibility update
    setTimeout(updateArrowVisibility, 100);

    // Enable native touch scrolling by ensuring proper CSS is applied
    container.style.webkitOverflowScrolling = 'touch';
    container.style.scrollBehavior = 'smooth';
});