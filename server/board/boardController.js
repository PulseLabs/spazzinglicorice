// boardControllers.js
var Board = require('../../db/board.js');
var User = require('../../db/user.js');

module.exports = {
  createBoard: function (req, res, next) {
    // TODO: session - user
    var boardname = req.body.name;
    var board = new Board({strokes: [], name: boardname});
    var fbId = req.session.passport.user.facebookId;

    User.findOne({facebookId: fbId}).exec(function (err, user) {
      if (user) {
        user.bookmarks.push({name: boardname, url: board._id.toString()});
        user.save(function (err, user) {
          if (err) {console.log('err!');}
          board.save(function(err, board) {
            if (err) { console.error(err); }
            else {
              console.log('board saved!!!!');
              res.status(200).json(user.bookmarks);
            }
          }); 
        });
      } else {
        console.log('log in first');
      }

      if (err) {next(err);}
    });
  },

  gotoBoard: function (req, res) {
    var url = req.params.url;
    res.redirect('/'+url);
  }
};
