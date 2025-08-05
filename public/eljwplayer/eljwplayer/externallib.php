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
