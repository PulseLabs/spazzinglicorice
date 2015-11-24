angular.module('devslate.chatbox', [])
// TODO: use socket from service
.controller('ChatboxCtrl', function ($scope, User, Socket) {
  // ioRoom = $stateParams.boardUrl;
  // socket: io(ioRoom);

  // all messages from users will be stored in texts array
  $scope.texts = [];
  $scope.list = '';
  $scope.message = '';

  // using io instance(socket) by calling it ioRoom(namespace)
  $scope.sendMessage = function (message, $event) {
    $event.preventDefault();
    console.log(message);
    Socket.emit('chat message', message);
    $scope.message = '';
    return false;
  };

  $scope.addTodo = function (list, $event) {
    $event.preventDefault();
    User.addTodo(list)
      .then(function (res) {
        console.log(res);
      })
      .catch(function (err) {
        console.log(err);
      });
    $scope.list = '';
    return false;
  };

  Socket.on('chat message', function (msg) {
    console.log(msg);
    $scope.texts.push(msg);
    $scope.$apply();
  });
});
