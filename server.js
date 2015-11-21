// # Main Server

// ##### [Back to Table of Contents](./tableofcontents.html)

// ## Dependencies
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Board = require('./db/board');
var port = process.env.PORT || 8080;
var handleSocket = require('./server/sockets');
var EventEmitter = require('events').EventEmitter;

// ##Auth Dependencies
var passport = require('passport');
//var flash = require('connect-flash');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var emitter = new EventEmitter();
emitter.setMaxListeners(0);


// **Auth Configuration //////////////////////////////////////////////////
require('./auth/passport')(passport); // pass passport for configuration

app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get information from html forms

//app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({ secret: 'imOldGreggggggg' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

// load our routes and pass in our app and fully configured passport --> will need this when put routes in seperate file
// basically this just keep us from needing to require app and passport in that file
// require('./app/routes.js')(app, passport);

//////////////////////////////////////////////////////////////////////////

// ## Routes
// **Static folder for serving application assets**
app.get('/profile', function (req, res) {
  res.sendFile(__dirname + '/public/profile.html');
});
app.use('/', express.static(__dirname + '/public'));

// **Static folder for serving documentation**
app.use('/documentation', express.static(__dirname + '/docs'));

// **Home Page**
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/public/index.html');
});

// **Documentation Page**
app.get('/documentation', function(req, res) {
  res.sendFile(__dirname + '/docs/tableofcontents.html');
});


// **Get a new whiteboard**
app.get('/new', function(req, res) {
  // Create a new mongoose board model.
  var board = new Board({strokes: []});
  var id = board._id.toString();
  board.save(function(err, board) {
    if (err) { console.error(err); }
    else {
      console.log('board saved!');
    }
  });
  // Redirect to the new board.
  res.redirect('/' + id);
});


// **Wildcard route & board id handler.**

//TODO: Need this to be acutally routed --> COMMENTED OUT ORIGIONAL BELOW
////////////////////////////////////////////////////////////////////////////////////////////////
app.get('/564eca8fe594c70300b6380b', isLoggedIn, function(req, res) {
  var id = req.url.slice(1);
  Board.findOne({id: id}, function(err, board) {
    // If the board doesn't exist, or the route is invalid,
    // then redirect to the home page.
    if (err) {
      res.redirect('/');
    } else {
      // Invoke [request handler](../documentation/sockets.html) for a new socket connection
      // with board id as the Socket.io namespace.
      handleSocket(req.url, board, io);
      // Send back whiteboard html template.
      res.sendFile(__dirname + '/public/board.html');
    }
  });
});

///////////////////// FACEBOOK ROUTES //////////////////////////////////////////

// route for facebook authentication and login
app.get('/auth/facebook', passport.authenticate('facebook', { scope : ['email'] }));

// handle the callback after facebook has authenticated the user
app.get('/auth/facebook/callback', passport.authenticate('facebook', {
  successRedirect : '/564eca8fe594c70300b6380b', // TODO: fix routing to go to profile after login
  failureRedirect : '/564eca8fe594c70300b6380b'
}));

///////////////////////////////////////////////////////////////////////////////////////////
// function to verify if user is authenticated --> will need to move to routes
function isLoggedIn(req, res, next) {

    console.log(req.isAuthenticated());

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}
///////////////////////////////////////////////////////////////////////////////////////////

var userRouter = express.Router();
var boardRouter = express.Router();
app.use('/api/user', userRouter);
app.use('/api/board', boardRouter);
require('./server/user/userRoutes.js')(userRouter);
require('./server/board/boardRoutes.js')(boardRouter);

// **Start the server.**
http.listen(port, function() {
  console.log('The magic is happening on ', port, 'at', new Date());
});
