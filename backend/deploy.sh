#!/bin/bash

echo "=== Deployment Script Started ==="

# Ensure we're in the right directory
echo "Current directory: $(pwd)"
echo "Directory contents:"
ls -la

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the project
echo "Building TypeScript project..."
npm run build

# Verify build output
echo "Verifying build output..."
if [ ! -f "dist/server.js" ]; then
    echo "❌ ERROR: dist/server.js not found after build!"
    echo "Contents of dist folder:"
    ls -la dist/ || echo "dist folder not found"
    exit 1
fi

echo "✅ Build successful! dist/server.js found."
echo "File size: $(du -h dist/server.js)"

# Show final directory structure
echo "Final directory structure:"
ls -la
echo "Dist folder contents:"
ls -la dist/

echo "=== Deployment Script Completed Successfully ==="
