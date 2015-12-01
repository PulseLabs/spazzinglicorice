var ot = require('ot');
// # Socket Connection Handler
// ##### [Back to Table of Contents](./tableofcontents.html)
// Import board model from [board.js](../documentation/board.html)
var Board = require('../db/board');
// var EventEmitter = require('events').EventEmitter;
// var emitter = new EventEmitter();
// emitter.setMaxListeners(0);
// **boardUrl:** *String* <br>
// **board:** *Mongoose board model* <br>
// **io:** *Export of our Socket.io connection from [server.js](../documentation/server.html)*
var socketIOServers = {};
var usercount = 0;
var connect = function(boardUrl, board, io) {
  // Set the Socket.io namespace to the boardUrl.
  var whiteboard = io.of(boardUrl);
  // initialize ot for codebox
  if(!socketIOServers[board._id]){
    console.log('Initialing new board');
    socketIOServers[board._id] = new ot.EditorSocketIOServer(board.codebox, [], board._id);
  }
  whiteboard.once('connection', function(socket) {
    // add client to ot instance
    console.log('Adding new user');
    socketIOServers[board._id].addClient(socket);
    socketIOServers[board._id].setName(socket, 'User' + ++usercount);
    // require our separate modules - drawing, chat, etc...
    console.log('work');
    socket.emit('join', board);
    require('./drawing/drawing.js')(socket, Board);
    // console.log('about to emit join, board: ', board);
    socket.on('chat-message', function (msg) {
      // console.log('are you working?');
      // console.log('chatter' + msg);
      socket.broadcast.emit('chat-message', msg);
    });
    // require('./chatter/chatter.js')(socket, whiteboard);
    // Send the current state of the board to the client immediately on joining.
  });
};
// Required by [server.js](../documentation/server.html)
module.exports = connect;
