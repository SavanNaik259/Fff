document.addEventListener('DOMContentLoaded', function() {
    console.log('Mobile menu initialized');
    
    // Elements
    const menuButton = document.getElementById('menuButton');
    const closeButton = document.getElementById('closeButton');
    const mobileMenu = document.getElementById('mobileMenu');
    const menuItems = document.querySelectorAll('.has-submenu');
    
    console.log('Menu elements found:', {
        menuButton: !!menuButton,
        closeButton: !!closeButton,
        mobileMenu: !!mobileMenu,
        menuItemsCount: menuItems.length
    });
    
    // Open menu function
    function openMenu() {
        console.log('Opening mobile menu');
        if (mobileMenu) {
            mobileMenu.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
    
    // Close menu function
    function closeMenu() {
        console.log('Closing mobile menu');
        if (mobileMenu) {
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
    
    // Toggle submenu function
    function toggleSubmenu(e) {
        e.preventDefault();
        
        // Find the submenu element
        const submenu = this.nextElementSibling;
        const submenuId = this.getAttribute('data-submenu');
        console.log('Toggling submenu:', submenuId);
        
        if (submenu && submenu.classList.contains('submenu')) {
            // Toggle this submenu
            submenu.classList.toggle('active');
            
            // Toggle active class on the parent link
            this.classList.toggle('active');
            
            // Update the chevron icon
            const icon = this.querySelector('i');
            if (icon) {
                if (submenu.classList.contains('active')) {
                    icon.classList.remove('fa-chevron-right');
                    icon.classList.add('fa-chevron-minus');
                } else {
                    icon.classList.remove('fa-chevron-minus');
                    icon.classList.add('fa-chevron-right');
                }
            }
        }
    }
    
    // Add click event to menu button
    if (menuButton) {
        menuButton.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Menu button clicked');
            openMenu();
        });
    }
    
    // Add click event to close button
    if (closeButton) {
        closeButton.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Close button clicked');
            closeMenu();
        });
    }
    
    // Add click events to menu items with submenus
    menuItems.forEach(item => {
        item.addEventListener('click', toggleSubmenu);
    });
    
    // Make functions available globally - useful for inline onClick handlers if needed
    window.openMobileMenu = openMenu;
    window.closeMobileMenu = closeMenu;
    
    // Remove any old handlers that might be causing conflicts
    if (window.openNav) {
        console.log('Removing old openNav handler');
        window.openNav = function() {
            console.log('Using new mobile menu instead');
            openMenu();
        };
    }
    
    if (window.closeNav) {
        console.log('Removing old closeNav handler');
        window.closeNav = function() {
            console.log('Using new mobile menu instead');
            closeMenu();
        };
    }
});