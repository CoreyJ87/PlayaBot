const _ = require('lodash');
let self = module.exports = {
    grabSingleGame: function (knex,sport,id) {
        return new Promise((resolve, reject) => {
            knex.select('*').from(sport).where('id', id).then(function (teamData) {
                _.forEach(teamData,function(singleGame){
                   let returnData = { id: singleGame.id,startTime: singleGame.startTime,awAbbrev: singleGame.awAbbrev, hoAbbrev: singleGame.hoAbbrev,played: singleGame.played } ;
                    resolve(returnData);
                });

            });
        })
    }
};
