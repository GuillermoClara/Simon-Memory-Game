const express = require("express");
const parser = require("body-parser");
const mongoose = require("mongoose");
const crypto = require("crypto");
const ejs = require("ejs");
const gameLogic = require("./logic");
const sorter = require('./mergesort')

const app = express();

app.set('view engine', 'ejs');

app.use(parser.urlencoded({extended: true}));
app.use(express.static("public"));

//Map where session objects will be stored in runtime
const sessionsMap = new Map();

//MongoDB stuff // // // // // // // //

mongoose.connect("mongodb+srv://guilleclara:PjbmjW5GVl4VKAdL@cluster0.n4pmg38.mongodb.net/?retryWrites=true&w=majority/simonDB", {useNewUrlParser: true});

const attemptSchema = new mongoose.Schema({
  name: String,
  difficulty: String,
  score: Number,
  date: String
})

const Attempt = new mongoose.model("Attempt", attemptSchema);

// // // // // // // // // // //




//Searches a random number that is not currently being used as
// a game sessionId
function getFreeSessionNumber(){
  let found = false;
  while(!found){

    const randomNumber = Math.floor( Math.random()*5000);
    if(sessionsMap.get(randomNumber) == undefined) {
      return randomNumber;
    }
  }
}

app.get('/', function(req, res){
  res.render('index')
});

app.get('/leaderboard/:difficulty?', function(req, res){

  let difficulty = req.params.difficulty;

  if(difficulty === undefined)
    difficulty = "Easy";


  Attempt.find({difficulty: difficulty}, function(error, results){
    if(error){
      res.render('/');
    } else {
      sorter.sort(results)
      res.render('leaderboard', {users: results, selected: difficulty});
    }
  })
});

app.get('/game', function(req, res){
  const randomNumber = getFreeSessionNumber();

  //Generate unique gameToken
  const randomToken = crypto.randomBytes(20).toString("hex");

  //Save new session in Sessions map
  const newGameSession = new gameLogic.game(randomNumber, randomToken, 1, "Hard");
  sessionsMap.set(randomNumber, newGameSession);

  res.redirect('/game/'+randomNumber+'/'+randomToken);

});

app.get('/game/:sessionId/:sessionToken', function(req, res){

    const id = Number(req.params.sessionId);
    const session = sessionsMap.get(id);
    console.log(session);

    if(session === undefined || session === null)
      res.redirect('/game');

    console.log('New session with  ID '+session+' was started');


  res.render('game', {sessionId: req.params.sessionId,
     token: req.params.sessionToken})
});


app.get('/options', function(req, res){
  res.render('options')
})

// Handle user submitting score to leaderboard
app.post('/game', function(req, res){
  const name = req.body.username;

  const id = Number(req.body.id);
  const token = req.body.token;

  const gameSession = sessionsMap.get(id);

  //Handle fraudulent session credentials
  if(gameSession == null || gameSession.token !== token || gameSession.inGame){
    res.redirect('/');
  }

  console.log(req.body);

  const score = gameSession.score;
  const difficulty = gameSession.difficulty;
  const date = new Date();

  const newAttempt = new Attempt({
    name: name,
    score: score,
    difficulty: difficulty,
    date: date.toDateString()
  })

  // Save into database
  newAttempt.save(function(error){
    if(error){
      console.log('Error while creating new attempt');
    }
    res.redirect('/leaderboard/'+difficulty)
  })

  //Remove session from active sessions map
  sessionsMap.delete(id);


});

//Game HTTP REQUEST HANDLERS

//Handles user button input
app.post('/eval', function(req, res){
  const id = Number(req.body.gameId);
  const token = req.body.token;
  const gameSession = sessionsMap.get(id);

  if(gameSession == undefined){
    return null;
  }

  //Compare token stored in session and token submitted by client
  if(token !== gameSession.token){
    return null;
  }

  const responseData = gameSession.checkButtonClick(req.body.color);

  if(responseData.result === "levelup"){

    let waitTime = gameSession.getWaitTime();

    responseData.color = gameSession.pickRandomButton();
    responseData.time = waitTime;

    res.json(responseData);



    setTimeout(function(){
      gameSession.waiting = false;
    }, waitTime);

  } else {
    res.json(responseData);
  }


});

app.post('/sessionInfo', function(req, res){
  const id = Number(req.body.gameId);
  const token = req.body.token;
  const gameSession = sessionsMap.get(id);
  const option = req.body.option;

  if(gameSession == undefined){
    return null;
  }

  if(token !== gameSession.token){
    return null;
  }

  const responseData = {}

  switch(option){
    case "state":
      responseData.inGame = gameSession.inGame;
      responseData.waiting = gameSession.waiting;
      responseData.newGame = gameSession.newGame;
      break;
    case "data":
      responseData.score = gameSession.score;
      responseData.difficulty = gameSession.difficulty;
  }

  res.json(responseData);

})

app.post('/exit', function(req, res){
  const id = Number(req.body.gameId);
  const token = req.body.token;
  const gameSession = sessionsMap.get(id);

  if(gameSession !== undefined || gameSession !== null && token !== null || token !== gameSession.token){

    setTimeout(function(){
      sessionsMap.delete(id);
      console.log('session with ID: '+id+' was deleted')
    }, 1000);

  }


})

app.post('/restart', function(req, res){
  const id = Number(req.body.gameId);
  const token = req.body.token;
  const gameSession = sessionsMap.get(id);

  if(gameSession == undefined){
    return null;
  }

  if(token !== gameSession.token){
    return null;
  }

  gameSession.difficulty = req.body.difficulty;

  //Send result from session evaluation
  const responseData = gameSession.restart();
  res.json(responseData);

})


app.listen(3000, function(){
  console.log('Server started')
})
