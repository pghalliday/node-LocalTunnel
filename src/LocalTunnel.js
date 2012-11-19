var util = require('util'),
    ChildDaemon = require('child-daemon');

function LocalTunnel(port, binary) {
  binary = binary || 'localtunnel';
  ChildDaemon.call(
    this,
    binary,
    [port],
    new RegExp('[a-z0-9]{4}\\.localtunnel\\.com')
  );
  
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