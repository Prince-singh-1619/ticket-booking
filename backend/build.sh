#!/bin/bash

echo "=== Starting build process ==="
echo "Current directory: $(pwd)"
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"

echo "Installing dependencies..."
npm install

echo "Building TypeScript..."
npm run build

echo "Build completed. Contents of dist folder:"
ls -la dist/

echo "Verifying server.js exists:"
if [ -f "dist/server.js" ]; then
    echo "✅ dist/server.js found successfully!"
    echo "File size: $(du -h dist/server.js)"
else
    echo "❌ dist/server.js NOT FOUND!"
    echo "Contents of dist folder:"
    ls -la dist/
    exit 1
fi

echo "Build script finished successfully!"
