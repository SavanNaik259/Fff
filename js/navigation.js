/**
 * Auric Responsive Navigation System
 * Complete rewrite with responsive design
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Navigation system initialized');
    
    // Main navigation elements
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const menuOverlay = document.getElementById('menuOverlay');
    const closeMenuBtn = document.getElementById('closeMenu');
    
    // Dropdown navigation elements
    const dropdownItems = document.querySelectorAll('.dropdown');
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    
    // Log what elements we found (for debugging)
    console.log('Navigation elements found:', {
        menuButton: navToggle ? true : false,
        closeButton: closeMenuBtn ? true : false,
        mobileMenu: navMenu ? true : false,
        menuLinks: document.querySelectorAll('.nav-link').length
    });
    
    /**
     * Toggle mobile menu open/closed
     */
    function toggleMobileMenu() {
        navToggle.classList.toggle('open');
        navMenu.classList.toggle('active');
        
        if (menuOverlay) {
            menuOverlay.classList.toggle('active');
        }
        
        // Toggle body scroll
        if (navMenu.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
            
            // Show mobile account links when menu is active
            const mobileAccountLinks = document.querySelector('.mobile-account-links');
            if (mobileAccountLinks) {
                mobileAccountLinks.style.display = 'flex';
            }
        } else {
            document.body.style.overflow = '';
        }
    }
    
    /**
     * Close mobile menu
     */
    function closeMobileMenu() {
        navToggle.classList.remove('open');
        navMenu.classList.remove('active');
        
        if (menuOverlay) {
            menuOverlay.classList.remove('active');
        }
        
        // Restore body scroll
        document.body.style.overflow = '';
        
        // Hide mobile account links when menu is closed
        const mobileAccountLinks = document.querySelector('.mobile-account-links');
        if (mobileAccountLinks) {
            // Hide only on mobile viewport
            if (window.innerWidth <= 991) {
                mobileAccountLinks.style.display = 'none';
            }
        }
    }
    
    /**
     * Toggle dropdown menus on mobile
     */
    function toggleDropdown(e) {
        // Only apply for mobile view
        if (window.innerWidth <= 991) {
            e.preventDefault();
            
            const dropdown = this.closest('.dropdown');
            
            // Close all other dropdowns first
            document.querySelectorAll('.dropdown.active').forEach(item => {
                if (item !== dropdown) {
                    item.classList.remove('active');
                }
            });
            
            // Toggle active class on dropdown
            dropdown.classList.toggle('active');
        }
    }
    
    // Event listeners
    if (navToggle) {
        navToggle.addEventListener('click', toggleMobileMenu);
    }
    
    if (menuOverlay) {
        menuOverlay.addEventListener('click', closeMobileMenu);
    }
    
    // Close button event listener
    if (closeMenuBtn) {
        closeMenuBtn.addEventListener('click', closeMobileMenu);
    }
    
    // Add click events to dropdown toggles for mobile
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', toggleDropdown);
    });
    
    // Close navMenu when clicking a nav link on mobile
    const navLinks = document.querySelectorAll('.nav-link:not(.dropdown-toggle)');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 991) {
                closeMobileMenu();
            }
        });
    });
    
    // Handle window resize - reset mobile menu state on desktop
    window.addEventListener('resize', function() {
        if (window.innerWidth > 991) {
            navMenu.classList.remove('active');
            menuOverlay.classList.remove('active');
            navToggle.classList.remove('open');
            document.body.style.overflow = '';
            
            // Reset all dropdown states
            dropdownItems.forEach(item => {
                item.classList.remove('active');
            });
        }
    });
});