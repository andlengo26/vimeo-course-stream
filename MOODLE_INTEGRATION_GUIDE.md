# Vimeo Playlist Component - Moodle Integration Guide

## Overview

This React-based Vimeo playlist component provides a complete video learning experience designed for integration with Moodle LMS. It features video playback, progress tracking, completion monitoring, and seamless integration with Moodle's activity completion system.

## Architecture Overview

The component follows a modular React architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                    Moodle LMS Integration                    │
├─────────────────────────────────────────────────────────────┤
│                    VimeoPlaylist (Main)                     │
├─────────────────┬─────────────────┬─────────────────────────┤
│   VimeoPlayer   │ PlaylistSidebar │   VideoProgressBar      │
├─────────────────┴─────────────────┴─────────────────────────┤
│              Services & Configuration                       │
│         • vimeo-api.ts    • moodle-completion.ts           │
│         • cache-manager.ts • vimeo-playlist.ts             │
└─────────────────────────────────────────────────────────────┘
```

---

## File Structure & Responsibilities

### Core Components (`src/components/`)

#### `VimeoPlaylist.tsx` - Main Container Component
**Purpose**: Central orchestrator for the entire playlist experience  
**Responsibilities**:
- Manages overall playlist state (current video, watched videos, completion status)
- Coordinates communication between child components
- Handles URL parameters for deep linking (`?video=2&autoplay=true`)
- Manages localStorage persistence for progress tracking
- Integrates with Moodle completion service
- Responsive layout orchestration (desktop/mobile)

**Key State Management**:
```typescript
interface PlaylistState {
  currentVideoIndex: number;
  watchedVideos: Set<string>;
  isCompleted: boolean;
  showEndScreen: boolean;
  hasEverCompleted: boolean;
}
```

#### `VimeoPlayer.tsx` - Video Player Component
**Purpose**: Handles Vimeo iframe integration and player controls  
**Responsibilities**:
- Vimeo iframe embedding and API communication
- Video lifecycle management (load, play, pause, end)
- Error handling and retry mechanisms
- Responsive video resizing
- Cache integration for performance optimization

**Moodle Integration Points**:
- Triggers completion events on video end
- Respects autoplay policies
- Handles network connectivity issues gracefully

#### `PlaylistSidebar.tsx` - Navigation Component
**Purpose**: Provides video navigation and progress visualization  
**Responsibilities**:
- Displays all videos in the playlist with metadata
- Shows completion status for each video
- Provides thumbnail navigation
- Mobile-responsive collapsible interface
- Loading states and error handling

#### `VideoProgressBar.tsx` - Compact Progress Indicator
**Purpose**: Minimalist progress tracking for space-constrained views  
**Responsibilities**:
- Compact horizontal progress visualization
- Toggle mechanism for sidebar visibility
- Direct video selection interface
- Mobile-optimized touch interactions

#### `CompletionScreen.tsx` - Activity Completion Interface
**Purpose**: Celebrates completion and provides restart functionality  
**Responsibilities**:
- Completion celebration UI
- Restart activity functionality
- Download/certificate options (configurable)
- Integration with Moodle completion ceremonies

### Services Layer (`src/services/`)

#### `vimeo-api.ts` - Vimeo Integration Service
**Purpose**: Abstracts Vimeo API interactions  
**Key Functions**:
```typescript
class VimeoApiService {
  // Fetches video metadata from Vimeo oEmbed API
  static async getPlaylistMetadata(urls: string[]): Promise<VideoMetadata[]>
  
  // Extracts video ID from various Vimeo URL formats
  static extractVideoId(url: string): string
  
  // Handles rate limiting and error recovery
  static async fetchWithRetry(url: string, retries: number): Promise<Response>
}
```

**Moodle Integration Benefits**:
- No API keys required (uses public oEmbed)
- Robust error handling for network issues
- Caching for improved performance
- Supports various Vimeo URL formats

#### `moodle-completion.ts` - Moodle Activity Completion
**Purpose**: Bridges React component with Moodle's completion system  
**Key Functions**:
```typescript
class MoodleCompletionService {
  // Initialize with Moodle activity context
  static initialize(config: MoodleConfig): void
  
  // Update progress (for manual completion tracking)
  static updateProgress(completed: number, total: number): void
  
  // Mark activity as complete
  static markComplete(): void
}
```

**Integration Pattern**:
```typescript
// Initialize in component
MoodleCompletionService.initialize({
  activityId: 'your_activity_id',
  userId: 'current',
  courseId: 'current'
});

// Track progress
MoodleCompletionService.updateProgress(watchedCount, totalVideos);

