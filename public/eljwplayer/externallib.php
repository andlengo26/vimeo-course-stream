<?php
// This file is part of Moodle - http://moodle.org/
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
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * eljwplayer external API
 *
 * @package    mod_eljwplayer
 * @category   external
 * @copyright  2015 Juan Leyva <juan@moodle.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @since      Moodle 3.0
 */

use mod_eljwplayer\controller\jwplayerApiService;

defined('MOODLE_INTERNAL') || die;

require_once("$CFG->libdir/externallib.php");

/**
 * eljwplayer external functions
 *
 * @package    mod_eljwplayer
 * @category   external
 * @copyright  2015 Juan Leyva <juan@moodle.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @since      Moodle 3.0
 */
class mod_eljwplayer_external extends external_api {

    /**
     * Track completion parameters
     */
    public static function track_completion_parameters() {
        return new external_function_parameters([
            'cmid' => new external_value(PARAM_INT, 'Course module ID'),
            'videoid' => new external_value(PARAM_ALPHANUMEXT, 'Video ID', VALUE_DEFAULT, ''),
            'completed' => new external_value(PARAM_INT, 'Completion status', VALUE_DEFAULT, 0),
        ]);
    }

    /**
     * Track completion implementation
     */
    public static function track_completion($cmid, $videoid = '', $completed = 0) {
        global $DB, $USER;
        require_once(dirname(__FILE__) . '/../../lib/completionlib.php');

        // Validate parameters
        $params = self::validate_parameters(self::track_completion_parameters(), [
            'cmid' => $cmid,
            'videoid' => $videoid,
            'completed' => $completed
        ]);

        // Get course module and validate access
        $cm = get_coursemodule_from_id('eljwplayer', $params['cmid'], 0, false, MUST_EXIST);
        $course = $DB->get_record('course', ['id' => $cm->course], '*', MUST_EXIST);
        $context = context_module::instance($cm->id);

        // Check capabilities
        self::validate_context($context);
        require_capability('mod/eljwplayer:view', $context);

        // Get activity instance
        $eljwplayer = $DB->get_record('eljwplayer', ['id' => $cm->instance], '*', MUST_EXIST);

        // Track individual video progress
        if (!empty($params['videoid']) && $params['videoid'] !== 'all') {
            $record = [
                'eljwplayerid' => $eljwplayer->id,
                'userid' => $USER->id,
                'videoid' => $params['videoid'],
                'completed' => $params['completed'],
                'timewatched' => time(),
                'timemodified' => time(),
                'course' => $course->id
            ];

            // Update or insert progress record
            $existing = $DB->get_record('eljwplayer_userprogress', [
                'eljwplayerid' => $eljwplayer->id,
                'userid' => $USER->id,
                'videoid' => $params['videoid']
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
            $shouldComplete = false;

            if ($params['completed'] && $params['videoid'] === 'all') {
                $shouldComplete = true;
            } else if ($eljwplayer->completionwatchvideo) {
                // Check completion based on watched videos
                if (!empty($eljwplayer->videosource)) {
                    $videoUrls = json_decode($eljwplayer->videosource, true);
                    if ($videoUrls && is_array($videoUrls)) {
                        $completedCount = $DB->count_records('eljwplayer_userprogress', [
                            'eljwplayerid' => $eljwplayer->id,
                            'userid' => $USER->id,
                            'completed' => 1
                        ]);

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

        return [
            'status' => 'success',
            'completed' => $params['completed'],
            'videoid' => $params['videoid']
        ];
    }

    /**
     * Track completion return values
     */
    public static function track_completion_returns() {
        return new external_single_structure([
            'status' => new external_value(PARAM_TEXT, 'Status'),
            'completed' => new external_value(PARAM_INT, 'Completion status'),
            'videoid' => new external_value(PARAM_ALPHANUMEXT, 'Video ID')
        ]);
    }

    /**
     * Track progress parameters
     */
    public static function track_progress_parameters() {
        return new external_function_parameters([
            'cmid' => new external_value(PARAM_INT, 'Course module ID'),
            'videoid' => new external_value(PARAM_ALPHANUMEXT, 'Video ID'),
            'progress' => new external_value(PARAM_INT, 'Progress percentage', VALUE_DEFAULT, 0),
        ]);
    }

    /**
     * Track progress implementation
     */
    public static function track_progress($cmid, $videoid, $progress = 0) {
        global $DB, $USER;

        // Validate parameters
        $params = self::validate_parameters(self::track_progress_parameters(), [
            'cmid' => $cmid,
            'videoid' => $videoid,
            'progress' => $progress
        ]);

        // Get course module and validate access
        $cm = get_coursemodule_from_id('eljwplayer', $params['cmid'], 0, false, MUST_EXIST);
        $context = context_module::instance($cm->id);

        // Check capabilities
        self::validate_context($context);
        require_capability('mod/eljwplayer:view', $context);

        // For now, just return success - detailed progress tracking can be added later
        return [
            'status' => 'success',
            'progress' => $params['progress'],
            'videoid' => $params['videoid']
        ];
    }

    /**
     * Track progress return values
     */
    public static function track_progress_returns() {
        return new external_single_structure([
            'status' => new external_value(PARAM_TEXT, 'Status'),
            'progress' => new external_value(PARAM_INT, 'Progress percentage'),
            'videoid' => new external_value(PARAM_ALPHANUMEXT, 'Video ID')
        ]);
    }

    /**
     * Returns description of method parameters
     *
     * @return external_function_parameters
     * @since Moodle 3.0
     */
    public static function get_jwplayermedia_parameters() {
        return new external_function_parameters(
            array(
                'playlist_id' => new external_value(PARAM_RAW, 'eljwplayer playlist_id')
            )
        );
    }

    /**
     * Get the media list from JWPlayer
     *
     * @param int $playlist_id the eljwplayer playlist_id
     * @return array of warnings and status result
     * @since Moodle 3.0
     * @throws moodle_exception
     */
    public static function get_jwplayermedia($playlist_id) {
        global $DB, $CFG;
        require_once($CFG->dirroot . "/mod/eljwplayer/lib.php");

        $params = self::validate_parameters(self::get_jwplayermedia_parameters(),
                                            array(
                                                'playlist_id' => $playlist_id
                                            ));

        $jwplayer = new jwplayerApiService();
        $options = $jwplayer->getMediaByPlaylistId($playlist_id);

        $result = array();
        $result['medias'] = $result;
        return $result;
    }

    /**
     * Returns description of method result value
     *
     * @return external_description
     * @since Moodle 3.0
     */
    public static function get_jwplayermedia_returns() {
        return new external_single_structure(
            array(
                'medias' => new external_multiple_structure(
                    new external_single_structure(
                        array(
                            'media_id' => new external_value(PARAM_RAW, 'JW Player Media id'),
                            'media_name' => new external_value(PARAM_RAW, 'JW Player Media name')
                        )
                    )
                )
            )
        );
    }

    /**
     * Returns description of method parameters
     *
     * @return external_function_parameters
     * @since Moodle 3.0
     */
    public static function view_jwplayermedia_parameters() {
        return new external_function_parameters(
            array(
                'eljwplayerid' => new external_value(PARAM_INT, 'eljwplayerid instance id')
            )
        );
    }

    /**
     * Trigger the course module viewed event and update the module completion status.
     *
     * @param int $eljwplayerid the eljwplayerid instance id
     * @return array of warnings and status result
     * @since Moodle 3.0
     * @throws moodle_exception
     */
    public static function view_jwplayermedia($eljwplayerid) {
        global $DB, $CFG;
        require_once($CFG->dirroot . "/mod/eljwplayer/lib.php");

        $params = self::validate_parameters(self::view_jwplayermedia_parameters(),
            array(
                'eljwplayerid' => $eljwplayerid
            ));
        $warnings = array();

        // Request and permission validation.
        $eljwplayer = $DB->get_record('eljwplayer', array( 'id' => $params['eljwplayerid'] ), '*', MUST_EXIST);
        list($course, $cm) = get_course_and_cm_from_instance($eljwplayer, 'eljwplayer');

        $context = context_module::instance($cm->id);
        self::validate_context($context);

        require_capability('mod/eljwplayer:view', $context);

        // Call the eljwplayer/lib API.
        eljwplayer_view($eljwplayer,$course, $cm, $context, true);

        $result = array();
        $result['status'] = true;
        $result['warnings'] = $warnings;
        return $result;
    }

    /**
     * Returns description of method result value
     *
     * @return external_description
     * @since Moodle 3.0
     */
    public static function view_jwplayermedia_returns() {
        return new external_single_structure(
            array(
                'status' => new external_value(PARAM_BOOL, 'status: true if success'),
                'warnings' => new external_warnings()
            )
        );
    }
}
