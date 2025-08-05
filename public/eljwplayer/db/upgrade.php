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

    return true;
}
