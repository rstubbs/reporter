'use strict';

exports = module.exports = function(app, mongoose) {
  require('./schema/Note')(app, mongoose);
  
  require('./schema/Mediafile')(app, mongoose);

  require('./schema/User')(app, mongoose);
  require('./schema/Admin')(app, mongoose);
  require('./schema/AdminGroup')(app, mongoose);
  require('./schema/Account')(app, mongoose);
  require('./schema/LoginAttempt')(app, mongoose);
};
