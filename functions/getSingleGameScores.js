require('dotenv').config();
const moment = require('moment');
const request = require('request');

const username = process.env.MPF_API_TOKEN,
    password = process.env.MPF_API_PASS,
    auth = "Basic " + new Buffer(username + ":" + password).toString("base64");

let self = module.exports = {
    getScores: function (sport,teamData) {
        return new Promise((resolve, reject) => {
            console.log(teamData);
            let date = moment(teamData.startTime).tz("America/Chicago").format("YYYYMMDD");
            let awayTeam = teamData.awAbbrev;
            let homeTeam = teamData.hoAbbrev;
            let playStatus = teamData.played;

            let options = {
                url: `https://api.mysportsfeeds.com/v2.1/pull/${sport}/current/games/${date}-${awayTeam}-${homeTeam}/boxscore.json`,
                headers: {Authorization: auth},
                method: 'GET',
                json: true,
            };

            console.log(options.url);
            request(options, function (err, response, body) {
                if (err) {
                    if(err.code === 'ETIMEDOUT') {
                        console.log("endpoint timed out");
                        resolve("The data source timed out. Pls try again later. ;(")
                    }
                    else
                        console.log(err)
                } else {
                    let scores = body.scoring;
                    let homeScore = scores.homeScoreTotal;
                    let awayScore = scores.awayScoreTotal;
                    let beginningText = "";
                    let winner = "";

                    if(playStatus !== "COMPLETED" && playStatus !== "UNPLAYED"){
                        beginningText = "The game is currently still being played with: xxx timeleft";
                        if(homeScore > awayScore){
                            winner = `${homeTeam} is winning!`
                        }
                        else {
                            winner = `${awayTeam} is winning!`
                        }
                    }
                    else if(playStatus === "COMPLETED") {
                        beginningText = "The game has finished!";
                        if(homeScore > awayScore){
                            winner = `${homeTeam} won!`
                        }
                        else {
                            winner = `${awayTeam} won!`
                        }
                    }
                    let finalString = `\`\`\`${beginningText}\n${winner} -  ${homeTeam}:${homeScore} - ${awayTeam}: ${awayScore}\`\`\``;
                    resolve(finalString);
                }
            });

        })
    }
};
