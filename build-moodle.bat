@echo off
REM Build script for Moodle integration (Windows)

echo Building React app for Moodle integration...

REM Clean previous builds
if exist "dist-moodle" rmdir /s /q "dist-moodle"
if exist "public\eljwplayer\react-app" rmdir /s /q "public\eljwplayer\react-app"

REM Build the React application
call npm run build

REM Copy built files to Moodle plugin directory
if not exist "public\eljwplayer\react-app" mkdir "public\eljwplayer\react-app"
xcopy /E /I "dist-moodle\*" "public\eljwplayer\react-app\"

echo Build completed successfully!
echo React app assets are now in public\eljwplayer\react-app\

echo.
echo Next steps:
echo 1. Copy public\eljwplayer\ to your Moodle installation at \mod\eljwplayer\
echo 2. Run Moodle upgrade to install database changes
echo 3. Test the integration with sample Vimeo URLs