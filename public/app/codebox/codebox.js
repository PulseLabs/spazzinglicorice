angular.module('devslate.codebox', ['ui.codemirror'])

.controller('CodeboxCtrl', function (Socket, $scope) {
  var api = Socket;
   $scope.editorOptions = {
        lineWrapping : true,
        lineNumbers: true,
        mode: 'javascript',
        value: 'asdasdas',
        theme: 'solarized light',
        tabSize: 2,
        keyMap: 'sublime'
    };



  $scope.send = function () {
    Socket.emit('code-text', $scope.code);
  };



  $scope.codebox = function (_editor) {
     // Editor part
      var _doc = _editor.getDoc();
      _editor.focus();

      // Options
      // _editor.setOption('firstLineNumber', 10);
      _doc.markClean();

      var copy = _doc.linkedDoc();

      api.on('code-text', function (data) {
        copy.setValue(data);
         });

     //  // Events
     //  _editor.on("beforeChange", function(){ ... });
     //  _editor.on("change", function(){ ... });
    };


});
