angular.module('devslate.toolbar', [])

.controller('ToolbarCtrl', function ($scope, $element, Tools) {
  $scope.changePen = function (option) {
    Tools.changePen(option);
    console.log("The user chose the tool", $element);
    $('input').not($('#' + option)).attr('checked', false);
  };
});
