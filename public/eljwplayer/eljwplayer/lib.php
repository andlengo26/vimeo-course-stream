<?php
// This file is part of the eljwplayer plugin for Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <https://www.gnu.org/licenses/>.

/**
 * Library of interface functions and constants.
 *
 * @package   mod_eljwplayer
 * @copyright 2022 Elearnified Inc.
 * @license   https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

// require_once $CFG->dirroot.'/mod/eljwplayer/lib.php';


/**
 * Exception for 4xx response from the eljwplayer API.
 *
 * @copyright 2022 Elearnified Inc.
 * @license   https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class eljwplayer_bad_request_exception extends moodle_exception
{
    public $response = null;

    /**
     * Constructor
     *
     * @param string $response    Web service response
     * @param int    $status_code HTTP status code of the response
     */
    public function __construct($response, $status_code)
    {
        $this->response = $response;
        parent::__construct('errorapiservice', 'mod_eljwplayer', '', $response);
    }
}


/**
 * Return if the plugin supports $feature.
 *
 * @param  string $feature Constant representing the feature.
 * @return true | null True if the feature is supported, null otherwise.
 */
function eljwplayer_supports($feature)
{
    // print_r($feature);die;
    switch ($feature) {
        case FEATURE_MOD_ARCHETYPE:
            return MOD_ARCHETYPE_RESOURCE;
        case FEATURE_COMPLETION_HAS_RULES: 
        case FEATURE_COMPLETION_TRACKS_VIEWS:
        case FEATURE_GRADE_HAS_GRADE:
        case FEATURE_GROUPINGS:
        case FEATURE_GROUPMEMBERSONLY:
        case FEATURE_MOD_INTRO:  
        case FEATURE_SHOW_DESCRIPTION:
            return true;
        case FEATURE_BACKUP_MOODLE2:
            return true;
        default:
            return null;
    }
}

function eljwplayer_completion_rule_enabled($data) {
    return !empty($data['completionwatchvideo']);
}

function eljwplayer_get_completion_state($course, $cm, $userid, $type) {
    global $DB;
    if (!empty($cm->customdata['completionwatchvideo']) || !empty($cm->completionwatchvideo)) {
        return $DB->record_exists('vimeotracker_userprogress', [
            'trackerid' => $cm->instance,
            'userid' => $userid,
            'completed' => 1
        ]);
    }
    return true;
}

function eljwplayer_get_coursemodule_info($coursemodule) {
    global $DB;

    debugging("✅ eljwplayer_get_coursemodule_info() was called", DEBUG_DEVELOPER);

    $info = new cached_cm_info();
    $record = $DB->get_record('eljwplayer', ['id' => $coursemodule->instance], '*', MUST_EXIST);
    $info->customdata['completionwatchvideo'] = $record->completionwatchvideo;

    return $info;
}

/**
 * Saves a new instance of the mod_eljwplayer into the database.
 *
 * Given an object containing all the necessary data, (defined by the form
 * in mod_form.php) this function will create a new instance and return the id
 * number of the instance.
 *
 * @param object                   $eljwplayerinstance An object from the form.
 * @param mod_eljwplayer_mod_form $mform         The form.
 *
 * @return int The id of the newly inserted record.
 */
function eljwplayer_add_instance($eljwplayerinstance, mod_eljwplayer_mod_form $mform = null)
{
    global $CFG, $DB;

    $eljwplayerinstance->timecreated = time();
    $eljwplayerinstance->completionwatchvideo = !empty($eljwplayerinstance->completionwatchvideo) ? 1 : 0;
    $id = $DB->insert_record('eljwplayer', $eljwplayerinstance);

    return $id;
}

/**
 * Updates an instance of the mod_eljwplayer in the database.
 *
 * Given an object containing all the necessary data (defined in mod_form.php),
 * this function will update an existing instance with new data.
 *
 * @param object                   $eljwplayerinstance An object from the form in mod_form.php.
 * @param mod_eljwplayer_mod_form $mform          The form.
 *
 * @return bool True if successful, false otherwise.
 */
function eljwplayer_update_instance($eljwplayerinstance, mod_eljwplayer_mod_form $mform = null)
{
    global $DB;

    $eljwplayerinstance->id = $eljwplayerinstance->instance;
    $eljwplayerinstance->timemodified = time();
    $eljwplayerinstance->completionwatchvideo = !empty($eljwplayerinstance->completionwatchvideo) ? 1 : 0;

    return $DB->update_record('eljwplayer', $eljwplayerinstance);
}

/**
 * Removes an instance of the mod_eljwplayer from the database.
 *
 * @param int $id Id of the module instance.
 *
 * @return bool True if successful, false on failure.
 */
function eljwplayer_delete_instance($id)
{
    global $CFG, $DB;
    $exists = $DB->get_record('eljwplayer', array('id' => $id));
    if (!$exists) {
        return false;
    }
    $DB->delete_records('eljwplayer', array('id' => $id));
    return true;
}

/**
 * Mark the activity completed (if required) and trigger the course_module_viewed event.
 *
 * @param  stdClass $eljwplayer        eljwplayer object
 * @param  stdClass $course     course object
 * @param  stdClass $cm         course module object
 * @param  stdClass $context    context object
 * @param  bool $is_complete    hack completion
 * @since Moodle 3.0
 */
function eljwplayer_view($eljwplayer, $course, $cm, $context, $is_complete = false) {

    // Trigger course_module_viewed event.
    $params = array(
        'context' => $context,
        'objectid' => $eljwplayer->id
    );

    $event = \mod_eljwplayer\event\course_module_viewed::create($params);
    $event->add_record_snapshot('course_modules', $cm);
    $event->add_record_snapshot('course', $course);
    $event->add_record_snapshot('eljwplayer', $eljwplayer);
    $event->trigger();

    if( $is_complete ){
        // Completion.
        $completion = new completion_info($course);
        $completion->set_module_viewed($cm);
    }
}

function mod_eljwplayer_cm_info_view(cm_info $cm) {
    global $PAGE, $OUTPUT;

    // Safely check if editing mode is on.
    $isediting = isset($PAGE) && method_exists($PAGE, 'user_is_editing') && $PAGE->user_is_editing();

    $url = new moodle_url('/mod/eljwplayer/view.php', ['id' => $cm->id]);

    // Build custom link with icon and name.
    $icon = $OUTPUT->pix_icon('icon', '', 'mod_eljwplayer', ['class' => 'iconlarge activityicon']);
    $customlink = html_writer::link($url,
        $icon . html_writer::span($cm->name, 'instancename'),
        ['class' => 'aalink']
    );


    // Prevent duplicate output when not editing (only show our custom output).
    if (!$isediting) {
        $cm->set_content($customlink);

        $cm->name = '';
    }
}




// function vimeotracker_get_completion_state($course, $cm, $userid, $type) {
//     global $DB;

//     if ($type !== COMPLETION_AND_VIEWED) {
//         return false;
//     }

//     // Check the rule is enabled
//     $activity = $DB->get_record('vimeotracker', ['id' => $cm->instance], '*', MUST_EXIST);
//     if (empty($activity->completionwatchvideo)) {
//         return true; // No completion rule set; let Moodle handle fallback
//     }

//     // Check if the user has completed the video
//     return $DB->record_exists('vimeotracker_userprogress', [
//         'trackerid' => $activity->id,
//         'userid' => $userid,
//         'completed' => 1
//     ]);
// }
