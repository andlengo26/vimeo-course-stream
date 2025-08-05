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
 * URL external functions and service definitions.
 *
 * @package    mod_url
 * @category   external
 * @copyright  2015 Juan Leyva <juan@moodle.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @since      Moodle 3.0
 */

defined('MOODLE_INTERNAL') || die;

// Define an Iomad service
$services = array(
    'mod_eljwplayer' => array(
        'functions' => array(
            'mod_eljwplayer_get_jwplayermedia',
            'mod_eljwplayer_view_jwplayermedia',
            'mod_eljwplayer_track_completion',
            'mod_eljwplayer_track_progress'
        ),
        'restrictedusers' => 0,
        'enabled' => 1,
    )
);

$functions = array(

    'mod_eljwplayer_get_jwplayermedia' => array(
        'classname'     => 'mod_eljwplayer_external',
        'classpath'     => 'mod/eljwplayer/externallib.php',
        'methodname'    => 'get_jwplayermedia',
        'description'   => 'Get the media list from JWPlayer',
        'type'          => 'read',
        'capabilities'  => 'mod/eljwplayer:view',
        'ajax' => true,
    ),
    'mod_eljwplayer_view_jwplayermedia' => array(
        'classname'     => 'mod_eljwplayer_external',
        'classpath'     => 'mod/eljwplayer/externallib.php',
        'methodname'    => 'view_jwplayermedia',
        'description'   => 'View JW PLayer media and complete the activity after finish watching the video',
        'type'          => 'read',
        'capabilities'  => 'mod/eljwplayer:view',
        'ajax' => true,
    ),
    'mod_eljwplayer_track_completion' => array(
        'classname'     => 'mod_eljwplayer_external',
        'classpath'     => 'mod/eljwplayer/externallib.php',
        'methodname'    => 'track_completion',
        'description'   => 'Track video completion for Vimeo playlist',
        'type'          => 'write',
        'capabilities'  => 'mod/eljwplayer:view',
        'ajax' => true,
    ),
    'mod_eljwplayer_track_progress' => array(
        'classname'     => 'mod_eljwplayer_external',
        'classpath'     => 'mod/eljwplayer/externallib.php',
        'methodname'    => 'track_progress',
        'description'   => 'Track video progress for Vimeo playlist',
        'type'          => 'write',
        'capabilities'  => 'mod/eljwplayer:view',
        'ajax' => true,
    )
);
