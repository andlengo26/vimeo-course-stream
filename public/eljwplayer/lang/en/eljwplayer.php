<?php

// This file is part of Moodle - https://moodle.org/
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
 * Plugin strings are defined here.
 *
 * @package   mod_eljwplayer
 * @category  string
 * @copyright 2021 eljwplayer (Pty) Ptd
 * @license   https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

$string['activityname'] = 'Activity Name';
$string['addlock'] = 'Only allow access during specified time.';
$string['addlock_help'] = 'Determines whether or not access to the Space will be locked of to only a certain time period. If this is left unchecked students will be able to enter at any time. Leave this unchecked for recurring lessons.';
$string['apiconnected'] = 'Successfully connected to eljwplayer API';
$string['apikey'] = 'API Key';
$string['apikey_description'] = 'Your organisation\'s eljwplayer API Key which you can find in the developer tab of your eljwplayer dashboard settings.';
$string['apinotconnected'] = 'Unable to connect to eljwplayer API';

$string['date'] = 'Date';
$string['duration'] = 'Duration';
$string['duration_help'] = 'Determines the duration that the space can be accessed for. I.e. once the duration has elapsed past the start time no students will be able to enter the space. Setting a negative or zero duration will mean that there isn\'t an end time on the Space.';

$string['endtime'] = 'End time';
$string['errorapikeyinvalid'] = 'Invalid eljwplayer API key';
$string['errorapikeynotdefined'] = 'eljwplayer API key not set';
$string['errorstarttimeinthepast'] = 'Start time must be a date in the future';
$string['extrasettings'] = 'Looking to edit feature, theme or locale settings of your Spaces? Make sure to checkout your <a href="https://www.theeljwplayer.com/settings/spaces" target="_blank">Space Settings</a> on your eljwplayer Dashboard';

$string['indicator:cognitivedepth'] = 'eljwplayer cognitive';
$string['indicator:cognitivedepth_help'] = 'This indicator is based on the cognitive depth reached by the student in a eljwplayer activity.';
$string['indicator:socialbreadth'] = 'eljwplayer social';
$string['indicator:socialbreadth_help'] = 'This indicator is based on the social breadth reached by the student in a eljwplayer activity.';

$string['joinspace'] = 'Join Space';

$string['eljwplayer:addinstance'] = 'Add a new JW Player';
$string['eljwplayer:view'] = 'View JW Player';

$string['managerviewunavailablespaceexplanation'] = 'As a manager you may still join this space. Non managers are no longer able to join this space and will not see the "Join Space" button.';
$string['missingidandcmid'] = 'You must specify a course_module ID or an instance ID';
$string['modulename'] = 'Elearnified JW Player';
$string['modulenameplural'] = 'Elearnified JW Players';
$string['modulename_help'] = 'The best way to teach online. Teach live, one-on-one, or with a group, using the most versatile collaborative space for online lessons.';

$string['pluginadministration'] = 'Manage JW Player';
$string['pluginname'] = 'Elearnified JW Player';
$string['privacy:metadata:eljwplayer_api'] = 'In order to integrate with the eljwplayer API correctly, user data needs to be exchanged with the API.';
$string['privacy:metadata:eljwplayer_api:email'] = 'Emails are sent to API when joining a space in order correctly identify users on eljwplayer and provide accurate session tracking.';
$string['privacy:metadata:eljwplayer_api:name'] = 'Names are sent to our API when joing a space in order to allow for identification of the user when entering the Space.';
$string['privacy:metadata:eljwplayer_api:userid'] = 'User IDs are sent to our API when joinging a space in order to uniquely identify users in a space.';

$string['search:activity'] = 'eljwplayer - activity information';
$string['spacefinishedexplanation'] = 'This activity is finished and this space cannot be entered.';
$string['playlist_id'] = 'Playlist ID';
$string['media_id'] = 'Media ID';
$string['player_id'] = 'Player ID';
$string['player_id_description'] = 'An eight-character, alpha-numeric ID (ex: ALJ3XQCI) that uniquely identifies the player';
$string['site_id'] = 'Site ID';
$string['site_id_description'] = 'The site ID is an unique identifier for an account property. This value is sometimes referred to as the Property ID.';
$string['spaceid_help'] = 'The ID of the space. <b>NOTE:</b> This should be unique across all Spaces. Using the ID of an existing Space will not create a new space but will simply use the existing Space with that ID.';
$string['starttime'] = 'Start Time';
$string['starttime_help'] = 'Determines the earliest time that students can enter the Space.';

$string['viewduration'] = '{$a} hour(s)';


$string['video_url'] = 'Vimeo Video URL';
$string['video_url_help'] = 'Enter the full Vimeo video URL, e.g., https://vimeo.com/123456789';
$string['vimeotracker:addinstance'] = 'Add a new Vimeo Tracker activity';
$string['vimeotracker:view'] = 'View Vimeo Tracker activity';
$string['invalidvimeourl'] = 'Invalid Vimeo URL.';
$string['completionwatchvideo'] = 'Student must watch the video to complete this activity';
$string['completionwatchvideo_help'] = 'If enabled, the activity will only be marked as complete once the student finishes watching the video.';
$string['videosource'] = 'Video source';
$string['vimeo'] = 'Vimeo';
$string['jwplayer'] = 'JWPlayer';

// Vimeo playlist settings
$string['vimeosettings'] = 'Vimeo Playlist Settings';
$string['vimeourls'] = 'Vimeo Video URLs';
$string['vimeourls_help'] = 'Enter one Vimeo video URL per line. Students will watch these videos in order as a playlist.';
$string['vimeourls_placeholder'] = "https://vimeo.com/123456789\nhttps://vimeo.com/987654321\nhttps://vimeo.com/456789123";
$string['continuousplay'] = 'Continuous play';
$string['continuousplay_help'] = 'Automatically advance to the next video when one finishes.';
$string['autoplay'] = 'Autoplay';
$string['autoplay_help'] = 'Automatically start playing videos when they load.';
$string['showendscreen'] = 'Show completion screen';
$string['showendscreen_help'] = 'Show a completion screen when all videos have been watched.';
$string['completionwatchvideo_help'] = 'Student must watch a percentage of videos to complete this activity. Enter the percentage (1-100) of videos that must be watched.';
