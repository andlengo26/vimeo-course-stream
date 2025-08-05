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
 * The main mod_eljwplayer configuration form.
 *
 * @package   mod_eljwplayer
 * @copyright 2022 Elearnified Inc.
 * @license   https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

use mod_eljwplayer\controller\jwplayerApiService;

defined('MOODLE_INTERNAL') || die();

require_once $CFG->dirroot.'/course/moodleform_mod.php';

/**
 * Module instance settings form.
 *
 * @package   mod_eljwplayer
 * @copyright 2021 eljwplayer (Pty) Ptd
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class mod_eljwplayer_mod_form extends moodleform_mod
{

    /**
     * Defines forms elements
     */
    public function definition()
    {
        global $CFG, $PAGE;
        $PAGE->requires->js_call_amd('mod_eljwplayer/repository', 'init');

        $mform = $this->_form;

        // Adding the "general" fieldset, where all the common settings are shown.
        $mform->addElement('header', 'general', get_string('general', 'form'));

        // Adding the standard "name" field
        $mform->addElement('text', 'name', get_string('activityname', 'mod_eljwplayer'), array('size' => '64'));
        $mform->setType('name', PARAM_TEXT);
        $mform->addRule('name', null, 'required', null, 'client');
        $mform->addRule('name', get_string('maximumchars', '', 300), 'maxlength', 300, 'client');

//        $jwplayer = new jwplayerApiService();
//        $options = $jwplayer->getPlaylists();

//        $mform->addElement('select', 'playlist_id', get_string('playlist_id', 'mod_eljwplayer'), $options, ['id'=>'jwplayerplaylistselect']);
//        $mform->setType('playlist_id', PARAM_TEXT);

//        $mform->addElement('select', 'media_id', get_string('media_id', 'mod_eljwplayer'), [], ['id'=>'jwplayermediaselect']);
//        $mform->setType('media_id', PARAM_TEXT);

        $mform->addElement('select', 'videosource', get_string('videosource', 'mod_eljwplayer'), [
            'vimeo' => get_string('vimeo', 'mod_eljwplayer'),
            'jwplayer' => get_string('jwplayer', 'mod_eljwplayer'),
        ]);
        $mform->setDefault('videosource', 'vimeo');
        $mform->setType('videosource', PARAM_ALPHA);

        $mform->addElement('text', 'media_id', get_string('media_id', 'mod_eljwplayer'), array('size' => '64'));
        $mform->setType('media_id', PARAM_TEXT);
        $mform->addRule('media_id', get_string('maximumchars', '', 8), 'maxlength', 8, 'client');

        $mform->addElement('text', 'playlist_id', get_string('playlist_id', 'mod_eljwplayer'), array('size' => '64'));
        $mform->setType('playlist_id', PARAM_TEXT);
        $mform->addRule('playlist_id', get_string('maximumchars', '', 8), 'maxlength', 8, 'client');

        $mform->addElement('text', 'video_url', get_string('video_url', 'mod_eljwplayer'), ['size' => '64']);
        $mform->setType('video_url', PARAM_URL);


        // Adding the standard "intro" and "introformat" fields.
        if ($CFG->branch >= 29) {
            $this->standard_intro_elements();
        } else {
            $this->add_intro_editor();
        }

        $mform->addElement('advcheckbox', 'add_lock', get_string('addlock', 'mod_eljwplayer'));
        $mform->addHelpButton('add_lock', 'addlock', 'mod_eljwplayer');

        // Add standard grading elements.
        $this->standard_grading_coursemodule_elements();
        $mform->setDefault('grade', false);

        // Add standard elements, common to all modules.
        $this->standard_coursemodule_elements();
        $this->apply_admin_defaults();

        // Add standard buttons, common to all modules.
        $this->add_action_buttons();
    }

    public function add_completion_rules() {
        $mform = $this->_form;

        $mform->addElement('checkbox', 'completionwatchvideo',
            get_string('completionwatchvideo', 'mod_eljwplayer'));
        $mform->setType('completionwatchvideo', PARAM_INT);
        $mform->addHelpButton('completionwatchvideo', 'completionwatchvideo', 'mod_eljwplayer');
        $mform->setDefault('completionwatchvideo', 0);

        return ['completionwatchvideo'];
    }

    public function completion_rule_enabled($data) {
        return !empty($data['completionwatchvideo']);
    }


    /**
     * Enforce validation rules here
     *
     * @param object $data Post data to validate
     *
     * @return array
     **/
    public function validation($data, $files)
    {
        $errors = parent::validation($data, $files);
        return $errors;
    }
}
