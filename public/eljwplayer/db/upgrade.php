<?php
defined('MOODLE_INTERNAL') || die();

/**
 * Upgrade steps for mod_vimeotracker.
 */
function xmldb_eljwplayer_upgrade($oldversion) {
    global $DB;
    $dbman = $DB->get_manager();

    // 1. Create the vimeotracker table
    if ($oldversion < 2025072201) {
        $table = new xmldb_table('vimeotracker');

        $table->add_field('id', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL, XMLDB_SEQUENCE, null);
        $table->add_field('name', XMLDB_TYPE_CHAR, '255', null, XMLDB_NOTNULL, null, null);
        $table->add_field('video_url', XMLDB_TYPE_TEXT, null, null, XMLDB_NOTNULL, null, null);
        $table->add_field('completionwatchvideo', XMLDB_TYPE_INTEGER, '1', null, XMLDB_NOTNULL, null, '0');
        $table->add_field('timecreated', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL, null, 0);
        $table->add_field('timemodified', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL, null, 0);

        $table->add_key('primary', XMLDB_KEY_PRIMARY, ['id']);

        if (!$dbman->table_exists($table)) {
            $dbman->create_table($table);
        }

        upgrade_mod_savepoint(true, 2025072201, 'eljwplayer');
    }

    // 2. Create vimeotracker_userprogress table
    if ($oldversion < 2025072201) {
        $table = new xmldb_table('vimeotracker_userprogress');

        $table->add_field('id', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL, XMLDB_SEQUENCE, null);
        $table->add_field('trackerid', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL, null, null);
        $table->add_field('userid', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL, null, null);
        $table->add_field('completed', XMLDB_TYPE_INTEGER, '1', null, XMLDB_NOTNULL, null, 0);
        $table->add_field('timewatched', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL, null, 0);
        $table->add_field('timemodified', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL, null, 0);

        $table->add_key('primary', XMLDB_KEY_PRIMARY, ['id']);
        $table->add_key('userunique', XMLDB_KEY_UNIQUE, ['trackerid', 'userid']);

        if (!$dbman->table_exists($table)) {
            $dbman->create_table($table);
        }

        upgrade_mod_savepoint(true, 2025072201, 'eljwplayer');
    }


    if ($oldversion < 2025072203) {
        $table = new xmldb_table('eljwplayer');
        $field = new xmldb_field('video_url', XMLDB_TYPE_TEXT, null, null, null, null, null);

        if (!$dbman->field_exists($table, $field)) {
            $dbman->add_field($table, $field);
        }

        upgrade_mod_savepoint(true, 2025072203, 'eljwplayer');
    }

     if ($oldversion < 2025072204) {
        $table = new xmldb_table('vimeotracker_userprogress');
        $field = new xmldb_field('course', XMLDB_TYPE_INTEGER, '10', null, null, null, null);

        if (!$dbman->field_exists($table, $field)) {
            $dbman->add_field($table, $field);
        }

        upgrade_mod_savepoint(true, 2025072204, 'eljwplayer');
    }

    if ($oldversion < 2025072205) {
        $table = new xmldb_table('eljwplayer');
        $field = new xmldb_field('completionwatchvideo', XMLDB_TYPE_INTEGER, '2', null, null, null, '0');

        if (!$dbman->field_exists($table, $field)) {
            $dbman->add_field($table, $field);
        }

        // Savepoint reached
        upgrade_mod_savepoint(true, 2025072205, 'eljwplayer');
    }

    if ($oldversion < 2025073100) {
        $table = new xmldb_table('eljwplayer');
        $field = new xmldb_field('videosource', XMLDB_TYPE_TEXT, null, null, null, null, null);

        if (!$dbman->field_exists($table, $field)) {
            $dbman->add_field($table, $field);
        }

        // Savepoint reached
        upgrade_mod_savepoint(true, 2025073100, 'eljwplayer');
    }

    // Add new Vimeo playlist fields
    if ($oldversion < 2025080501) {
        $table = new xmldb_table('eljwplayer');
        
        $fields = [
            new xmldb_field('continuousplay', XMLDB_TYPE_INTEGER, '1', null, XMLDB_NOTNULL, null, '1'),
            new xmldb_field('autoplay', XMLDB_TYPE_INTEGER, '1', null, XMLDB_NOTNULL, null, '1'),
            new xmldb_field('showendscreen', XMLDB_TYPE_INTEGER, '1', null, XMLDB_NOTNULL, null, '1')
        ];

        foreach ($fields as $field) {
            if (!$dbman->field_exists($table, $field)) {
                $dbman->add_field($table, $field);
            }
        }

        // Make playlist_id and media_id nullable for Vimeo mode
        $playlist_field = new xmldb_field('playlist_id', XMLDB_TYPE_CHAR, '48', null, null, null, null);
        $media_field = new xmldb_field('media_id', XMLDB_TYPE_CHAR, '48', null, null, null, null);
        
        if ($dbman->field_exists($table, $playlist_field)) {
            $dbman->change_field_notnull($table, $playlist_field);
        }
        if ($dbman->field_exists($table, $media_field)) {
            $dbman->change_field_notnull($table, $media_field);
        }

        upgrade_mod_savepoint(true, 2025080501, 'eljwplayer');
    }

    // Create user progress table
    if ($oldversion < 2025080502) {
        $table = new xmldb_table('eljwplayer_userprogress');

        $table->add_field('id', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL, XMLDB_SEQUENCE, null);
        $table->add_field('eljwplayerid', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL, null, null);
        $table->add_field('userid', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL, null, null);
        $table->add_field('videoid', XMLDB_TYPE_CHAR, '255', null, XMLDB_NOTNULL, null, null);
        $table->add_field('completed', XMLDB_TYPE_INTEGER, '1', null, XMLDB_NOTNULL, null, '0');
        $table->add_field('timewatched', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL, null, '0');
        $table->add_field('timemodified', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL, null, '0');
        $table->add_field('course', XMLDB_TYPE_INTEGER, '10', null, XMLDB_NOTNULL, null, null);

        $table->add_key('primary', XMLDB_KEY_PRIMARY, ['id']);
        $table->add_key('userunique', XMLDB_KEY_UNIQUE, ['eljwplayerid', 'userid', 'videoid']);
        $table->add_key('fk_eljwplayer', XMLDB_KEY_FOREIGN, ['eljwplayerid'], 'eljwplayer', ['id']);
        $table->add_key('fk_user', XMLDB_KEY_FOREIGN, ['userid'], 'user', ['id']);
        $table->add_key('fk_course', XMLDB_KEY_FOREIGN, ['course'], 'course', ['id']);

        if (!$dbman->table_exists($table)) {
            $dbman->create_table($table);
        }

        upgrade_mod_savepoint(true, 2025080502, 'eljwplayer');
    }

    // Add vimeo_urls field to separate Vimeo URLs from videosource selector
    if ($oldversion < 2025080503) {
        $table = new xmldb_table('eljwplayer');
        $field = new xmldb_field('vimeo_urls', XMLDB_TYPE_TEXT, null, null, null, null, null);

        if (!$dbman->field_exists($table, $field)) {
            $dbman->add_field($table, $field);
        }

        // Migrate existing videosource JSON data to vimeo_urls field
        $records = $DB->get_records('eljwplayer');
        foreach ($records as $record) {
            if (!empty($record->videosource) && $record->videosource !== 'vimeo' && $record->videosource !== 'jwplayer') {
                // This looks like JSON data, migrate it
                $decoded = json_decode($record->videosource, true);
                if (is_array($decoded)) {
                    $DB->update_record('eljwplayer', (object)[
                        'id' => $record->id,
                        'vimeo_urls' => $record->videosource,
                        'videosource' => 'vimeo'
                    ]);
                }
            }
        }

        upgrade_mod_savepoint(true, 2025080503, 'eljwplayer');
    }

    // Fix form validation and parameter structure
    if ($oldversion < 2025080505) {
        // Ensure all Vimeo instances have proper vimeo_urls field set
        $records = $DB->get_records('eljwplayer', ['videosource' => 'vimeo']);
        foreach ($records as $record) {
            if (empty($record->vimeo_urls) && !empty($record->video_url)) {
                // Migrate single video_url to vimeo_urls array
                $urls = [$record->video_url];
                $DB->update_record('eljwplayer', (object)[
                    'id' => $record->id,
                    'vimeo_urls' => json_encode($urls)
                ]);
            }
        }

        upgrade_mod_savepoint(true, 2025080505, 'eljwplayer');
    }

    return true;
}