// Mark complete when all videos watched
MoodleCompletionService.markComplete();
```

### Configuration (`src/config/`)

#### `vimeo-playlist.ts` - Configuration Management
**Purpose**: Central configuration for playlist behavior  
**Configuration Options**:
```typescript
export const vimeoPlaylistConfig = {
  title: 'Activity Introduction Videos',
  videoUrls: string[],           // Array of Vimeo URLs
  continuousPlay: boolean,       // Auto-advance to next video
  autoplay: boolean,             // Auto-start playback
  showEndScreen: boolean,        // Show completion screen
  
  // Moodle Integration Settings
  moodleActivityId: string,      // Your Moodle activity ID
  moodleUserId: string,          // Current user ID
  moodleCourseId: string,        // Current course ID
};
```

### Utilities (`src/utils/` & `src/hooks/`)

#### `cache-manager.ts` - Performance Optimization
**Purpose**: Manages localStorage caching for video metadata and progress  
**Benefits for Moodle**:
- Reduces API calls on page reloads
- Faster initial load times
- Offline-friendly metadata storage

#### `useVideoResize.tsx` - Responsive Video Hook
**Purpose**: Handles responsive video sizing within Moodle's layout constraints  
**Moodle Benefits**:
- Adapts to various Moodle theme layouts
- Maintains aspect ratios across devices
- Handles dynamic content area sizing

### UI Components (`src/components/ui/`)

Essential shadcn/ui components for consistent styling:
- `button.tsx` - Standardized button components
- `card.tsx` - Container components
- `skeleton.tsx` - Loading state components
- `toast.tsx` & `toaster.tsx` - User feedback system
- `tooltip.tsx` - Help and information overlays

### Styling System

#### `src/index.css` - Design System
**Purpose**: Comprehensive design system with semantic tokens  
**Key Features**:
- CSS custom properties for theming
- Light/dark mode support
- Responsive utilities
- Moodle-friendly color schemes

#### `tailwind.config.ts` - Tailwind Configuration
**Purpose**: Extends Tailwind with custom design tokens  
**Moodle Integration**:
- Configurable color schemes to match Moodle themes
- Responsive breakpoints compatible with Moodle layouts
- Custom animation and transition systems

---

## Moodle Plugin Integration Guide

### Step 1: Plugin Structure Setup

Create your Moodle plugin with the following structure:
```
/mod/your_plugin/
├── amd/
│   └── src/
│       └── vimeo_playlist.js      # React component integration
├── classes/
│   └── output/
│       └── main.php               # Main renderer
├── lang/en/
│   └── your_plugin.php            # Language strings
├── templates/
│   └── view.mustache              # Main template
├── view.php                       # Main view file
├── lib.php                        # Plugin library functions
├── mod_form.php                   # Activity form
└── version.php                    # Plugin version
```

### Step 2: Build Integration

1. **Build the React App**:
```bash
npm run build
```

2. **Copy built assets to Moodle**:
```bash
# Copy built JS and CSS to your plugin's amd/build/
cp dist/assets/*.js /path/to/moodle/mod/your_plugin/amd/build/
cp dist/assets/*.css /path/to/moodle/mod/your_plugin/styles/
```

3. **AMD Module Integration** (`amd/src/vimeo_playlist.js`):
```javascript
define(['jquery'], function($) {
    return {
        init: function(config) {
            // Initialize React component with Moodle config
            require(['your_plugin/react_bundle'], function(ReactApp) {
                ReactApp.init('vimeo-playlist-container', config);
            });
        }
    };
});
```

### Step 3: PHP Integration

#### Main View (`view.php`):
```php
<?php
require_once('../../config.php');

$id = required_param('id', PARAM_INT);
$cm = get_coursemodule_from_id('your_plugin', $id, 0, false, MUST_EXIST);
$course = $DB->get_record('course', array('id' => $cm->course), '*', MUST_EXIST);

require_login($course, true, $cm);

// Prepare configuration for React component
$config = [
    'videos' => json_decode($instance->videos),
    'activityId' => $cm->id,
    'userId' => $USER->id,
    'courseId' => $course->id,
    'autoplay' => $instance->autoplay,
    'continuousPlay' => $instance->continuous_play
];

$PAGE->requires->js_call_amd('mod_your_plugin/vimeo_playlist', 'init', [$config]);

echo $OUTPUT->header();
echo '<div id="vimeo-playlist-container"></div>';
echo $OUTPUT->footer();
?>
```

#### Activity Form (`mod_form.php`):
```php
class mod_your_plugin_mod_form extends moodleform_mod {
    function definition() {
        $mform = $this->_form;
        
        $mform->addElement('textarea', 'videos', get_string('videos', 'your_plugin'));
        $mform->setType('videos', PARAM_TEXT);
        $mform->addRule('videos', null, 'required');
        
        $mform->addElement('checkbox', 'autoplay', get_string('autoplay', 'your_plugin'));
        $mform->addElement('checkbox', 'continuous_play', get_string('continuousplay', 'your_plugin'));
        
        $this->standard_coursemodule_elements();
        $this->add_action_buttons();
    }
}
```

### Step 4: Completion Integration

#### Library Functions (`lib.php`):
```php
function your_plugin_supports($feature) {
    switch($feature) {
        case FEATURE_COMPLETION_TRACKS_VIEWS:
            return true;
        case FEATURE_COMPLETION_HAS_RULES:
            return true;
        default:
            return null;
    }
}

function your_plugin_get_completion_state($course, $cm, $userid, $type) {
    global $DB;
    
    // Check if user has completed all videos
    $completion_data = $DB->get_record('your_plugin_completion', [
        'userid' => $userid,
        'activityid' => $cm->id
    ]);
    
    return $completion_data && $completion_data->completed;
}
```

### Step 5: Configuration Options

#### Environment-Specific Configuration

For different Moodle environments, modify `vimeoPlaylistConfig`:

```typescript
// Development
export const vimeoPlaylistConfig = {
  title: 'Course Introduction',
  videoUrls: [
    'https://vimeo.com/video1',
    'https://vimeo.com/video2'
  ],
  continuousPlay: true,
  autoplay: false,  // Respect Moodle autoplay policies
  showEndScreen: true,
  moodleActivityId: null,  // Will be set dynamically
  moodleUserId: null,      // Will be set dynamically
  moodleCourseId: null     // Will be set dynamically
};
```

### Step 6: Database Schema

Create tables for tracking completion:

```sql
CREATE TABLE mdl_your_plugin_completion (
    id BIGINT(10) NOT NULL AUTO_INCREMENT,
    userid BIGINT(10) NOT NULL,
    activityid BIGINT(10) NOT NULL,
    videoid VARCHAR(255) NOT NULL,
    completed TINYINT(1) DEFAULT 0,
    timemodified BIGINT(10) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY user_activity_video (userid, activityid, videoid)
);
```

---

## Advanced Configuration

### Custom Theming

Modify `src/index.css` to match your Moodle theme:

```css
:root {
  --primary: [your-moodle-primary-color];
  --secondary: [your-moodle-secondary-color];
  --background: [your-moodle-background];
  /* ... other theme variables */
}
```

### Progressive Web App Features

The component supports offline functionality:
- Video metadata caching
- Progress persistence
- Network retry mechanisms

### Accessibility Features

Built-in accessibility features include:
- Keyboard navigation
- Screen reader support
- High contrast mode compatibility
- Focus management

---

## API Reference

### JavaScript Integration API

```javascript
// Initialize the component
window.VimeoPlaylist.init(containerId, {
  videos: ['https://vimeo.com/123', 'https://vimeo.com/456'],
  activityId: 'activity_123',
  userId: 'user_456',
  courseId: 'course_789',
  onComplete: function(completionData) {
    // Handle completion in Moodle
  },
  onProgress: function(progress) {
    // Handle progress updates
  }
});
```

### Completion Tracking API

```typescript
interface CompletionData {
  totalVideos: number;
  watchedVideos: number;
  completedAt: Date;
  duration: number; // Total watch time
}
```

---

## Troubleshooting

### Common Integration Issues

1. **CORS Issues**: Ensure Vimeo URLs are accessible from your Moodle domain
2. **CSP Policies**: Configure Content Security Policy to allow Vimeo embeds
3. **Mobile Playback**: Test autoplay policies on various mobile devices
4. **Theme Conflicts**: Check for CSS conflicts with Moodle themes

### Performance Optimization

1. **Lazy Loading**: Videos load only when needed
2. **Metadata Caching**: Reduces API calls
3. **Progressive Enhancement**: Works without JavaScript (basic fallback)

### Debug Mode

Enable debug mode for troubleshooting:
```typescript
const config = {
  ...vimeoPlaylistConfig,
  debug: true  // Enables console logging
};
```

---

## Support and Maintenance

This component is designed to be self-contained and maintainable within Moodle's ecosystem. Key maintenance considerations:

- **Vimeo API Changes**: Monitor Vimeo's oEmbed API for changes
- **Browser Compatibility**: Test with Moodle's supported browsers
- **Performance Monitoring**: Track loading times and user engagement
- **Accessibility Updates**: Keep up with WCAG guidelines

For additional support and updates, refer to the project repository and Moodle plugin documentation.