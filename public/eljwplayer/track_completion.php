<?php
/**
 * AJAX endpoint for tracking video completion
 *
 * @package    mod_eljwplayer
 * @copyright  2025
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

define('AJAX_SCRIPT', true);
require_once(__DIR__ . '/../../config.php');
require_once($CFG->libdir . '/completionlib.php');

// Get parameters
$cmid = required_param('cmid', PARAM_INT);
$videoid = optional_param('videoid', '', PARAM_ALPHANUMEXT);
$completed = optional_param('completed', 0, PARAM_INT);

// Require login
require_login();

// Get course module and context
try {
    $cm = get_coursemodule_from_id('eljwplayer', $cmid, 0, false, MUST_EXIST);
    $course = $DB->get_record('course', array('id' => $cm->course), '*', MUST_EXIST);
    $context = context_module::instance($cm->id);
    
    // Check capability
    require_capability('mod/eljwplayer:view', $context);
    
    // Get activity instance
    $eljwplayer = $DB->get_record('eljwplayer', array('id' => $cm->instance), '*', MUST_EXIST);
    
} catch (Exception $e) {
    header('HTTP/1.1 400 Bad Request');
    echo json_encode(['error' => 'Invalid course module']);
    exit;
}

// Track progress in database
if (!empty($videoid) && $videoid !== 'all') {
    $record = [
        'eljwplayerid' => $eljwplayer->id,
        'userid' => $USER->id,
        'videoid' => $videoid,
        'completed' => $completed,
        'timewatched' => time(),
        'timemodified' => time(),
        'course' => $course->id
    ];
    
    // Check if record exists
    $existing = $DB->get_record('eljwplayer_userprogress', [
        'eljwplayerid' => $eljwplayer->id,
        'userid' => $USER->id,
        'videoid' => $videoid
    ]);
    
    if ($existing) {
        $record['id'] = $existing->id;
        $DB->update_record('eljwplayer_userprogress', $record);
    } else {
        $DB->insert_record('eljwplayer_userprogress', $record);
    }
}

// Handle activity completion
$completion = new completion_info($course);
if ($completion->is_enabled($cm)) {
    // Check completion conditions
    $shouldComplete = false;
    
    if ($completed && $videoid === 'all') {
        // All videos completed
        $shouldComplete = true;
    } else if ($eljwplayer->completionwatchvideo) {
        // Check if completion condition is met
        if (!empty($eljwplayer->videosource)) {
            $videoUrls = json_decode($eljwplayer->videosource, true);
            if ($videoUrls && is_array($videoUrls)) {
                // Count completed videos
                $completedCount = $DB->count_records('eljwplayer_userprogress', [
                    'eljwplayerid' => $eljwplayer->id,
                    'userid' => $USER->id,
                    'completed' => 1
                ]);
                
                // Check completion percentage
                $totalVideos = count($videoUrls);
                $completionPercentage = $totalVideos > 0 ? ($completedCount / $totalVideos) * 100 : 0;
                
                if ($completionPercentage >= $eljwplayer->completionwatchvideo) {
                    $shouldComplete = true;
                }
            }
        }
    }
    
    if ($shouldComplete) {
        $completion->update_state($cm, COMPLETION_COMPLETE, $USER->id);
    }
}

// Return success response
header('Content-Type: application/json');
echo json_encode([
    'status' => 'success',
    'completed' => $completed,
    'videoid' => $videoid
]);