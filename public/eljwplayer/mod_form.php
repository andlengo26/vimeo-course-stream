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
        $PAGE->requires->js_call_amd('mod_eljwplayer/form-enhancement', 'init');

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

        // JWPlayer settings
        $mform->addElement('header', 'jwplayersettings', get_string('jwplayersettings', 'mod_eljwplayer'));
        
        $mform->addElement('text', 'media_id', get_string('media_id', 'mod_eljwplayer'), array('size' => '64'));
        $mform->setType('media_id', PARAM_TEXT);
        $mform->addRule('media_id', get_string('maximumchars', '', 8), 'maxlength', 8, 'client');
        $mform->hideIf('media_id', 'videosource', 'neq', 'jwplayer');

        $mform->addElement('text', 'playlist_id', get_string('playlist_id', 'mod_eljwplayer'), array('size' => '64'));
        $mform->setType('playlist_id', PARAM_TEXT);
        $mform->addRule('playlist_id', get_string('maximumchars', '', 8), 'maxlength', 8, 'client');
        $mform->hideIf('playlist_id', 'videosource', 'neq', 'jwplayer');

        // Legacy single video support
        $mform->addElement('text', 'video_url', get_string('video_url', 'mod_eljwplayer'), ['size' => '64']);
        $mform->setType('video_url', PARAM_URL);
        $mform->addHelpButton('video_url', 'video_url', 'mod_eljwplayer');
        $mform->hideIf('video_url', 'videosource', 'neq', 'vimeo');

        // Vimeo playlist settings
        $mform->addElement('header', 'vimeosettings', get_string('vimeosettings', 'mod_eljwplayer'));
        
        // Dynamic Vimeo URLs field with add button
        $mform->addElement('html', '<div id="vimeo-urls-container">');
        $mform->addElement('textarea', 'vimeo_urls', get_string('vimeourls', 'mod_eljwplayer'), 
            ['rows' => 5, 'cols' => 60, 'placeholder' => get_string('vimeourls_placeholder', 'mod_eljwplayer')]);
        $mform->setType('vimeo_urls', PARAM_TEXT);
        $mform->addHelpButton('vimeo_urls', 'vimeourls', 'mod_eljwplayer');
        $mform->addElement('html', '</div>');
        $mform->hideIf('vimeo_urls', 'videosource', 'neq', 'vimeo');

        $mform->addElement('advcheckbox', 'continuousplay', get_string('continuousplay', 'mod_eljwplayer'));
        $mform->setDefault('continuousplay', 1);
        $mform->addHelpButton('continuousplay', 'continuousplay', 'mod_eljwplayer');

        $mform->addElement('advcheckbox', 'autoplay', get_string('autoplay', 'mod_eljwplayer'));
        $mform->setDefault('autoplay', 1);
        $mform->addHelpButton('autoplay', 'autoplay', 'mod_eljwplayer');

        $mform->addElement('advcheckbox', 'showendscreen', get_string('showendscreen', 'mod_eljwplayer'));
        $mform->setDefault('showendscreen', 1);
        $mform->addHelpButton('showendscreen', 'showendscreen', 'mod_eljwplayer');

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

        $group = array();
        $group[] = $mform->createElement('checkbox', 'completionwatchvideo', '',
            get_string('completionwatchvideo', 'mod_eljwplayer'));
        $group[] = $mform->createElement('text', 'completionwatchvideo', '', array('size' => 3));
        $mform->setType('completionwatchvideo', PARAM_INT);
        $mform->addGroup($group, 'completionwatchvideogroup', 
            get_string('completionwatchvideo', 'mod_eljwplayer'), ' ', false);
        $mform->addHelpButton('completionwatchvideogroup', 'completionwatchvideo', 'mod_eljwplayer');
        $mform->setDefault('completionwatchvideo', 100);

        return ['completionwatchvideogroup'];
    }

    public function completion_rule_enabled($data) {
        return !empty($data['completionwatchvideo']);
    }

    public function data_preprocessing(&$default_values) {
        parent::data_preprocessing($default_values);
        
        // Handle vimeo_urls field - convert JSON array back to newline-separated text
        if (!empty($default_values['vimeo_urls'])) {
            $videoUrls = json_decode($default_values['vimeo_urls'], true);
            if (is_array($videoUrls)) {
                $default_values['vimeo_urls'] = implode("\n", $videoUrls);
            }
        }
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
        
        // Validate based on selected video source
        if (!empty($data['videosource'])) {
            if ($data['videosource'] === 'vimeo') {
                // Validate Vimeo URLs if provided
                if (!empty($data['vimeo_urls']) && is_string($data['vimeo_urls'])) {
                    $lines = array_filter(array_map('trim', explode("\n", $data['vimeo_urls'])));
                    foreach ($lines as $line) {
                        if (!empty($line) && !preg_match('/^https:\/\/vimeo\.com\/\d+/', $line)) {
                            $errors['vimeo_urls'] = get_string('invalidvimeourl', 'mod_eljwplayer');
                            break;
                        }
                    }
                } else if ($data['videosource'] === 'vimeo' && empty($data['vimeo_urls'])) {
                    $errors['vimeo_urls'] = get_string('vimeourlsrequired', 'mod_eljwplayer');
                }
            } elseif ($data['videosource'] === 'jwplayer') {
                // Validate that either media_id or playlist_id is provided for JWPlayer
                if (empty($data['media_id']) && empty($data['playlist_id'])) {
                    $errors['media_id'] = get_string('jwplayer_id_required', 'mod_eljwplayer');
                }
            }
        }
        
        return $errors;
    }
    
    /**
     * Process form data before saving
     */
    public function get_data() {
        $data = parent::get_data();
        if ($data) {
            // Convert newline-separated Vimeo URLs to JSON array
            if (!empty($data->vimeo_urls) && is_string($data->vimeo_urls)) {
                $lines = array_filter(array_map('trim', explode("\n", $data->vimeo_urls)));
                $data->vimeo_urls = json_encode(array_values($lines));
            }
        }
        return $data;
    }
}
