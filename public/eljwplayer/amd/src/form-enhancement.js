// This file is part of the eljwplayer plugin for Moodle

/**
 * Module for enhancing the eljwplayer configuration form with dynamic Vimeo URL management
 *
 * @module mod_eljwplayer/form-enhancement
 * @copyright 2025 Elearnified Inc.
 * @license http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

define(['jquery', 'core/str'], function($, str) {
    'use strict';

    /**
     * Initialize the form enhancements
     */
    function init() {
        // Add dynamic URL management for Vimeo URLs
        setupVimeoUrlManager();
        
        // Show/hide fields based on video source selection
        setupConditionalFields();
    }

    /**
     * Setup dynamic Vimeo URL management
     */
    function setupVimeoUrlManager() {
        var container = $('#vimeo-urls-container');
        if (container.length === 0) {
            return;
        }

        var textarea = $('textarea[name="vimeo_urls"]');
        if (textarea.length === 0) {
            return;
        }

        // Create add button
        var addButton = $('<button type="button" class="btn btn-secondary" style="margin-top: 5px;">' +
            '<i class="fa fa-plus"></i> Add URL</button>');
        
        // Create individual URL inputs container
        var urlInputsContainer = $('<div id="vimeo-url-inputs" style="margin-bottom: 10px;"></div>');
        
        // Insert elements
        textarea.before(urlInputsContainer);
        textarea.after(addButton);
        
        // Initialize from existing textarea content
        var existingUrls = textarea.val().trim();
        if (existingUrls) {
            var urls = existingUrls.split('\n').filter(function(url) {
                return url.trim().length > 0;
            });
            
            urls.forEach(function(url) {
                addUrlInput(urlInputsContainer, url.trim());
            });
        } else {
            // Add one empty input by default
            addUrlInput(urlInputsContainer, '');
        }

        // Hide the original textarea
        textarea.hide();

        // Add URL button click handler
        addButton.on('click', function() {
            addUrlInput(urlInputsContainer, '');
            updateTextarea();
        });

        // Update textarea whenever inputs change
        urlInputsContainer.on('input', 'input[type="url"]', function() {
            updateTextarea();
        });

        // Remove URL button handler
        urlInputsContainer.on('click', '.remove-url', function() {
            $(this).closest('.vimeo-url-input').remove();
            updateTextarea();
            
            // Ensure at least one input remains
            if (urlInputsContainer.find('.vimeo-url-input').length === 0) {
                addUrlInput(urlInputsContainer, '');
            }
        });

        /**
         * Add a new URL input field
         */
        function addUrlInput(container, value) {
            var inputGroup = $('<div class="vimeo-url-input" style="display: flex; margin-bottom: 5px; align-items: center;">');
            
            var input = $('<input type="url" class="form-control" placeholder="https://vimeo.com/123456789" ' +
                'style="margin-right: 10px;" value="' + (value || '') + '">');
            
            var removeBtn = $('<button type="button" class="btn btn-danger btn-sm remove-url">' +
                '<i class="fa fa-minus"></i></button>');
            
            inputGroup.append(input).append(removeBtn);
            container.append(inputGroup);
            
            // Focus on new input if it's empty
            if (!value) {
                input.focus();
            }
        }

        /**
         * Update the hidden textarea with current input values
         */
        function updateTextarea() {
            var urls = [];
            urlInputsContainer.find('input[type="url"]').each(function() {
                var url = $(this).val().trim();
                if (url) {
                    urls.push(url);
                }
            });
            textarea.val(urls.join('\n'));
        }
    }

    /**
     * Setup conditional field visibility based on video source
     */
    function setupConditionalFields() {
        var videoSourceSelect = $('select[name="videosource"]');
        if (videoSourceSelect.length === 0) {
            return;
        }

        function toggleFields() {
            var source = videoSourceSelect.val();
            
            // Show/hide JWPlayer fields
            var jwplayerFields = $('#fgroup_id_jwplayersettings, input[name="media_id"], input[name="playlist_id"]').closest('.fitem');
            if (source === 'jwplayer') {
                jwplayerFields.show();
            } else {
                jwplayerFields.hide();
            }
            
            // Show/hide Vimeo fields  
            var vimeoFields = $('#fgroup_id_vimeosettings, #vimeo-urls-container, input[name="video_url"]').closest('.fitem');
            if (source === 'vimeo') {
                vimeoFields.show();
            } else {
                vimeoFields.hide();
            }
        }

        // Initial setup
        toggleFields();
        
        // Handle changes
        videoSourceSelect.on('change', toggleFields);
    }

    return {
        init: init
    };
});