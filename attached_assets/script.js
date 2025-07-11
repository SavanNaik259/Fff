document.addEventListener('DOMContentLoaded', function() {
    // Form submission
    document.getElementById('checkoutForm').addEventListener('submit', handleOrderSubmit);
    
    // Add product button
    document.getElementById('addProduct').addEventListener('click', addProduct);

    // Initialize EmailJS with credentials from environment variables
    initEmailJS();
    
    // Add event listeners to initial product inputs
    setupProductListeners();
    
    // Update order summary on page load
    setTimeout(updateOrderSummary, 100);
    
    // Initialize EmailJS with credentials from environment variables
    function initEmailJS() {
        // These values come from environment variables set in the server
        const serviceId = 'service_prdjwt4'; 
        const customerTemplateId = 'template_guvarr1';
        const ownerTemplateId = 'template_zzlllxm';
        const publicKey = 'eWkroiiJhLnSK1_Pn';
        
        console.log("EmailJS environment credentials loaded:", {
            serviceId,
            customerTemplateId,
            ownerTemplateId,
            publicKey
        });
        
        console.log("Using environment EmailJS credentials");
        
        // Initialize EmailJS with the public key
        emailjs.init(publicKey);
        
        // Store the credentials for later use
        localStorage.setItem('emailjs_serviceId', serviceId);
        localStorage.setItem('emailjs_customerTemplateId', customerTemplateId);
        localStorage.setItem('emailjs_ownerTemplateId', ownerTemplateId);
        localStorage.setItem('emailjs_publicKey', publicKey);
    }
    
    // Set up event listeners for product inputs
    function setupProductListeners() {
        const productItems = document.querySelectorAll('.product-item');
        
        productItems.forEach(item => {
            const quantityInput = item.querySelector('.product-quantity');
            const priceInput = item.querySelector('.product-price');
            const removeButton = item.querySelector('.remove-product');
            
            // Update summary when quantity or price changes
            if (quantityInput) {
                quantityInput.addEventListener('input', updateOrderSummary);
            }
            
            if (priceInput) {
                priceInput.addEventListener('input', updateOrderSummary);
            }
            
            // Remove product when remove button is clicked
            if (removeButton) {
                removeButton.addEventListener('click', function() {
                    // Only remove if it's not the only product
                    if (document.querySelectorAll('.product-item').length > 1) {
                        item.remove();
                        updateOrderSummary();
                    }
                });
            }
        });
        
        // Enable/disable remove buttons based on product count
        updateRemoveButtons();
    }
    
    // Add a new product item
    function addProduct() {
        const productList = document.getElementById('productList');
        const productCount = productList.querySelectorAll('.product-item').length + 1;
        
        const productItem = document.createElement('div');
        productItem.className = 'product-item card mb-3';
        productItem.innerHTML = `
            <div class="card-body">
                <div class="row align-items-center">
                    <div class="col-md-6 mb-3 mb-md-0">
                        <label for="product${productCount}" class="form-label">Product Name</label>
                        <input type="text" class="form-control product-name" id="product${productCount}" name="product${productCount}" required>
                    </div>
                    <div class="col-md-2 mb-3 mb-md-0">
                        <label for="quantity${productCount}" class="form-label">Quantity</label>
                        <input type="number" class="form-control product-quantity" id="quantity${productCount}" name="quantity${productCount}" min="1" value="1" required>
                    </div>
                    <div class="col-md-3 mb-3 mb-md-0">
                        <label for="price${productCount}" class="form-label">Price</label>
                        <div class="input-group">
                            <span class="input-group-text">$</span>
                            <input type="number" class="form-control product-price" id="price${productCount}" name="price${productCount}" min="0.01" step="0.01" required>
                        </div>
                    </div>
                    <div class="col-md-1 d-flex align-items-center justify-content-end mt-3 mt-md-0">
                        <button type="button" class="btn btn-danger btn-sm remove-product">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
                                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                                <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        productList.appendChild(productItem);
        
        // Add event listeners to new product
        setupProductListeners();
        
        // Update order summary
        updateOrderSummary();
    }
    
    // Enable/disable remove buttons based on product count
    function updateRemoveButtons() {
        const removeButtons = document.querySelectorAll('.remove-product');
        const productCount = document.querySelectorAll('.product-item').length;
        
        removeButtons.forEach(button => {
            button.disabled = productCount <= 1;
        });
    }
    
    // Calculate total for a single product
    function calculateProductTotal(item) {
        const quantity = parseFloat(item.querySelector('.product-quantity').value) || 0;
        const price = parseFloat(item.querySelector('.product-price').value) || 0;
        return quantity * price;
    }
    
    // Update order summary
    function updateOrderSummary() {
        const productItems = document.querySelectorAll('.product-item');
        const orderSummary = document.getElementById('orderSummary');
        let summaryHTML = '';
        let orderTotal = 0;
        
        if (productItems.length === 0) {
            orderSummary.innerHTML = '<p>No products added yet.</p>';
            document.getElementById('orderTotal').textContent = '$0.00';
            return;
        }
        
        summaryHTML = '<table class="summary-table"><tbody>';
        
        productItems.forEach((item, index) => {
            const productName = item.querySelector('.product-name').value || `Product ${index + 1}`;
            const quantity = parseFloat(item.querySelector('.product-quantity').value) || 0;
            const price = parseFloat(item.querySelector('.product-price').value) || 0;
            const productTotal = calculateProductTotal(item);
            
            orderTotal += productTotal;
            
            summaryHTML += `
                <tr>
                    <td>${productName}</td>
                    <td>${quantity} × $${price.toFixed(2)}</td>
                    <td class="text-end">$${productTotal.toFixed(2)}</td>
                </tr>
            `;
        });
        
        summaryHTML += '</tbody></table>';
        orderSummary.innerHTML = summaryHTML;
        document.getElementById('orderTotal').textContent = `$${orderTotal.toFixed(2)}`;
    }
    
    // Handle order submission
    async function handleOrderSubmit(e) {
        e.preventDefault();
        
        // Validate form
        if (!validateForm()) {
            return;
        }
        
        // Get the EmailJS credentials
        const serviceId = localStorage.getItem('emailjs_serviceId');
        const customerTemplateId = localStorage.getItem('emailjs_customerTemplateId');
        const ownerTemplateId = localStorage.getItem('emailjs_ownerTemplateId');
        const publicKey = localStorage.getItem('emailjs_publicKey');
        
        // Generate a unique order reference
        const orderReference = generateOrderReference();
        
        // Prepare template parameters
        const orderDetails = prepareOrderSummary();
        const templateParams = {
            order_reference: orderReference,
            from_name: document.getElementById('firstName').value + ' ' + document.getElementById('lastName').value,
            to_email: document.getElementById('email').value,
            address: document.getElementById('address').value,
            phone: document.getElementById('phone').value,
            payment_method: document.querySelector('input[name="paymentMethod"]:checked').value,
            notes: document.getElementById('notes').value,
            order_summary: orderDetails.orderSummaryHTML,
            order_total: document.getElementById('orderTotal').textContent,
            order_date: new Date().toLocaleString()
        };
        
        try {
            // Disable the submit button
            const submitBtn = document.querySelector('#checkoutForm button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = `
                <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Processing...
            `;
            
            try {
                console.log("Sending customer email with:", {serviceId, customerTemplateId, publicKey});
                // Send email to customer
                const customerResult = await emailjs.send(serviceId, customerTemplateId, templateParams);
                console.log("Customer email result:", customerResult);
                
                console.log("Sending owner email with:", {serviceId, ownerTemplateId, publicKey});
                // Send email to owner
                const ownerResult = await emailjs.send(serviceId, ownerTemplateId, templateParams);
                console.log("Owner email result:", ownerResult);
            } catch (error) {
                console.error("EmailJS error details:", error);
                throw error;
            }
            
            // Reset form
            document.getElementById('checkoutForm').reset();
            
            // Update order summary
            const productItems = document.querySelectorAll('.product-item');
            if (productItems.length > 1) {
                productItems.forEach((item, index) => {
                    if (index > 0) {
                        item.remove();
                    }
                });
            }
            updateOrderSummary();
            
            // Show confirmation modal
            document.getElementById('orderReference').textContent = orderReference;
            document.getElementById('orderDetails').innerHTML = orderDetails.orderSummaryHTML;
            
            const confirmationModal = new bootstrap.Modal(document.getElementById('confirmationModal'));
            confirmationModal.show();
            
            // Re-enable the submit button
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
            
        } catch (error) {
            console.error('Error sending email:', error);
            showError('Failed to send order confirmation. Please try again later.');
            
            // Re-enable the submit button
            const submitBtn = document.querySelector('#checkoutForm button[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Place Order';
        }
    }
    
    // Validate the form
    function validateForm() {
        const form = document.getElementById('checkoutForm');
        
        if (!form.checkValidity()) {
            form.reportValidity();
            return false;
        }
        
        // Check if products have names, quantities, and prices
        const productItems = document.querySelectorAll('.product-item');
        let isValid = true;
        
        productItems.forEach(item => {
            const nameInput = item.querySelector('.product-name');
            const quantityInput = item.querySelector('.product-quantity');
            const priceInput = item.querySelector('.product-price');
            
            if (!nameInput.value) {
                nameInput.setCustomValidity('Please enter a product name');
                isValid = false;
            } else {
                nameInput.setCustomValidity('');
            }
            
            if (!quantityInput.value || parseInt(quantityInput.value) < 1) {
                quantityInput.setCustomValidity('Quantity must be at least 1');
                isValid = false;
            } else {
                quantityInput.setCustomValidity('');
            }
            
            if (!priceInput.value || parseFloat(priceInput.value) <= 0) {
                priceInput.setCustomValidity('Please enter a valid price');
                isValid = false;
            } else {
                priceInput.setCustomValidity('');
            }
        });
        
        if (!isValid) {
            form.reportValidity();
        }
        
        return isValid;
    }
    
    // Generate a unique order reference
    function generateOrderReference() {
        const prefix = 'ORD';
        const timestamp = Date.now().toString().substr(-6);
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `${prefix}-${timestamp}-${random}`;
    }
    
    // Prepare order summary for email
    function prepareOrderSummary() {
        const productItems = document.querySelectorAll('.product-item');
        let orderSummaryHTML = '<table style="width:100%; border-collapse: collapse; margin-bottom: 15px;">';
        orderSummaryHTML += '<tr style="border-bottom: 1px solid #ddd;"><th style="text-align:left; padding: 8px;">Product</th><th style="text-align:left; padding: 8px;">Quantity</th><th style="text-align:right; padding: 8px;">Price</th><th style="text-align:right; padding: 8px;">Total</th></tr>';
        
        let products = [];
        
        productItems.forEach(item => {
            const name = item.querySelector('.product-name').value;
            const quantity = parseInt(item.querySelector('.product-quantity').value);
            const price = parseFloat(item.querySelector('.product-price').value);
            const total = quantity * price;
            
            orderSummaryHTML += `
                <tr style="border-bottom: 1px solid #ddd;">
                    <td style="text-align:left; padding: 8px;">${name}</td>
                    <td style="text-align:left; padding: 8px;">${quantity}</td>
                    <td style="text-align:right; padding: 8px;">$${price.toFixed(2)}</td>
                    <td style="text-align:right; padding: 8px;">$${total.toFixed(2)}</td>
                </tr>
            `;
            
            products.push({
                name,
                quantity,
                price,
                total
            });
        });
        
        const orderTotal = products.reduce((sum, product) => sum + product.total, 0);
        
        orderSummaryHTML += `
            <tr>
                <td colspan="3" style="text-align:right; padding: 8px;"><strong>Total:</strong></td>
                <td style="text-align:right; padding: 8px;"><strong>$${orderTotal.toFixed(2)}</strong></td>
            </tr>
        </table>`;
        
        return {
            products,
            orderTotal,
            orderSummaryHTML
        };
    }
    
    // Show error message
    function showError(message) {
        document.getElementById('errorMessage').textContent = message;
        const errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
        errorModal.show();
    }
    
    // Show toast notification
    function showToast(message, type = 'info') {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${type} border-0`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');
        
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        `;
        
        // Create toast container if it doesn't exist
        let toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
            document.body.appendChild(toastContainer);
        }
        
        // Add toast to container
        toastContainer.appendChild(toast);
        
        // Initialize and show toast
        const bsToast = new bootstrap.Toast(toast, {
            autohide: true,
            delay: 3000
        });
        bsToast.show();
        
        // Remove toast after it's hidden
        toast.addEventListener('hidden.bs.toast', function() {
            this.remove();
        });
    }
});