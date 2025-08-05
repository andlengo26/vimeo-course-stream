# Moodle Plugin Integration Testing

## Test Scenarios

### 1. Basic Installation Test
- [ ] Plugin installs without errors
- [ ] Database tables created correctly
- [ ] No PHP errors in Moodle logs

### 2. Activity Creation Test
- [ ] Can create new eljwplayer activity
- [ ] Form validation works for Vimeo URLs
- [ ] Settings save correctly

### 3. Single Video Test (Legacy Compatibility)
- [ ] Existing single video activities still work
- [ ] Video plays correctly
- [ ] Completion tracking works

### 4. Playlist Functionality Test
- [ ] Multiple Vimeo URLs accepted
- [ ] React app loads correctly
- [ ] Videos play in sequence
- [ ] Progress tracking works
- [ ] Completion conditions work

### 5. Completion System Test
- [ ] Percentage-based completion works
- [ ] Individual video progress tracked
- [ ] Moodle completion updated correctly
- [ ] Grade book integration (if applicable)

### 6. Responsive Design Test
- [ ] Works on desktop browsers
- [ ] Mobile friendly
- [ ] Tablet compatible

### 7. Error Handling Test
- [ ] Invalid Vimeo URLs handled gracefully
- [ ] Network errors don't break app
- [ ] Missing videos handled properly

## Sample Test Data

### Test Vimeo URLs
```
https://vimeo.com/1099589618
https://vimeo.com/1104353286  
https://vimeo.com/1104353404
https://vimeo.com/1104353654
```

### Test Course Setup
1. Create test course
2. Add eljwplayer activity with playlist
3. Enroll test student
4. Test completion scenarios

## Common Issues Checklist

- [ ] AMD modules built correctly
- [ ] React app assets in correct directory
- [ ] Database upgrade completed
- [ ] PHP requirements met
- [ ] JavaScript console errors resolved
- [ ] Moodle cache cleared

## Performance Testing

- [ ] Page load times acceptable
- [ ] Video loading performance
- [ ] Multiple concurrent users
- [ ] Large playlist handling