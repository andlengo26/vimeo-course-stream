// Standard license block omitted.
/*
 * @module     mod_eljwplayer/repository
 * @copyright  2015 Someone cool
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import Ajax from 'core/ajax';
import Notification from 'core/notification';
import $ from 'jquery';

export const init = () => {
    var getMediaByPlaylistId = () => {
        const jwplayermedia = document.querySelector('#jwplayermediaselect');
        const jwplayerplaylists = document.querySelector('#jwplayerplaylistselect');
        jwplayerplaylists.addEventListener('change', (event) => {
            const playlist_id = jwplayerplaylists.value;
            Ajax.call([{
                methodname: 'mod_eljwplayer_get_jwplayermedia',
                args: {
                    playlist_id: playlist_id
                },
                done: (data) => {
                    // Media data received
                },
                fail: (data) => {
                    // Silent fail for media retrieval
                }
            }]);
        });
    };

    getMediaByPlaylistId();
};