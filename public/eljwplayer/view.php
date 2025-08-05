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
 * Prints an instance of mod_eljwplayer.
 *
 * @package   mod_eljwplayer
 * @copyright 2022 Elearnified Inc.
 * @license   https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

use mod_eljwplayer\controller\jwplayerApiService;

require __DIR__ . '/../../config.php';
require_once __DIR__ . '/lib.php';

// Course_module ID, or
$id = optional_param('id', 0, PARAM_INT);

//iframe embed
$iframe = optional_param('iframe', false, PARAM_BOOL);

// ... module instance id.
$l = optional_param('l', 0, PARAM_INT);

if ($id) {
    $cm             = get_coursemodule_from_id('eljwplayer', $id, 0, false, MUST_EXIST);
    $course         = $DB->get_record('course', array( 'id' => $cm->course ), '*', MUST_EXIST);
    $eljwplayer = $DB->get_record('eljwplayer', array( 'id' => $cm->instance ), '*', MUST_EXIST);
} elseif ($l) {
    $eljwplayer = $DB->get_record('eljwplayer', array( 'id' => $n ), '*', MUST_EXIST);
    $course         = $DB->get_record('course', array( 'id' => $eljwplayer->course ), '*', MUST_EXIST);
    $cm             = get_coursemodule_from_instance('eljwplayer', $eljwplayer->id, $course->id, false, MUST_EXIST);
} else {
    print_error(get_string('missingidandcmid', 'mod_eljwplayer'));
}
require_login($course, true, $cm);

$context = context_module::instance($cm->id);
require_capability('mod/eljwplayer:view', $context);

$event = \mod_eljwplayer\event\course_module_viewed::create(
    array(
        'objectid' => $eljwplayer->id,
        'context'  => $context,
    )
);
$event->add_record_snapshot('course', $course);
$event->add_record_snapshot('eljwplayer', $eljwplayer);
$event->trigger();

$PAGE->set_url('/mod/eljwplayer/view.php', array( 'id' => $cm->id ));
$PAGE->set_title(format_string($eljwplayer->name));
$PAGE->set_heading(format_string($course->fullname));
$PAGE->set_context($context);

// UI


if( !$iframe )
    echo $OUTPUT->header();

$jwplayer = new jwplayerApiService($eljwplayer);
$mid = $eljwplayer->playlist_id ?: $eljwplayer->media_id;
if($eljwplayer->videosource == 'jwplayer') {
    if($eljwplayer->media_id) {
        $jwplayer->embedMedia($eljwplayer->id, $mid);
    } 
} else if($eljwplayer->videosource == 'vimeo') {
    // Check if we have playlist videos (new format) or single video (legacy)
    $videoUrls = [];
    
    if (!empty($eljwplayer->vimeo_urls)) {
        // New format: JSON array of video URLs in vimeo_urls field
        $decodedUrls = json_decode($eljwplayer->vimeo_urls, true);
        if (is_array($decodedUrls)) {
            $videoUrls = $decodedUrls;
        }
    } else if (!empty($eljwplayer->video_url)) {
        // Legacy format: single video URL
        $videoUrls = [$eljwplayer->video_url];
    }
    
    if (!empty($videoUrls)) {
        // Use React Vimeo Playlist App
        $vimeoConfig = [
            'videoUrls' => $videoUrls,
            'continuousPlay' => !empty($eljwplayer->continuousplay),
            'autoplay' => !empty($eljwplayer->autoplay),
            'showEndScreen' => !empty($eljwplayer->showendscreen),
            'cmid' => $cm->id,
            'userid' => $USER->id,
            'courseid' => $course->id
        ];
        
        // Load the React app
        $PAGE->requires->js_call_amd('mod_eljwplayer/vimeoapp', 'init', [$vimeoConfig]);
        
        echo <<<HTML
            <div id="vimeo-playlist-root" style="height: 100vh; width: 100%;"></div>
            <style>
                body.pagelayout-incourse #page-content {
                    padding: 0;
                }
                #page-wrapper #page {
                    margin: 0;
                }
                .navbar, .breadcrumb-nav, #page-footer {
                    display: none !important;
                }
                #page-header {
                    display: none !important;
                }
                #page-content {
                    margin: 0 !important;
                    padding: 0 !important;
                }
                body {
                    margin: 0;
                    padding: 0;
                    overflow: hidden;
                }
            </style>
        HTML;
    } else {
        // Legacy single video support
        if ($eljwplayer->video_url) {
            $videoid = null;
            $showcaseid = null;

            if (preg_match('/vimeo\.com\/showcase\/(\d+)/', $eljwplayer->video_url, $matches)) {
                $showcaseid = $matches[1];
            } elseif (preg_match('/vimeo\.com\/(?:video\/)?(\d+)/', $eljwplayer->video_url, $matches)) {
                $videoid = $matches[1];
            }

            echo <<<HTML
                <style>
                    .vimeo-c {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        width: 100%;
                    }

                    .vimeo-responsive-wrapper {
                        position: relative;
                        width: 100%;
                        padding-bottom: 56.25% !important; /* 16:9 aspect ratio */
                        height: 0;
                        overflow: hidden;
                    }

                    .vimeo-responsive-wrapper iframe {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        border: 0;
                    }
                </style>
            HTML;

            if ($showcaseid) {
                echo <<<HTML
                    <div class="vimeo-c">
                        <div class="vimeo-responsive-wrapper">
                            <iframe
                                src="https://vimeo.com/showcase/{$showcaseid}/embed2"
                                frameborder="0"
                                allow="autoplay; fullscreen"
                                allowfullscreen>
                            </iframe>
                        </div>
                    </div>
                HTML;
            } elseif ($videoid) {
                echo <<<HTML
                    <div class="vimeo-c">
                        <div class="vimeo-responsive-wrapper">
                            <iframe id="vimeoplayer"
                                src="https://player.vimeo.com/video/{$videoid}?api=1&player_id=vimeoplayer"
                                frameborder="0"
                                allow="autoplay; fullscreen"
                                allowfullscreen>
                            </iframe>
                        </div>
                    </div>

                    <script src="https://player.vimeo.com/api/player.js"></script>
                    <script>
                        const player = new Vimeo.Player('vimeoplayer');

                        // Track when the video has finished playing
                        player.on('ended', function () {
                            fetch('track.php?id={$cm->id}')
                                .then(response => response.json())
                                .then(data => {
                                    console.log('Completion response:', data);
                                })
                                .catch(error => {
                                    console.error('Error sending completion:', error);
                                });
                        });
                    </script>
                HTML;
            }
        }
    }
}
else {
    echo '<div class="alert alert-warning">No valid Vimeo URL found.</div>';
}



if( !$iframe )
    echo $OUTPUT->footer();
