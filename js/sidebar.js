document.addEventListener('DOMContentLoaded', function() {
    console.log('Sidebar Navigation Initialized');
    
    // Elements
    const menuBtn = document.getElementById('menuBtn');
    const closeBtn = document.getElementById('closeBtn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    const submenuLinks = document.querySelectorAll('.has-submenu');
    
    // Log if elements were found or not for debugging
    console.log({
        menuBtnFound: !!menuBtn,
        closeBtnFound: !!closeBtn,
        sidebarFound: !!sidebar,
        overlayFound: !!overlay,
        submenuLinksCount: submenuLinks.length
    });
    // Open sidebar
    function openSidebar() {
        sidebar.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        console.log('Sidebar opened');
    }
    
    // Close sidebar
    function closeSidebar() {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
        console.log('Sidebar closed');
    }
    
    // Toggle submenu
    function toggleSubmenu(event) {
        event.preventDefault();
        
        const submenuId = this.getAttribute('data-submenu');
        const submenu = document.getElementById(submenuId);
        const chevron = this.querySelector('i');
        
        if (submenu) {
            submenu.classList.toggle('show');
            chevron.classList.toggle('chevron-down');
            console.log(`Toggled submenu: ${submenuId}`);
        }
    }
    
    // Event listeners
    if (menuBtn) {
        menuBtn.addEventListener('click', openSidebar);
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeSidebar);
    }
    
    if (overlay) {
        overlay.addEventListener('click', closeSidebar);
    }
    
    submenuLinks.forEach(link => {
        link.addEventListener('click', toggleSubmenu);
    });
    
    // Make functions available globally for direct HTML usage
    window.openNav = openSidebar;
    window.closeNav = closeSidebar;
});