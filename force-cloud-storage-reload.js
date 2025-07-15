// Add this script to your HTML to force reload from Cloud Storage
// This will clear any cached data and force fresh load from Cloud Storage only

(function() {
    console.log('Force reloading products from Cloud Storage...');
     
    // Clear localStorage cache
    localStorage.removeItem('bridalProducts');
    localStorage.removeItem('bridalProductsTime');
    console.log('Cleared localStorage cache');
    
    // Clear any memory cache if BridalProductsLoader exists
    if (typeof BridalProductsLoader !== 'undefined' && BridalProductsLoader.clearCache) {
        BridalProductsLoader.clearCache();
        console.log('Cleared memory cache');
    }
    
    // Force reload the bridal section
    setTimeout(() => {
        if (typeof BridalProductsLoader !== 'undefined' && BridalProductsLoader.updateBridalSection) {
            console.log('Force updating bridal section...');
            BridalProductsLoader.updateBridalSection();
        }
    }, 2000);
    
    console.log('Cache cleared and forced reload initiated');
})();