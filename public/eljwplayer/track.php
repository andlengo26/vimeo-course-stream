<?php
require(__DIR__.'/../../config.php');
require_once($CFG->libdir . '/completionlib.php');

$id = required_param('id', PARAM_INT); // Course module ID
require_login();

// STEP 1: Get raw CM and course
$rawcm = get_coursemodule_from_id('eljwplayer', $id, 0, false, MUST_EXIST);
$course = get_course($rawcm->course);
$context = context_module::instance($rawcm->id);
require_capability('mod/eljwplayer:view', $context);

// STEP 2: Get full CM (with customdata)
$modinfo = get_fast_modinfo($course);
$cm = $modinfo->get_cm($id);

// STEP 3: Insert or update user progress (custom logic)
$record = [
    'trackerid' => $cm->instance,
    'userid' => $USER->id,
    'completed' => 1,
    'timewatched' => time(),
    'timemodified' => time(),
    'course' => $course->id
];

if ($existing = $DB->get_record('vimeotracker_userprogress', [
    'trackerid' => $cm->instance,
    'userid' => $USER->id
])) {
    $record['id'] = $existing->id;
    $DB->update_record('vimeotracker_userprogress', $record);
} else {
    $DB->insert_record('vimeotracker_userprogress', $record);
}

// STEP 4: Handle completion
$completion = new completion_info($course);

if ($completion->is_enabled($cm)) {
    // Option 1: If set to complete on view, use this
    if ($cm->completion == COMPLETION_TRACKING_AUTOMATIC && $cm->completionview) {
        $completion->set_module_viewed($cm);
    } else {
        // Option 2: fallback to manual rule update (e.g., if using completionwatchvideo)
        $completion->update_state($cm, COMPLETION_COMPLETE, $USER->id);
    }
}

echo json_encode(['status' => 'complete']);
