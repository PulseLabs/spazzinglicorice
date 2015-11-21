angular.module('devslate', [
  'devslate.services',
  'ui.router',
  'devslate.chatbox',
  'devslate.codebox',
  'devslate.splash',
  'devslate.toolbar',
  'devslate.user',
  'devslate.whiteboard',

])
  .config(function($stateProvider, $urlRouterProvider) {

    $stateProvider
      .state('splash', {
        url: '/splash',
        templateUrl: 'app/splash/splash.html',
        controller: 'SplashCtrl'
      })
      .state('board', {
        views: {
          'whiteboard': {
            templateUrl: 'app/whiteboard/whiteboard.html',
            controller: 'WhiteboardCtrl'
          },
          'codebox': {
            templateUrl: 'app/codebox/codebox.html',
            controller: 'CodeboxCtrl'
          },
          'chatbox': {
            templateUrl: 'app/chatbox/chatbox.html',
            controller: 'ChatboxCtrl'
          },
          'toolbar': {
            templateUrl: 'app/toolbar/toolbar.html',
            controller: 'ToolbarCtrl'
          }
        }
      })
      .state('userpage', {
        templateUrl: 'users/userpage.html',
        controller: 'UserCtrl'
      });
      $urlRouterProvider.otherwise('/splash');
  })

// Make sure the stateprovider routes get started up
.run(['$state', function ($state) {}]);
