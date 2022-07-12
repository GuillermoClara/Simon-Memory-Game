var colors = ['green','yellow','red','blue'];

function game(sessionID, token, score, difficulty){
  this.id = sessionID;
  this.token = token;
  this.score = score;
  this.difficulty = difficulty;
  this.currentIndex = 0;
  this.pattern = [];
  this.inGame = false;
  this.waiting = false;
  this.newGame = false;
  this.mostCurrentColor = null;

  this.getWaitTime = function(){
    switch(this.difficulty.toLowerCase()){
      case "easy":
        return 1000;
      case "medium":
        return 850;
      case "hard":
        return 400;
      default:
        return 1000;
    }
  }


  this.gameover = function() {
      this.inGame = false;
  }


  this.restart = function(){

      let color = "";
      let status = "ignored"

      if(this.inGame == false){
         this.inGame = true;
         this.pattern = [];
         this.currentIndex = 0;
         this.score = 1;
         color = this.pickRandomButton();
         status = "success";
      }

      const sessionResponse = {
        color: color,
        status: status
      }

      return sessionResponse;
  }

  this.levelUp = function(){
    this.currentIndex = 0;
    this.score ++;
    this.waiting = true;
  }

  this.levelUpDelay = function(color, updateFunction){
    setTimeout(function(){
      updateFunction(color);
    }, 1000)

  }

  //Picks random color from options and adds to pattern
  this.pickRandomButton = function(){
    let randomIndex = Math.floor( Math.random()*3);
    let color = colors[randomIndex];
    this.pattern.push(color);
    this.mostCurrentColor = color;
    return color;
  }

  //Checks the correctness input from the front end
  this.checkButtonClick = function(color){

    let status = "ignored";
    let result = "wrong";

    if(this.inGame == true && this.waiting == false ){

      status = "success";

      // Handle correct current pick
      if(this.pattern[this.currentIndex] == color){

        if(this.currentIndex == (this.pattern.length-1) ){
          this.levelUp();
          result = "levelup";
        } else {
          this.currentIndex += 1;
          result = "continue";
        }

      } else {
        this.gameover();
      }
    }

    const responseData = {
      status: status,
      result: result,
      score: this.score
    }

    return responseData;

  }


}

module.exports = {colors, game};
