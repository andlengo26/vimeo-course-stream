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
                    console.log(data);
                    //jwplayermedia
                },
                fail: (data) => {
                    console.log(data);
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
                    console.log(data);
                    //jwplayermedia
                },
                fail: (data) => {
                    console.log(data);
                }
            }]);
        });
    }
}
