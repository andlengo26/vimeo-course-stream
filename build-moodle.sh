#!/bin/bash
# Build script for Moodle integration

echo "Building React app for Moodle integration..."

# Clean previous builds
rm -rf public/eljwplayer/react-app/*

# Build the React application
npm run build

# Copy built files to Moodle plugin directory
echo "Build completed successfully!"
echo "React app assets are now in public/eljwplayer/react-app/"

# Create AMD build if needed
if [ -d "public/eljwplayer/amd/src" ]; then
    echo "Building AMD modules..."
    # Note: In production, you would run Moodle's grunt build process here
    echo "AMD modules ready for Moodle grunt build"
fi

echo ""
echo "Next steps:"
echo "1. Copy public/eljwplayer/ to your Moodle installation at /mod/eljwplayer/"
echo "2. Run Moodle upgrade to install database changes"
echo "3. Test the integration with sample Vimeo URLs"