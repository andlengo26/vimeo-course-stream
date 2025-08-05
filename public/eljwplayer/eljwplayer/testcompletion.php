<?php
require(__DIR__.'/../../config.php');
require_once($CFG->libdir . '/completionlib.php');

$cmid = 462;       // Replace with your CM ID
$userid = 215841;  // Replace with your test user ID

require_login();

echo "<pre>";

try {
    // Step 1: Get base CM and course info
    $rawcm = get_coursemodule_from_id('eljwplayer', $cmid, 0, false, MUST_EXIST);
    $course = get_course($rawcm->course);
    $context = context_module::instance($rawcm->id);

    // Step 2: Get modinfo and rich CM
    $modinfo = get_fast_modinfo($course);
    $cm = $modinfo->get_cm($cmid);

    // Step 3: Completion logic
    $completion = new completion_info($course);
    $isenabled = $completion->is_enabled($cm);

    echo "▶️ completion = {$rawcm->completion}, completionview = {$rawcm->completionview}\n";
    echo "▶️ Completion enabled? " . ($isenabled ? '✅ Yes' : '❌ No') . "\n";

    // Step 4: Call set_module_viewed (if completionview = 1)
    if ($isenabled && $rawcm->completion == 2 && $rawcm->completionview == 1) {
        echo "⏳ Calling set_module_viewed()...\n";
        $completion->set_module_viewed($cm);
        echo "✅ set_module_viewed() called.\n";
    }

    // Step 5: Fetch updated completion state
    $data = $completion->get_data($cm, false, $userid);
    echo "🎯 Completion state (from API): " . ($data->completionstate ?? 'N/A') . "\n";

} catch (Exception $e) {
    echo "❌ Exception: " . $e->getMessage();
}

echo "</pre>";
