angular.module('devslate.whiteboard', [])

.controller('WhiteboardCtrl', function ($scope, Board, Socket) {

  $scope.initBoard = function () {
    var canvasElement = angular.element('#whiteboard');
    console.log('canvaselement: ', canvasElement);

    var webrtcElements = {
      local: angular.element('#localVideo'),
      remote: angular.element('#remoteVideos')
    };
    var b = Board.initialize(canvasElement, webrtcElements);
  };
  $scope.initBoard();

  $('#localVideo').draggable();
  $('#remoteVideos').draggable();

  console.log('board: ', Board);

  b.on('mousedown', function (e) {

    if (!Board.otherUserActive) {
      console.log('User has started to draw.');

      //initialize mouse position.
      Board.mouse.click = true;
      Board.mouse.x = e.offsetX;
      Board.mouse.y = e.offsetY;

      Board.initializeMouseDown(Board.pen, Board.mouse.x, Board.mouse.y);

      //Emit the pen object through socket
      Board.socket.emit('start', Board.pen);

      //Add the first mouse coordinates to the stroke array for storage
      Board.stroke.push([Board.mouse.x, Board.mouse.y]);
    } else {
      console.log('Another user is drawing - please wait.');
    }
  });

  b.on('drag', function (e) {

    if (!Board.otherUserActive) {
      if (Board.mouse.click) {
        Board.mouse.drag = true;

        //Find x,y coordinates of the mouse dragging on the canvas.
        var x = e.offsetX;
        var y = e.offsetY;

        //render the drawing
        Board.draw(x, y);
        console.log("currently drawing coordinates", [x, y]);

        //continue to push coordinates to stroke array (as part of storage)
        Board.stroke.push([x, y]);

        Socket.socket.emit('drag', [x, y]);
      }
    } else {
      console.log('Another use is drawing - please wait');
    }
  });

  //On mouse dragend detection, tell socket that we have finished drawing
  Board.canvas.on('dragend', function (e) {
    if (!otherUserActive) {
      Board.mouse.drag = false;
      Board.mouse.click = false;

      console.log('Drawing is finished and its data is being pushed to the server', [Board.stroke, Board.pen]);

      //Empty the stroke array.
      Board.stroke = [];

      //Tell socket that we've finished sending data
      Board.socket.emit('end', null);

    } else {
      console.log('Another user is drawing - please wait');
    }
  });

  Board.canvas.on('mouseleave', function (e) {
    Board.canvas.trigger('dragend');
  });


});
