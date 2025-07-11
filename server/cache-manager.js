
/**
 * Server-Side Cache Manager
 * Stores Firebase products in memory and serves all users from cache
 */

class ServerCache {
    constructor() {
        this.cache = new Map();
        this.CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
    }

    /**
     * Get cached data
     */
    get(key) {
        const cached = this.cache.get(key);
        if (!cached) return null;

        const { data, timestamp } = cached;
        const now = Date.now();

        // Check if cache is expired
        if (now - timestamp > this.CACHE_DURATION) {
            this.cache.delete(key);
            return null;
        }

        return data;
    }

    /**
     * Set cache data
     */
    set(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
        console.log(`Cache set for key: ${key}`);
    }

    /**
     * Clear specific cache
     */
    clear(key) {
        this.cache.delete(key);
        console.log(`Cache cleared for key: ${key}`);
    }

    /**
     * Clear all cache
     */
    clearAll() {
        this.cache.clear();
        console.log('All cache cleared');
    }

    /**
     * Get cache stats
     */
    getStats() {
        const stats = {};
        for (const [key, value] of this.cache.entries()) {
            const age = Date.now() - value.timestamp;
            stats[key] = {
                age: Math.round(age / 1000), // age in seconds
                expires_in: Math.round((this.CACHE_DURATION - age) / 1000)
            };
        }
        return stats;
    }
}

module.exports = new ServerCache();
