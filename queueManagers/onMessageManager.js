const _ = require('lodash');


let self = module.exports = {
    addToQueue: function(client,queue,knex,triggerWord){
        client.on('message', msg => {
            let textSplit=_.split(msg.content," ");
            if(_.isEqual(textSplit[0],triggerWord)){         //Checking for trigger word before we add anything to the queue
                console.log("Should be creating job:")
                console.log("Title: " + msg.author);
                console.log("Author ID: " + msg.member.id);
                console.log("The command: " + textSplit[1]);
                (textSplit[2]  ? console.log("2nd Param: " + textSplit[2]): "");
                (textSplit[3]  ? console.log("3nd Param: " + textSplit[3]) : "");
                console.log("Channel: " + msg.channel.id);
                 let job = queue.create('IncomingMessages', {
                    title: msg.member.displayName,
                    authorId: msg.member.id,
                    command: textSplit[1],
                    sport: textSplit[2],
                    team: textSplit[3],
                    gameId: (!_.isUndefined(textSplit[4]) ? textSplit[4] : false ),
                    channel: msg.channel.id,

                }).save( function(err){
                    if( !err ) console.log( job.id );
                    else {
                        console.log(err);
                    }
                });

            }
        });
    }
};
