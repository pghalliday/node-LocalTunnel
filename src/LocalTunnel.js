var util = require('util'),
    ChildDaemon = require('child-daemon');

function LocalTunnel(port) {
  var match = new RegExp('[a-z0-9]{4}\\.localtunnel\\.com');

  if (process.platform === 'win32') {
    // on windows we need to call ruby and search the path for the localtunnel program
    // as child_process.spawn (used by ChildDaemon) only supports .exe files
    ChildDaemon.call(
      this,
      'ruby',
      ['-S', 'localtunnel', port],
      match
    );    
  } else {
    ChildDaemon.call(
      this,
      'localtunnel',
      [port],
      match
    );    
  }

  this.superStart = this.start;
  this.start = function(callback) {
    this.superStart(function(error, matched) {
      var hostname = matched ? matched[0] : hostname;
      callback(error, hostname);
    });
  };
}
util.inherits(LocalTunnel, ChildDaemon);

module.exports = LocalTunnel;