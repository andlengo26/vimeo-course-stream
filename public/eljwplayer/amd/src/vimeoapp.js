/**
 * AMD module for Vimeo Playlist React App integration
 * 
 * @module mod_eljwplayer/vimeoapp
 * @copyright 2025
 * @license http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

define(['jquery', 'core/ajax', 'core/notification'], function($, Ajax, Notification) {
    'use strict';

    var VimeoApp = {
        /**
         * Initialize the Vimeo playlist React app
         * @param {Object} config Configuration object
         */
        init: function(config) {
            console.log('Initializing Vimeo App with config:', config);

            // Ensure required DOM element exists
            var container = document.getElementById('vimeo-playlist-root');
            if (!container) {
                console.error('Vimeo playlist container not found');
                return;
            }

            // Load the React app bundle
            this.loadReactApp(config);
        },

        /**
         * Load the React application bundle
         * @param {Object} config Configuration object
         */
        loadReactApp: function(config) {
            var self = this;
            
            // Create script element for React app
            var script = document.createElement('script');
            script.type = 'module';
            script.src = M.cfg.wwwroot + '/mod/eljwplayer/react-app/main.js';
            
            script.onload = function() {
                console.log('React app loaded successfully');
                self.initializeApp(config);
            };
            
            script.onerror = function() {
                console.error('Failed to load React app');
                Notification.exception({
                    message: 'Failed to load video player'
                });
            };
            
            document.head.appendChild(script);
        },

        /**
         * Initialize the React app with Moodle configuration
         * @param {Object} config Configuration object
         */
        initializeApp: function(config) {
            // Set global configuration for React app
            window.MoodleVimeoConfig = {
                videoUrls: config.videoUrls || [],
                continuousPlay: config.continuousPlay || false,
                autoplay: config.autoplay || false,
                showEndScreen: config.showEndScreen || false,
                moodleActivityId: config.cmid,
                moodleUserId: config.userid,
                moodleCourseId: config.courseid,
                wwwroot: M.cfg.wwwroot,
                sesskey: M.cfg.sesskey
            };

            // Dispatch event to signal React app can initialize
            var event = new CustomEvent('moodleConfigReady', {
                detail: window.MoodleVimeoConfig
            });
            window.dispatchEvent(event);

            // Set up completion tracking
            this.setupCompletionTracking(config);
        },

        /**
         * Set up completion tracking for Moodle
         * @param {Object} config Configuration object
         */
        setupCompletionTracking: function(config) {
            var self = this;

            // Listen for completion events from React app
            window.addEventListener('vimeo_playlist_complete', function(event) {
                self.trackCompletion(config.cmid, event.detail);
            });

            window.addEventListener('vimeo_playlist_progress', function(event) {
                self.trackProgress(config.cmid, event.detail);
            });
        },

        /**
         * Track activity completion
         * @param {number} cmid Course module ID
         * @param {Object} data Completion data
         */
        trackCompletion: function(cmid, data) {
            var request = {
                methodname: 'mod_eljwplayer_track_completion',
                args: {
                    cmid: cmid,
                    videoid: data.videoid || 'all',
                    completed: 1
                }
            };

            Ajax.call([request])[0]
                .done(function(response) {
                    console.log('Completion tracked:', response);
                })
                .fail(function(error) {
                    console.error('Failed to track completion:', error);
                });
        },

        /**
         * Track video progress
         * @param {number} cmid Course module ID
         * @param {Object} data Progress data
         */
        trackProgress: function(cmid, data) {
            var request = {
                methodname: 'mod_eljwplayer_track_progress',
                args: {
                    cmid: cmid,
                    videoid: data.videoid,
                    progress: data.progress || 0
                }
            };

            Ajax.call([request])[0]
                .done(function(response) {
                    console.log('Progress tracked:', response);
                })
                .fail(function(error) {
                    console.error('Failed to track progress:', error);
                });
        }
    };

    return VimeoApp;
});