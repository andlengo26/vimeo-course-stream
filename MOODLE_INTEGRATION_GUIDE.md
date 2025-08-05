# Moodle Integration Guide

This guide explains how to integrate the Vimeo Playlist application with Moodle using the eljwplayer plugin.

## Overview

The eljwplayer plugin provides a unified interface for both JWPlayer and Vimeo content within Moodle. This integration includes:

- **Vimeo Playlist Support**: Play multiple Vimeo videos in sequence
- **Activity Completion Tracking**: Track student progress and completion
- **Responsive Design**: Works on desktop and mobile devices
- **Moodle Integration**: Full integration with Moodle's course structure

## Installation Steps

### 1. Build the React Application

```bash
# Build for Moodle integration
npm run build:moodle

# This will:
# - Build the React app to dist-moodle/
# - Copy files to public/eljwplayer/react-app/
```

### 2. Deploy to Moodle

1. Copy the entire `public/eljwplayer/` directory to your Moodle installation:
   ```
   /path/to/moodle/mod/eljwplayer/
   ```

2. Access your Moodle site as an administrator

3. Navigate to **Site Administration > Notifications** to trigger the upgrade process

4. The plugin will automatically create/update the necessary database tables

### 3. Configure the Plugin

1. Go to **Site Administration > Plugins > Activity Modules > Elearnified JW Player**
2. Configure any global settings as needed

## Using the Plugin

### Creating a Vimeo Playlist Activity

1. In your course, click **"Add an activity or resource"**
2. Select **"Elearnified JW Player"**
3. Configure the activity:
   - **Name**: Enter a descriptive name
   - **Video Source**: Select "Vimeo"
   - **Vimeo Video URLs**: Enter one URL per line:
     ```
     https://vimeo.com/123456789
     https://vimeo.com/987654321
     https://vimeo.com/456789123
     ```
   - **Playlist Settings**:
     - ✅ Continuous play (auto-advance to next video)
     - ✅ Autoplay (start automatically)
     - ✅ Show completion screen
   - **Activity Completion**: Set percentage of videos required for completion

### Activity Completion

The plugin tracks:
- **Individual Video Progress**: Each video's watch status
- **Overall Completion**: Based on percentage of videos watched
- **Moodle Integration**: Updates Moodle's completion tracking

## Technical Details

### Database Schema

The plugin uses these main tables:
- `eljwplayer`: Main activity configuration
- `eljwplayer_userprogress`: Individual user progress tracking

### React App Integration

- Built files are served from `mod/eljwplayer/react-app/`
- AMD module `mod_eljwplayer/vimeoapp` handles initialization
- Custom events bridge React app and Moodle APIs

### API Endpoints

The plugin exposes these web services:
- `mod_eljwplayer_track_completion`: Track video completion
- `mod_eljwplayer_track_progress`: Track detailed progress
- `mod_eljwplayer_view_jwplayermedia`: Handle activity viewing

## Troubleshooting

### Common Issues

1. **React app not loading**:
   - Verify files are in `mod/eljwplayer/react-app/`
   - Check browser console for errors
   - Ensure `vimeoapp.min.js` AMD module exists

2. **Completion not tracking**:
   - Verify web services are enabled
   - Check completion settings in activity
   - Review user progress in database

3. **Build issues**:
   - Run `npm run build:moodle` to rebuild
   - Clear Moodle caches after deployment

### Debug Mode

To enable debugging:
1. Set `$CFG->debug = DEBUG_DEVELOPER` in Moodle config
2. Monitor browser console and Moodle logs
3. Check network requests for API calls

## Version Information

- **Plugin Version**: 2.0.2
- **Database Version**: 2025080505
- **React App**: Built from this repository
- **Moodle Compatibility**: 3.8+

## Support

For technical support or issues:
1. Check the troubleshooting section above
2. Review Moodle and browser logs
3. Verify all installation steps were completed
4. Test with sample Vimeo URLs first