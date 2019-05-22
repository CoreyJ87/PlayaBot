require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const assert = require('assert');
const Discord = require('discord.js');
const kue = require('kue');
const msgHandler = require('./queueHandlers/onMessageHandler.js');
const msgManager = require("./queueManagers/onMessageManager.js");

assert(process.env.DISCORD_TOKEN, "Discord token is required!");
assert(process.env.DB_HOST, "DB Host is required!");
assert(process.env.DB_USER, "DB User is required!");
assert(process.env.DB_PASS, "DB Pass is required!");


const queue = kue.createQueue();
kue.app.listen(4000);
const client = new Discord.Client();

let indexRouter = require('./routes/index');
let scheduleRouter = require('./routes/schedule');

let app = express();

const triggerWord = "!pb";
const knex = require('knex')({
  client: 'mysql',
  connection: {
    host : process.env.DB_HOST,
    user : process.env.DB_USER,
    password : process.env.DB_PASS,
    database : process.env.DB_NAME,
  }
});

client.on('ready', () => {
  console.log("==========================================================");
  console.log(`Logged in as ${client.user.tag}!`);
  console.log("==========================================================");

  client.user.setPresence({
    game: {
      name: 'with Playas Club commands'
    },
    status: 'online'
  });
});

client.login(process.env.DISCORD_TOKEN);




// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Attach all clients to the request for route functions
app.use(function(req,res,next){
  req.client=client;
  req.knex=knex;
  req.queue=queue;
  req.triggerWord=triggerWord;
  next();
});


//Init Routes
app.use('/', indexRouter);
app.use('/schedules',scheduleRouter);

//Init queue handler and manager
msgHandler.queueInit(client, queue,knex);
msgManager.addToQueue(client,queue,knex,triggerWord)


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
