# Checkout System with EmailJS - Installation Guide

This guide will help you integrate the checkout system with EmailJS into your existing e-commerce website.

## Step 1: Extract the Files

First, extract the `checkout_system.zip` file to a location where you can easily access the files.

```
checkout_system/
├── customer_template.html
├── index.html
├── owner_template.html
├── README.md
├── script.js
└── styles.css
```

## Step 2: Set Up EmailJS

1. Create an account on [EmailJS](https://www.emailjs.com/) if you don't have one already
2. Create a new email service:
   - Go to "Email Services" in the EmailJS dashboard
   - Click "Add New Service"
   - Select your email provider (Gmail, Outlook, etc.)
   - Follow the authentication steps

3. Create the email templates:
   - Go to "Email Templates" in the EmailJS dashboard
   - Click "Create New Template"
   - Use the content from `customer_template.html` for the customer confirmation template
   - Create another template using the content from `owner_template.html` for owner notifications

4. Note your credentials:
   - Service ID: Found in the "Email Services" section
   - Template IDs: Found in the "Email Templates" section
   - Public Key: Found in the "Account" → "API Keys" section

## Step 3: Integration Options

### Option A: Use as a Standalone Checkout Page

If you want to use this as a separate checkout page:

1. Copy all files to your website directory
2. Update the EmailJS credentials in `script.js`:
   ```javascript
   function initEmailJS() {
       const serviceId = 'YOUR_SERVICE_ID'; 
       const customerTemplateId = 'YOUR_CUSTOMER_TEMPLATE_ID';
       const ownerTemplateId = 'YOUR_OWNER_TEMPLATE_ID';
       const publicKey = 'YOUR_PUBLIC_KEY';
       ...
   }
   ```
3. Link to this page from your shopping cart or product pages

### Option B: Integrate with an Existing Page

To embed the checkout form into an existing page:

1. Add the required libraries to your HTML head section if not already present:
   ```html
   <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
   <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
   <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js"></script>
   ```

2. Copy the CSS styles from `styles.css` to your site's stylesheet or include it:
   ```html
   <link rel="stylesheet" href="path/to/styles.css">
   ```

3. Copy the HTML from `index.html` for the checkout form section and paste it into your page

4. Include the JavaScript file or copy its contents to your existing JavaScript:
   ```html
   <script src="path/to/script.js"></script>
   ```

5. Update the EmailJS credentials in the JavaScript file as mentioned in Option A

## Step 4: Customization

### Modifying the Form Fields

You can customize the checkout form by:

1. Adding or removing form fields in the HTML
2. Updating the JavaScript templateParams object to include your new fields:
   ```javascript
   const templateParams = {
       // Add your custom fields here
       custom_field: document.getElementById('customField').value,
       ...
   };
   ```
3. Update your email templates to use the new fields (use `{{custom_field}}` syntax in the templates)

### Styling Changes

To change the appearance:

1. Modify the CSS in `styles.css` 
2. The checkout system uses Bootstrap 5, so you can also use Bootstrap classes for styling

### Product Field Customization

If you want to pre-populate the product information from your shopping cart:

1. Modify the `addProduct()` function in `script.js` to accept product data
2. Call this function with your product data when the page loads

## Step 5: Testing

Before going live:

1. Test the checkout process with a real email address
2. Verify that both you and the customer receive the correct email confirmations
3. Test on different devices to ensure the responsive design works properly

## Troubleshooting

- If emails aren't being sent, double-check your EmailJS credentials
- Check the browser console for any JavaScript errors
- Ensure all form fields marked as required are filled in
- Verify your EmailJS templates are using the correct variable names

For more details, refer to the `README.md` file in the package or the [EmailJS documentation](https://www.emailjs.com/docs/).

## Ready to Get Support?

If you run into issues or need help customizing the checkout system further, you can:
- Reach out to EmailJS support for email-related issues
- Modify the code according to your specific needs
- Consult with a web developer for custom integrations