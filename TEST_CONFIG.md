# Sample Configuration for Testing

## Test Vimeo Playlist Configuration

```javascript
// Sample configuration that will be passed from Moodle
const sampleMoodleConfig = {
  videoUrls: [
    'https://vimeo.com/1099589618',
    'https://vimeo.com/1104353286', 
    'https://vimeo.com/1104353404',
    'https://vimeo.com/1104353654'
  ],
  continuousPlay: true,
  autoplay: true,
  showEndScreen: true,
  moodleActivityId: 123,
  moodleUserId: 456,
  moodleCourseId: 789
};
```

## Test Activity Settings

```php
// Sample Moodle activity instance for testing
$eljwplayer = (object)[
  'id' => 1,
  'name' => 'Test Vimeo Playlist',
  'videosource' => '["https://vimeo.com/1099589618","https://vimeo.com/1104353286","https://vimeo.com/1104353404","https://vimeo.com/1104353654"]',
  'continuousplay' => 1,
  'autoplay' => 1,
  'showendscreen' => 1,
  'completionwatchvideo' => 75, // 75% of videos must be watched
  'course' => 1
];
```

## Browser Testing URLs

- Development: `http://localhost:5173/`
- Moodle Integration: `http://your-moodle-site.com/mod/eljwplayer/view.php?id=123`

## Completion Testing

1. Watch 1 video → Progress tracked
2. Watch 2 videos → Progress tracked  
3. Watch 3 videos → 75% threshold reached → Activity completed
4. Watch all 4 videos → 100% completion

## Error Testing Scenarios

- Invalid Vimeo URL
- Network connectivity issues
- Missing configuration
- Browser compatibility