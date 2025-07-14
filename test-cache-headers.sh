#!/bin/bash

# Firebase Storage CDN Cache Headers Test
# This script tests if your Firebase Storage files have proper cache headers

echo "🔥 Firebase Storage CDN Test"
echo "=============================="

# Test current bridal products JSON
echo ""
echo "Testing bridal-products.json..."
echo "curl -I \"https://firebasestorage.googleapis.com/v0/b/auric-a0c92.firebasestorage.app/o/productData%2Fbridal-products.json?alt=media&token=c6a2eb63-56e3-4fc0-96ac-66773cf45f96\""

curl -I "https://firebasestorage.googleapis.com/v0/b/auric-a0c92.firebasestorage.app/o/productData%2Fbridal-products.json?alt=media&token=c6a2eb63-56e3-4fc0-96ac-66773cf45f96" 2>/dev/null | grep -E "(cache-control|etag|last-modified|x-goog)"

echo ""
echo "Expected Results:"
echo "✅ cache-control: public, max-age=2592000"
echo "✅ etag: \"some-hash-value\""
echo "✅ last-modified: recent date"

echo ""
echo "=============================="
echo "If you see 'cache-control: public, max-age=2592000', your CDN caching is properly configured!"
echo "If you don't see this header, your files need to be re-uploaded with proper metadata."