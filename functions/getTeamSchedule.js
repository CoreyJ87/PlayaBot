const _ = require('lodash');
const moment = require('moment-timezone');

let self = module.exports = {
    getTeamSchedule: function (sport, team, knex) {
        return new Promise((resolve, reject) => {
            //select * from {sport} where played=1 and where awAbbrev="{team}" or where hoAbbrev="{team}"
            knex(sport).where('awAbbrev', team).orWhere('hoAbbrev', team).then(function (teamData) {
                let finalString = "\`\`\`";
                _.forEach(teamData, function (singleGame) {
                    let date = moment(singleGame.startTime).tz("America/Chicago").format("MM-DD-YYYY HH:mm");
                    let awayTeam = singleGame.awAbbrev;
                    let homeTeam = singleGame.hoAbbrev;
                    let venue = singleGame.venue;
                    let id = singleGame.id;
                    let played = singleGame.played;
                    finalString += `Game ${id} || Home Team: ${homeTeam} vs Away Team: ${awayTeam}\nStarting at: ${date} || at: ${venue} || Play Status: ${played}\n\n`;
                });
                console.log(finalString);
                resolve(finalString)
            });
        });
    }
};
