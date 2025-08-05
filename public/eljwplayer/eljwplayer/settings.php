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
 * Plugin administration pages are defined here.
 *
 * @package   mod_eljwplayer
 * @category  admin
 * @copyright 2022 Elearnified Inc.
 * @license   https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

if ($hassiteconfig) {
    $settings = new admin_settingpage('modsettingseljwplayer', get_string('pluginname', 'mod_eljwplayer'));

    if ($ADMIN->fulltree) {

        $settings->add(
            new admin_setting_configpasswordunmask(
                'mod_eljwplayer/apikey',
                get_string('apikey', 'mod_eljwplayer'),
                get_string('apikey_description', 'mod_eljwplayer'),
                '',
                PARAM_ALPHANUMEXT,
                256
            )
        );

        $settings->add(
            new admin_setting_configtext(
                'mod_eljwplayer/siteid',
                get_string('site_id', 'mod_eljwplayer'),
                get_string('site_id_description', 'mod_eljwplayer'),
                '',
                PARAM_ALPHANUMEXT,
                48
            )
        );

        $settings->add(
            new admin_setting_configtext(
                'mod_eljwplayer/playerid',
                get_string('player_id', 'mod_eljwplayer'),
                get_string('player_id_description', 'mod_eljwplayer'),
                '',
                PARAM_ALPHANUMEXT,
                48
            )
        );
    }
}
