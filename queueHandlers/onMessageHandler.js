const schedule = require('./../functions/getTeamSchedule.js');
const gameInfo = require('./../functions/getSingleGameInfo.js');
const scores = require('./../functions/getSingleGameScores.js');
let self = module.exports = {
    queueInit: function (client, queue, knex) {

        queue.process('IncomingMessages', 2, function (job, done){
            console.log(job.data);
            let redisChannel=job.data.channel;
            let redisCommand=job.data.command;
            let redisSport=job.data.sport;
            let redisTeam=job.data.team;
            let redisGameId=job.data.gameId;
            let redisAuthorId=job.data.authorId;
            let redisAuthorName=job.data.title;


            let channel = client.channels.find(cn=>cn.id===redisChannel);

            switch(redisCommand) {
                case "ping":
                    channel.send('pong <@' + redisAuthorId + '>');
                    break;
                case "corey":
                    channel.send('yes, he is the best');
                    break;
                case "test":
                    channel.send("Command: " + redisCommand);
                    channel.send("Sport: " + redisSport);
                    channel.send("Team: " + redisTeam);
                    break;
                case "schedule":
                    schedule.getTeamSchedule(redisSport,redisTeam,knex).then(function(data){
                        if(data.length>=1950) {
                            let sendAmount = data.length / 1950;
                            let lowerAmount=0;
                            let higherAmount=1950;
                            while(sendAmount > 0){
                                console.log(sendAmount);
                                console.log(lowerAmount);
                                console.log(higherAmount);
                                channel.send((sendAmount !== data.length/1950) ? '```' +  data.substring(lowerAmount,higherAmount) + "```"  :  data.substring(lowerAmount,higherAmount) + "```");
                                lowerAmount+=1950;
                                higherAmount+=1950;
                                sendAmount--;
                            }
                        }
                        else {
                            channel.send(data + "\`\`\`");
                        }
                    });
                    break;
                case "scores":
                    gameInfo.grabSingleGame(knex,redisSport,redisGameId).then(function(teamData){
                        scores.getScores(redisSport,teamData).then(function(response){
                            channel.send(response);
                        });
                    });
                    break;
                default:
                    channel.send('Unknown command. What are you trying to do? Dumbshit')
            }
                done();
        });
    }
};
