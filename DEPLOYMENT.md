# Deployment Guide for Moodle eljwplayer Integration

## Prerequisites

- Moodle 3.9 or higher
- Node.js and npm (for building React app)
- Access to Moodle server file system
- Administrator privileges in Moodle

## Step 1: Build the React Application

### Local Development Build
```bash
# Install dependencies
npm install

# Build for production
npm run build
```

### Using Build Scripts
```bash
# Linux/Mac
chmod +x build-moodle.sh
./build-moodle.sh

# Windows
build-moodle.bat
```

## Step 2: Deploy to Moodle

### File Deployment
1. Copy the entire `public/eljwplayer/` directory to your Moodle installation:
   ```
   /path/to/moodle/mod/eljwplayer/
   ```

2. Ensure correct file permissions:
   ```bash
   chmod -R 755 /path/to/moodle/mod/eljwplayer/
   chown -R www-data:www-data /path/to/moodle/mod/eljwplayer/
   ```

### Database Upgrade
1. Log in to Moodle as administrator
2. Navigate to Site Administration → Notifications
3. Run the upgrade process to install new database tables

### Clear Caches
```bash
# Clear Moodle caches
php admin/cli/purge_caches.php

# Or via admin interface:
# Site Administration → Development → Purge all caches
```

## Step 3: Configuration

### Plugin Settings
1. Navigate to Site Administration → Plugins → Activity modules → Elearnified JW Player
2. Configure any global settings if needed

### Test Activity Creation
1. Go to a test course
2. Turn editing on
3. Add activity → Elearnified JW Player
4. Configure with test Vimeo URLs:
   ```
   https://vimeo.com/1099589618
   https://vimeo.com/1104353286
   https://vimeo.com/1104353404
   ```

## Step 4: Verification

### Check Logs
- Monitor Moodle error logs during testing
- Check browser console for JavaScript errors
- Verify completion tracking in gradebook

### Test Scenarios
- Single video (legacy compatibility)
- Multiple video playlist
- Completion tracking
- Mobile/responsive design

## Troubleshooting

### Common Issues

**React app not loading:**
- Check file paths in `public/eljwplayer/react-app/`
- Verify AMD module exists
- Clear browser cache

**Database errors:**
- Ensure upgrade completed successfully
- Check table creation: `eljwplayer_userprogress`
- Verify new columns in `eljwplayer` table

**Completion not working:**
- Check external API functions registered
- Verify AJAX calls in browser network tab
- Test completion rules configuration

### File Structure
```
mod/eljwplayer/
├── react-app/               # Built React application
│   ├── index.html
│   ├── assets/
│   └── main.js
├── amd/src/
│   └── vimeoapp.js          # AMD bridge module
├── db/
│   ├── install.xml          # Database schema
│   ├── upgrade.php          # Upgrade scripts
│   └── services.php         # External API
├── lang/en/
│   └── eljwplayer.php       # Language strings
├── mod_form.php             # Activity configuration
├── view.php                 # Activity display
├── externallib.php          # API functions
└── version.php              # Plugin version
```

## Production Considerations

- Enable production optimizations in React build
- Configure CDN for video assets if needed
- Monitor server resources with multiple concurrent users
- Set up proper backup procedures for new database tables

## Support

For issues specific to this integration:
1. Check TESTING.md for common test scenarios
2. Review browser console and Moodle logs
3. Verify all build steps completed successfully