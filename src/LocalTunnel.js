var util = require('util'),
    ChildKiller = require('ChildKiller');

function LocalTunnel(port, binary) {
  binary = binary || 'localtunnel';
  ChildKiller.call(
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
util.inherits(LocalTunnel, ChildKiller);

module.exports = LocalTunnel;