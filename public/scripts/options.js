//Gets difficulty stored in web browser
var difficulty = window.localStorage.getItem("difficulty");
if(difficulty == null){
  difficulty = "Easy";
}


$("."+difficulty.toLowerCase()).addClass("selected-option");

//Change buttons selected using jquery event handling
$(".option").click(function(event){
  let current = $("."+difficulty.toLowerCase());
  let target = event.currentTarget;
  console.log(event.currentTarget);
  current.removeClass("selected-option");
  target.classList.add("selected-option");
  difficulty = target.firstElementChild.textContent; //Getting p text
  window.localStorage.setItem("difficulty", difficulty);
  console.log(difficulty);
});
