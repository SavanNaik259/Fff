// Footer Toggle Functionality
document.addEventListener('DOMContentLoaded', function() {
    const footerToggles = document.querySelectorAll('.footer-toggle');

    footerToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const sectionId = this.getAttribute('data-section');
            const content = document.getElementById(sectionId);
            const icon = this.querySelector('i');

            // Toggle active class
            this.classList.toggle('active');

            // Toggle content visibility
            content.classList.toggle('show');

            // Close other sections (accordion behavior)
            footerToggles.forEach(otherToggle => {
                if (otherToggle !== this) {
                    const otherSectionId = otherToggle.getAttribute('data-section');
                    const otherContent = document.getElementById(otherSectionId);
                    otherToggle.classList.remove('active');
                    otherContent.classList.remove('show');
                }
            });
        });
    });
});