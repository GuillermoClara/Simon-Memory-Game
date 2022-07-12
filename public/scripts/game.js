var colors = ['green','yellow','red','blue'];
var pattern = [];
var currentIndex = 0;
var inGame = false;
var newGame = true;
var level = 1;
var waiting = false;
var delay = determineDelayTime();
var difficulty = window.localStorage.getItem("difficulty");


$(window).on("beforeunload", function(){
  const data = {
    gameId: $("#gameId").attr("value"),
    token: $("#gameToken").attr("value"),
  }

$.post('/exit', data);

})

//Handle to start game
$(document).on("keypress", function(){

  if(newGame){
    restartGame();
    newGame = false;
  }

});

$('.tap').on("click", function(){

  if(newGame){
    restartGame();
    newGame = false;
  }

});


function restartGame(){

  const data = {
    gameId: $("#gameId").attr("value"),
    token: $("#gameToken").attr("value"),
    difficulty: difficulty
  }

  $.post('/restart', data, function(response){

    if(response != null){

      if(response.status === "success"){

        $("h1").text("Level 1");

        setTimeout(function(){
          animateButton(response.color);
        }, 1000);

        $(".lb-button").css("display", "none");
        $(".play-again").css("display", "none");

      }
    }

  })





}


$('.play-again').on('click', restartGame);

//Checks if the button clicked is the same as the one in the pattern
// with its corresponding index
$(".btn").click(function(event){

  // Evaluate in back end
  // Send color to backend to evaluate
  const selectedColor = this.classList[0];

  const data = {
    color: selectedColor,
    gameId: $("#gameId").attr("value"),
    token: $("#gameToken").attr("value")
  }


  $.post('/eval', data, function(response){
    if(response !== null || response !== undefined){
      if(response.status !== "ignored"){
        animateButton(selectedColor);

        if(response.result === "levelup"){

          $("h1").text("Level "+response.score);

          setTimeout(function(){
            animateButton(response.color);
          }, response.time);

        } else if(response.result === "wrong") {
          displayGameOver(response.score);
        }

      }
    }

  });

});

//Resets values

// Divide between back end and front end
function gameOver(){
  currentIndex = 0;
  inGame = false;
  waiting = false;
  let bgColor = $("body").css("background-color");
  $("body").css("background-color", "red");
  $("h1").text("Game over. Your score was: "+level);

  //Move to game options section
  $('html, body').animate({
        scrollTop: $("#game-options").offset().top
    }, 500);

    $(".lb-button").css("display", "block");
    $(".play-again").css("display", "block");

  playSound("wrong");

  setTimeout(function(){
      $("body").css("background-color", bgColor);
  }, 100);



}

function displayGameOver(score){
  let bgColor = $("body").css("background-color");
  $("body").css("background-color", "red");
  $("h1").text("Game over. Your score was: "+score);

  //Move to game options section
  $('html, body').animate({
        scrollTop: $("#game-options").offset().top
    }, 500);

    $(".lb-button").css("display", "block");
    $(".play-again").css("display", "block");

  playSound("wrong");

  setTimeout(function(){
      $("body").css("background-color", bgColor);
  }, 100);

}

//Reset index since we will we checking again
function levelUp(){
  level++;
  currentIndex = 0;
  $("h1").text("Level "+level);
  waiting = true;
  setTimeout(function(){
      pickRandomButton();
      waiting = false;
  }, delay);

}



// Back end
function pickRandomButton(){
  let randomIndex = Math.floor( Math.random()*3);
  let color = colors[randomIndex];
  pattern.push(color);
  playSound(color);
  animatePress(color);

}

function animateButton(color){
  animatePress(color);
  playSound(color);
}

//Front end
function animatePress(color){
  $("."+color).addClass("pressed");
  setTimeout(function(){
    $("."+color).removeClass("pressed");
  }, 100);
}

// Front end
function playSound(color){
  let audio = "wrong";
  switch(color){
    case "blue":
    case "red":
    case "yellow":
    case "green":
      audio = color;
  }

  let audioPlayer = new Audio("/assets/sounds/"+audio+".mp3");
  audioPlayer.play();
}

// Front End
function determineDelayTime(){
  if(difficulty == null){
    return 1000;
  }

  if(difficulty == "Easy")
    return 1000;
  else if(difficulty == "Medium")
    return 850;
  else
    return 460;
}

//Leaderboard submission event handling

$(".lb-button, .close-submit").on("click", function(){
  $(".lb-submit-div").toggleClass("hidden");
})
