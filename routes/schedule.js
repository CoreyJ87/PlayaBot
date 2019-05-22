require('dotenv').config();
const express = require('express');
const router = express.Router();
const request = require('request');
const _ = require('lodash');
const moment = require('moment');

/* GET schedules. */
router.get('/', function (req, res, next) {

    const knex = req.knex;

    const sports = ["mlb", "nba", "nfl", "nhl"];

    const username = process.env.MPF_API_TOKEN,
        password = process.env.MPF_API_PASS,
        auth = "Basic " + new Buffer(username + ":" + password).toString("base64");

    _.forEach(sports, function (sport) {
        let options = {
            url: "https://api.mysportsfeeds.com/v2.1/pull/" + sport + "/latest/games.json",
            headers: {Authorization: auth},
            method: 'GET',
            json: true,
        };
        request(options, {timeout: 20}, function (err, response, body) {
            if (err) {
                if(err.code === 'ETIMEDOUT') {
                    console.log("endpoint timed out");
                    resolve("The data source timed out. Pls try again later. ;(")
                }
                else
                    console.log(err)
            } else {
                knex(sport).truncate().then(function (response) {
                    console.log("I have dropped the " + sport + " table.");
                });
                _.forEach(body.games, function (game) {
                    let schedule = game.schedule;
                    console.log("Found game: ");
                    console.log(game.schedule);
                    knex(sport).insert({
                        startTime: schedule.startTime,
                        awAbbrev: schedule.awayTeam.abbreviation,
                        hoAbbrev: schedule.homeTeam.abbreviation,
                        venue: schedule.venue.name,
                        played: (schedule.playedStatus)
                    }).then(function (results) {
                        console.log(results);
                    });
                });
            }
        });
    });
    res.send("Updated schedules successfully");
});

module.exports = router;
