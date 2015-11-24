angular.module('devslate.whiteboard', [])

.controller('WhiteboardCtrl', function ($scope, Socket, Board) {

  // $scope.initBoard = function () {
  //   var canvasElement = angular.element('#whiteboard');
  //   console.log('canvaselement: ', canvasElement);
  //
  //   // var webrtcElements = {
  //   //   local: angular.element('#localVideo'),
  //   //   remote: angular.element('#remoteVideos')
  //   // };
  //   console.log('before returning Board.initialize');
  //   boardObj = Board.initialize(canvasElement, webrtcElements);
  // };
  // $scope.initBoard();

  // $scope.setBoard = function (id) {
  //   Board.connectBoard(id)
  //   .then(function () {
  //     Socket.set(id);
  //
  //     // Socket.on('hello', function () {
  //     //   console.log('hello');
  //     // });
  //
  //   });
  // };
  // $scope.setBoard('5654cdad95dc31d2c0c6c817');
  // Board.newBoard()
  // .then(function (data) {
  //   Socket.set(data);
  //   console.log(data);
  // });

  $('#localVideo').draggable();
  $('#remoteVideos').draggable();
})

//drawing directive attached to canvas element
.directive("drawing", function (Socket, Board) {
  return {
    restrict: "A",
    link: function (scope, element) {

      //set board initializes the socket to the board id
      var setBoard = function (id) {
        Board.connectBoard(id)
        .then(function () {

          Socket.set(id);

          //initializing all the drawing functions inside .then because the socket
          //must be initialized before listeners are attached
          element[0].width = window.innerWidth * 0.5;
          element[0].height = window.innerHeight * 0.67;
          var context = element[0].getContext('2d');

          var otherUserActive = false;
          var stroke = [];
          var prevPixel = [];

          var mouse = {
            click: false,
            drag: false,
            x: 0,
            y: 0
          };

          var pen = {
            fillStyle: 'solid',
            strokeStyle: 'black',
            lineWidth: 5,
            lineCap: 'round'
          };

          var draw = function (x, y) {
            context.lineTo(x, y);
            context.stroke();
          };

          var initializeMouseDown = function (pen, moveToX, moveToY) {
            // Copy over current pen properties (e.g. fillStyle).
            for (var key in pen) {
              context[key] = pen[key];
            }

            // Begin draw.
            context.beginPath();
            context.moveTo(moveToX, moveToY);
          };

          element.bind('mousedown', function (event) {
            if (!otherUserActive) {
              console.log("User has started to draw.");

              mouse.click = true;
              mouse.x = event.offsetX;
              mouse.y = event.offsetY;

              initializeMouseDown(pen, mouse.x, mouse.y);

              //Emit the pen object through socket
              Socket.emit('start', pen);
              Socket.emit('hello', null);
              //Add the first mouse coordinates to the stroke array for storage
              stroke.push([mouse.x, mouse.y]);
            } else {
              console.log('Another user is drawing - please wait.');
            }
          });

          element.bind('mousemove', function (event) {
            if (!otherUserActive) {
              if (mouse.click) {
                mouse.drag = true;

                //Find x,y coordinates of the mouse dragging on the canvas.
                var x = event.offsetX;
                var y = event.offsetY;

                //render the drawing
                draw(x, y);
                console.log('currently drawing coordinates', [x, y]);

                //continue to push coordinates to stroke array (as part of storage)
                stroke.push([x, y]);

                Socket.emit('drag', [x, y]);
              }
            } else {
              console.log('Another user is drawing- please wait');
            }
          });

          element.bind('mouseup', function (event) {
            if (!otherUserActive) {
              mouse.drag = false;
              mouse.click = false;

              console.log('Drawing is finished and its data being pushed to server', [stroke, pen]);

              //Empty the stroke array.
              stroke = [];

              //Tell socket that we've finished sending data
              Socket.emit('end', null);
            } else {
              console.log("Another user is drawing - please wait");
            }
          });

          element.on('mouseleave', function (event) {
            element.trigger('mouseup');
          });

          Socket.on('join', function (board) {
            console.log("Joining the board.");

            // Check for null board data.
            if (board) {
              for (var i = 0; i < board.strokes.length; i++) {
                // Check for null stroke data.
                if (board.strokes[i]) {
                  // Set pen and draw path.
                  var strokesArray = board.strokes[i].path;
                  var penProperties = board.strokes[i].pen;
                  initializeMouseDown(penProperties, strokesArray[0][0], strokesArray[0][1]);

                  // Draw the path according to the strokesArray (array of coordinate tuples).
                  for (var j = 0; j < strokesArray.length; j++) {
                    draw(strokesArray[j][0], strokesArray[j][1]);
                  }
                  context.closePath();
                }
              }
            }
          });

          // If another user is drawing, App.socket will receive a 'drag' event. App listens for the drag event and renders the drawing element created by the other user.
          // Note that App prevents the current user from drawing while the other user is still drawing.
          Socket.on('drag', function (data) {
            otherUserActive = true;
            console.log("Receiving data from another user:", data);

            // ```App.prevPixel``` is an array of the previous coordinates sent, so drawing is smoothly rendered across different browsers.
            // If the ```App.prevPixel``` array is empty (i.e., this is the first pixel of the drawn element), then prevPixel is set as the coordinates of the current mouseclick.
            if (prevPixel.length === 0) {
              prevPixel = data.coords;
            }

            // Initialize beginning coordinates and drawing.
            initializeMouseDown(data.pen, prevPixel[0], prevPixel[1]);
            draw(data.coords[0], data.coords[1]);

            // Set the current coordinates as App.prevPixel, so the next pixel rendered will be smoothly drawn from these coordinate points to the next ones.
            prevPixel = data.coords;
          });

          // When the user has mouseup (and finished drawing) then ```App.prevPixel``` will be emptied.
          Socket.on('end', function() {
            prevPixel = [];
            context.closePath();
            otherUserActive = false;
          });

        });
      };
      //hardcoded board for now, just for testing purposes
      //replace this with a board you know exists on your local database
      setBoard('5654cdad95dc31d2c0c6c817');
    }
  };
});
