/**
 * Auric Order Tracking System
 * 
 * This script handles the order tracking UI and future integration
 * Currently shows a notification that tracking is not yet implemented
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get necessary elements
    const trackForm = document.getElementById('trackOrderForm');
    const modal = document.getElementById('trackingModal');
    const closeModal = document.querySelector('.close-modal');
    const okButton = document.querySelector('.modal-btn');
    
    // Add event listener to the form
    if (trackForm) {
        trackForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get order ID
            const orderIdInput = document.getElementById('orderId');
            const orderId = orderIdInput.value.trim();
            
            // Simple validation
            if (orderId === '') {
                alert('Please enter an order ID');
                return;
            }
            
            // Show the modal (for now, since tracking is not implemented)
            showModal();
            
            // Clear the form
            trackForm.reset();
        });
    }
    
    // Functions to handle the modal
    function showModal() {
        if (modal) {
            modal.style.display = 'flex';
        }
    }
    
    function hideModal() {
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    // Event listeners for closing the modal
    if (closeModal) {
        closeModal.addEventListener('click', hideModal);
    }
    
    if (okButton) {
        okButton.addEventListener('click', hideModal);
    }
    
    // Close modal when clicking outside of it
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            hideModal();
        }
    });
});