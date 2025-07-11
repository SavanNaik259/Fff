
/**
 * Products API with Server-Side Caching
 * Serves cached products to all users
 */

const cache = require('./cache-manager');

// Mock Firebase admin (replace with actual Firebase admin SDK)
// You'll need to install firebase-admin: npm install firebase-admin
const admin = require('firebase-admin');

// Initialize Firebase Admin (add your service account key)
if (!admin.apps.length) {
    // Replace with your Firebase service account initialization
    console.warn('Firebase Admin not initialized - using mock data');
}

class ProductsAPI {
    constructor() {
        this.db = admin.apps.length ? admin.firestore() : null;
    }

    /**
     * Get bridal products with server-side caching
     */
    async getBridalProducts() {
        const cacheKey = 'bridal_products';
        
        // Try cache first
        const cached = cache.get(cacheKey);
        if (cached) {
            console.log('Serving products from server cache');
            return {
                success: true,
                data: cached,
                source: 'server_cache',
                cached_at: cache.cache.get(cacheKey)?.timestamp
            };
        }

        // Cache miss - fetch from Firebase
        console.log('Cache miss - fetching from Firebase');
        
        try {
            const products = await this.fetchFromFirebase();
            
            // Store in cache
            cache.set(cacheKey, products);
            
            return {
                success: true,
                data: products,
                source: 'firebase',
                cached_at: Date.now()
            };
        } catch (error) {
            console.error('Error fetching from Firebase:', error);
            return {
                success: false,
                error: error.message,
                source: 'error'
            };
        }
    }

    /**
     * Fetch products from Firebase
     */
    async fetchFromFirebase() {
        if (!this.db) {
            // Mock data for testing
            return [
                {
                    id: 'mock-1',
                    name: 'Sample Bridal Ring',
                    price: 50000,
                    image: 'https://example.com/ring.jpg',
                    category: 'bridal'
                }
            ];
        }

        const products = [];
        const snapshot = await this.db
            .collection('products')
            .where('category', 'in', ['bridal', 'bridal-edit'])
            .orderBy('createdAt', 'desc')
            .limit(10)
            .get();

        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.name && data.price && data.image) {
                products.push({
                    id: doc.id,
                    name: data.name,
                    price: data.price,
                    image: data.image,
                    description: data.description || '',
                    stock: data.stock || 0,
                    category: data.category
                });
            }
        });

        return products;
    }

    /**
     * Clear cache (for admin use)
     */
    clearCache() {
        cache.clear('bridal_products');
        return { success: true, message: 'Cache cleared' };
    }

    /**
     * Get cache stats
     */
    getCacheStats() {
        return cache.getStats();
    }
}

module.exports = new ProductsAPI();
