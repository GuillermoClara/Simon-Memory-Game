# Simon-Memory-Game
Web application that implements the famous Simon game
Test link: https://polar-retreat-58772.herokuapp.com/
### Tech Stack
#### Front end
HTML, CSS (responsive with media queries)
Javascript (Used for event handling, and information display e.g. next buttons, score)

#### Back end (Node JS)
For server used ExpressJs

MongoDB for leaderboard database

EJS was used for rendering leaderboard users from database

### Program logic summary

When the client clicks on Play, the server creates a session with a random ID and token,
this ID alongside with a GameSession object is stored in a Map. The server redirects the user
to a new route with its ID and Token stored in a hidden form.

When the player executes an action (i.e. exiting, submitting score, or clicking an option) it sends
data to the server. For security purposes, everytime data is sent to the server it validates the ID and token.
If there is a match, the server processes the data with the gameSession object. The gameSession object performs an action
and returns data to the client for display purposes.

### Gallery
Menu
![Menu](https://i.imgur.com/2nqnSvF.png)

Leaderboard
![Leaderboard](https://i.imgur.com/IEy1m6K.png)

Game
![Game](https://i.imgur.com/xuSYzBj.png)

Difficulty
![Difficulty](https://i.imgur.com/fAHqUGd.png)




