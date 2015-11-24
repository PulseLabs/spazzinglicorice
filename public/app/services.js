angular.module('devslate.services', [])

.factory('Tools', function($rootScope) {
  // Set changePen method.
  // Note that an eraser is simply a white pen, not actually erasing [x,y] tuples from the database.
  var changePen = function(option) {
    console.log($rootScope.app.pen);
    if (option === 'eraser') {
      console.log("The user is using the eraser.");
      $rootScope.app.pen.lineWidth = 50;
      $rootScope.app.pen.strokeStyle = '#fff';
    } else {
      console.log("The user is using the pen.");
      $rootScope.app.pen.lineWidth = 5;
      $rootScope.app.pen.strokeStyle = option;
    }
  };
  return {
    changePen: changePen
  };
})

.factory('Board', function ($http, Socket) {
//
//
//   var initialize = function (canvasElement, webrtcElements) {
//     // var webrtc = new SimpleWebRTC({
//     //   localVideoEl: webrtcElements.local,
//     //   remoteVideosEl: webrtcElements.remote,
//     //   autoRequestMedia: true
//     // });
//
//     // webrtc.on('readyToCall', function () {
//     //   webrtc.joinRoom(Socket.ioRoom);
//     // });
//
//   //   canvas[0].width = window.innerWidth;
//   //   canvas[0].height = window.innerHeight * 0.7;
//   //   var context = canvas[0].getContext("2d");
//   //
//   //   Socket.on('join', function (board) {
//   //     console.log("Joining the board.");
//   //
//   //     // Check for null board data.
//   //     if (board) {
//   //       for (var i = 0; i < board.strokes.length; i++) {
//   //         // Check for null stroke data.
//   //         if (board.strokes[i]) {
//   //           // Set pen and draw path.
//   //           var strokesArray = board.strokes[i].path;
//   //           var penProperties = board.strokes[i].pen;
//   //           initializeMouseDown(penProperties, strokesArray[0][0], strokesArray[0][1]);
//   //
//   //           // Draw the path according to the strokesArray (array of coordinate tuples).
//   //           for (var j = 0; j < strokesArray.length; j++) {
//   //             draw(strokesArray[j][0], strokesArray[j][1]);
//   //           }
//   //           context.closePath();
//   //         }
//   //       }
//   //     }
//   //   });
//   //
//   //   // If another user is drawing, App.socket will receive a 'drag' event. App listens for the drag event and renders the drawing element created by the other user.
//   //   // Note that App prevents the current user from drawing while the other user is still drawing.
//   //   Socket.on('drag', function (data) {
//   //     otherUserActive = true;
//   //     console.log("Receiving data from another user:", data);
//   //
//   //     // ```App.prevPixel``` is an array of the previous coordinates sent, so drawing is smoothly rendered across different browsers.
//   //     // If the ```App.prevPixel``` array is empty (i.e., this is the first pixel of the drawn element), then prevPixel is set as the coordinates of the current mouseclick.
//   //     if (prevPixel.length === 0) {
//   //       prevPixel = data.coords;
//   //     }
//   //
//   //     // Initialize beginning coordinates and drawing.
//   //     initializeMouseDown(data.pen, prevPixel[0], prevPixel[1]);
//   //     draw(data.coords[0], data.coords[1]);
//   //
//   //     // Set the current coordinates as App.prevPixel, so the next pixel rendered will be smoothly drawn from these coordinate points to the next ones.
//   //     prevPixel = data.coords;
//   //   });
//   //
//   //   // When the user has mouseup (and finished drawing) then ```App.prevPixel``` will be emptied.
//   //   Socket.on('end', function() {
//   //     prevPixel = [];
//   //     context.closePath();
//   //     otherUserActive = false;
//   //   });
//   //   console.log('about to return from Board.initialize');
//   //   return {
//   //     webrtc: webrtc,
//   //     canvas: canvas,
//   //     mouse: mouse,
//   //     pen: pen,
//   //     draw: draw,
//   //     initializeMouseDown: initializeMouseDown
//   //   };
//   // };
//   //
  var newBoard = function () {
    console.log('called board.newBoard');
    return $http({
      method: 'GET',
      url: '/new',
      data: {}
    })
    .then(function (resp) {
      console.log('data: ', resp.data);
      return resp.data;
    });
  };

  var connectBoard = function (id) {
    return $http({
      method: 'GET',
      url: '/board/' + id,
      data: {}
    })
    .then(function (resp) {
      console.log('data: ', resp.data);
      return resp.data;
    });
  };

  return {
    // initialize: initialize,
    newBoard: newBoard,
    connectBoard: connectBoard
    // otherUserActive: otherUserActive,
    // stroke: stroke,
  };
//
})

// .factory('Socket', function () {
//   // var ioRoom = window.location.href;
//   // console.log('ioRoom inside Socket: ', ioRoom);
//   // var socket = io(ioRoom);
//   var ioRoom;
//   var socket;
//
//   var setSocket = function (namespace) {
//     // ioRoom = window.location.href;
//     // console.log('ioRoom inside Socket: ', ioRoom);
//     socket = io(namespace);
//   };
//
//   var getSocket = function () {
//     return socket;
//   };
//   return {
//     setSocket: setSocket,
//     socket: socket,
//     ioRoom: ioRoom
//   };
// })

.factory('Socket', function ($rootScope) {
  var socket = io;

  return {
    set: function (ioRoom) {
      socket = io.connect('http://localhost:8080/' + ioRoom);
      console.log('set socket to: ', ioRoom);
      console.log('socket: ', socket);
    },
    on: function (eventName, callback) {
      console.log('set socket listener: ', eventName);
      socket.on(eventName, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      });
    }
  };
})

.factory('Chat', function($scope, $element, tools) {
  // var sendMessages = function () {

  // };
  // return {
  //   sendMessages: sendMessages
  // }
})

.factory('User', function ($http) {
  // TODO: get username from session
  var getUser = function () {
    return $http({
      method: 'GET',
      url: 'http://localhost:8080/api/user'
    }).then(function (res) {
      // user object
      return res.data;
    });
  };

  // TODO: get username from session
  var getTodos = function () {
    return $http({
      method: 'GET',
      url: 'http://localhost:8080/api/user/todo'
    }).then(function (res) {
      // return todos list(Array)
      console.log('please get Todos');
      console.log(res);
      return res.data;
    });
  };

  // TODO: get username from session
  var addTodo = function (todo) {
    return $http({
      method: 'POST',
      data: todo,
      url: 'http://localhost:8080/api/user/todo'
    });
  };

  // TODO: get username from session
  var getBookmarks = function () {
    return $http({
      method: 'GET',
      url: 'http://localhost:8080/api/user/bookmark'
    }).then(function (res) {
      // return bookmarks list(Array)
      console.log(res);
      return res.data;
    });
  };

  // TODO: get username from session
  var addBookmark = function (bookmark) {
    return $http({
      method: 'POST',
      data: bookmark,
      url: 'http://localhost:8080/api/user/bookmark'
    });
  };

  var getBookmark = function (bookmarkUrl) {
    return $http({
      method: 'GET',
      url: 'http://localhost:8080/api/user/bookmark/' + bookmarkUrl
    }).then(function (res) {
      // return bookmarks list(Array)
      console.log(res);
      return res.data;
    });
  };



  var getAllUser = function () {

  };

  return {
    addTodo: addTodo,
    getTodos: getTodos,
    addBookmark: addBookmark,
    getBookmarks: getBookmarks,
    getUser: getUser,
    getBookmark: getBookmark
  };
});
