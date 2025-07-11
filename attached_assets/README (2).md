# Checkout System with EmailJS Integration

This is a simple checkout system built with vanilla HTML, CSS, and JavaScript, featuring EmailJS integration for sending order confirmations.

## Files Included
- `index.html` - The main checkout page HTML
- `script.js` - The JavaScript functionality for the checkout system
- `styles.css` - CSS styling for the checkout page
- `customer_template.html` - EmailJS template for customer order confirmation emails
- `owner_template.html` - EmailJS template for store owner order notification emails

## Setup Instructions

### 1. EmailJS Account Setup
1. Create an account on [EmailJS](https://www.emailjs.com/)
2. Create a new email service in EmailJS (Gmail, Outlook, etc.)
3. Create two email templates:
   - One for customer order confirmations (based on `customer_template.html`)
   - One for store owner notifications (based on `owner_template.html`)
4. Note down your:
   - Service ID
   - Customer Template ID
   - Owner Template ID
   - Public Key

### 2. Update Credentials in script.js
Open `script.js` and find the `initEmailJS()` function. Update the following variables with your own EmailJS credentials:
```javascript
// Initialize EmailJS with credentials from environment variables
function initEmailJS() {
    // my EmailJS credentials
    const serviceId = 'service_prdjwt4'; 
    const customerTemplateId = 'template_guvarr1';
    const ownerTemplateId = 'template_zzlllxm';
    const publicKey = 'eWkroiiJhLnSK1_Pn';
    
    // ...rest of function
}
```

### 3. Integration with Your Website

#### Option 1: Full Page Integration
Simply copy the contents of `index.html`, `script.js`, and `styles.css` to your website files.

#### Option 2: Embed as a Component
1. Include the required Bootstrap CSS and JS in your website if not already present:
```html
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
```

2. Include the EmailJS library:
```html
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js"></script>
```

3. Copy the contents of `styles.css` to your CSS file or include it as a separate stylesheet.

4. Copy the checkout form section from `index.html` into your website where you want the checkout form to appear.

5. Copy the contents of `script.js` to your JavaScript file or include it as a separate script.

## Customizing the Email Templates
The `customer_template.html` and `owner_template.html` files are provided as examples of what your EmailJS templates should contain. When setting up your templates in EmailJS:

1. Create a new template in EmailJS
2. Copy the HTML content from these files to your template
3. Ensure that template variables match those sent in the `templateParams` object in `script.js`

## Key Features
- Responsive design with Bootstrap
- Dynamic product adding and removing
- Real-time order summary calculation
- Order reference generation
- Email notifications using EmailJS
- Form validation
- Predefined default values for quick testing

## Modifying the Checkout Form
You can easily customize the checkout form by:
- Adding or removing form fields in `index.html`
- Updating the `templateParams` object in `script.js` to include any new fields
- Updating the email templates to display the new fields

## Support
For any issues related to EmailJS, please refer to the [EmailJS documentation](https://www.emailjs.com/docs/).