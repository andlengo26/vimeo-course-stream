import Ajax from 'core/ajax';

export const init = (eljwplayer_id, isplaylist) => {

    if( isplaylist == 1 ){
        window.jwplayer().on('playlistComplete', (e) => {
            Ajax.call([{
                methodname: 'mod_eljwplayer_view_jwplayermedia',
                args: {
                    eljwplayerid: eljwplayer_id
                },
                done: (data) => {
                    // Activity completion tracked
                },
                fail: (data) => {
                    // Silent fail for completion tracking
                }
            }]);
        });
    }else{
        window.jwplayer().on('complete', (e) => {
            Ajax.call([{
                methodname: 'mod_eljwplayer_view_jwplayermedia',
                args: {
                    eljwplayerid: eljwplayer_id
                },
                done: (data) => {
                    // Activity completion tracked
                },
                fail: (data) => {
                    // Silent fail for completion tracking
                }
            }]);
        });
    }
}
