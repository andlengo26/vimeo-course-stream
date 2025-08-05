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
 * Defines backup_eljwplayer_activity_task class
 *
 * @package      mod_eljwplayer
 * @category    backup
 * @copyright   2022 Elearnified, Inc
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die;

require_once($CFG->dirroot . '/mod/eljwplayer/backup/moodle2/backup_eljwplayer_stepslib.php');

/**
 * Provides all the settings and steps to perform one complete backup of the activity
 */
class backup_eljwplayer_activity_task extends backup_activity_task {

    /**
     * No specific settings for this activity
     */
    protected function define_my_settings() {
    }

    /**
     * Defines a backup step to store the instance data in the eljwplayer.xml file
     */
    protected function define_my_steps() {
        $this->add_step(new backup_eljwplayer_activity_structure_step('eljwplayer_structure', 'eljwplayer.xml'));
    }

    /**
     * Encodes eljwplayers to the index.php and view.php scripts
     *
     * @param string $content some HTML text that eventually contains eljwplayers to the activity instance scripts
     * @return string the content with the eljwplayers encoded
     */
    static public function encode_content_links($content) {
        global $CFG;

        $base = preg_quote($CFG->wwwroot.'/mod/eljwplayer','#');

        //Access a list of all links in a course
        $pattern = '#('.$base.'/index\.php\?id=)([0-9]+)#';
        $replacement = '$@ELJWPLAYERINDEX*$2@$';
        $content = preg_replace($pattern, $replacement, $content);

        //Access the link supplying a course module id
        $pattern = '#('.$base.'/view\.php\?id=)([0-9]+)#';
        $replacement = '$@ELJWPLAYERVIEWBYID*$2@$';
        $content = preg_replace($pattern, $replacement, $content);

        //Access the link supplying an instance id
        $pattern = '#('.$base.'/view\.php\?u=)([0-9]+)#';
        $replacement = '$@ELJWPLAYERVIEWBYL*$2@$';
        $content = preg_replace($pattern, $replacement, $content);

        return $content;
    }
}
