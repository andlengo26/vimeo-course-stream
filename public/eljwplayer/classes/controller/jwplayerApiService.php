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
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Handles API calls to eljwplayer REST API.
 *
 * @package   mod_eljwplayer
 * @copyright 2022 Elearnified Inc.
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace mod_eljwplayer\controller;

use Jwplayer\JwplatformClient;

defined('MOODLE_INTERNAL') || die();

require_once $CFG->dirroot . '/lib/filelib.php';
require_once $CFG->dirroot . '/mod/eljwplayer/vendor/autoload.php';

/**
 * API service class.
 *
 * @copyright 2022 Elearnified Inc.
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class jwplayerApiService
{
    private $apikey = null;
    private $playerId = null;
    private $isplaylist = false;

    private $jwplatfromclient;

    private $siteid = '';

    public function __construct(object $eljwplayer)
    {
        $config = get_config('mod_eljwplayer');
        if (empty($config->apikey) || empty($config->siteid)) {
            throw new \moodle_exception('errorapiservice', 'mod_eljwplayer', '', get_string('errorapikeynotdefined', 'mod_eljwplayer'));
        } else {
            $this->setApikey($config->apikey);
            $this->setSiteid($config->siteid);
            $this->setPlayerId($config->playerid);
            if( $eljwplayer->playlist_id )
                $this->setIsplaylist(true);
        }
        $jwplatform_api = new JwplatformClient($this->getApikey());
        $this->setJwplatfromclient($jwplatform_api);
    }

    /**
     * Get Playlists
     * @return array
     */
    public function getPlaylists(): array
    {
        $siteid = $this->getSiteid();
        $jwplatform_api = $this->getJwplatfromclient();
        $records = json_decode($jwplatform_api->Playlist->list($siteid));
        $playlists = [];
        foreach( $records->playlists as $playlist ){
            $playlists[$playlist->id] = $playlist->metadata->title;
        }
        return $playlists;
    }

    /**
     * Get Media by Playlist Id
     * @param string $playlist_id
     * @return array
     */
    public function getMediaByPlaylistId(string $playlist_id): array
    {
        error_log('===========================');
        $siteid = $this->getSiteid();
        $jwplatform_api = $this->getJwplatfromclient();
        $records = json_decode($jwplatform_api->Channel->get($siteid,$playlist_id));
        error_log('==========================='.json_encode($records));
        $playlists = [];
        foreach( $records->playlists as $playlist ){
            $playlists[$playlist->id] = $playlist->metadata->title;
        }
        return $playlists;
    }


    /**
     * @param int $eljwplayer_id
     * @param string $media_id
     * @param bool $is_return
     * @return string|null
     */
    public function embedMedia(int $eljwplayer_id, string $media_id, $is_return = false): ?string
    {
        global $PAGE;
        $isplaylist = $this->isIsplaylist() ? 1 : 0;
        $PAGE->requires->js_call_amd('mod_eljwplayer/jwplayerevents', 'init',[$eljwplayer_id, $isplaylist]);

        $jwplatform_api = $this->getJwplatfromclient();
        $response = $jwplatform_api->Player->embed_media($media_id, $this->getPlayerId(),'js');
        $script = '<script charset="utf-8">'.$response.'</script>';
        if( $is_return )
            return $script;
        else{
            echo $script;
            return null;
        }
    }
    /*
    |--------------------------------------------------------------------------
    | Getters and Setters
    |--------------------------------------------------------------------------
    |
    | The following lines contains getters and setters for the singleton object
    |
    */
    /**
     * @return string
     */
    private function getSiteid(): string
    {
        return $this->siteid;
    }

    /**
     * @param string $siteid
     */
    private function setSiteid(string $siteid): void
    {
        $this->siteid = $siteid;
    }

    /**
     * @return null|string
     */
    private function getApikey(): ?string
    {
        return $this->apikey;
    }

    /**
     * @param null $apikey
     */
    private function setApikey($apikey): void
    {
        $this->apikey = $apikey;
    }

    /**
     * @return JwplatformClient
     */
    private function getJwplatfromclient(): JwplatformClient
    {
        return $this->jwplatfromclient;
    }

    /**
     * @param JwplatformClient $jwplatfromclient
     */
    private function setJwplatfromclient(JwplatformClient $jwplatfromclient): void
    {
        $this->jwplatfromclient = $jwplatfromclient;
    }
    /**
     * @return string
     */
    public function getPlayerId(): string
    {
        return $this->playerId;
    }

    /**
     * @param string $playerId
     */
    public function setPlayerId(string $playerId): void
    {
        $this->playerId = $playerId;
    }
    /**
     * @return bool
     */
    public function isIsplaylist(): bool
    {
        return $this->isplaylist;
    }/**
     * @param bool $isplaylist
     */
    public function setIsplaylist(bool $isplaylist): void
    {
        $this->isplaylist = $isplaylist;
    }
}
