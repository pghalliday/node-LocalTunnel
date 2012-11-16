var util = require('util'),
    EventEmitter = require('events').EventEmitter;

function LocalTunnel(port, binary) {
  var self = this,
      child,
      started = false;

  if (!binary) {
    binary = 'localtunnel'; 
  }

  process.on("exit", function(code, signal) {
    if (child) {
      child.kill(signal);
    }
  });
  
  self.start = function(callback) {
    if (started) {
      self.emit('error', new Error('local tunnel already started'));
    } else {
      var stdoutData = '';
      var stdout;

      if (process.platform === 'win32') {
        child = require('child_process').spawn('cmd', ['/s', '/c', binary, port]);
        stdout = child.stdout;
        child.stderr.on('data', function(data) {
          stdoutData += data;
        });
      } else {
        stdout = child = require('pty.js').spawn(binary, [port], {
          name: 'localtunnel',
          cols: 80,
          rows: 30
        });
      }

      child.on('exit', function(code, signal) {
        child = null;
        if (!started) {
          self.emit('error', new Error('localtunnel failed to start:\n' + stdoutData));
        } else {
          started = false;
          self.emit('stopped');
        }
      });

      stdout.setEncoding();
      stdout.on('data', function(data) {
        stdoutData += data.toString();
        var match = stdoutData.match(/[a-z0-9]{4}\.localtunnel\.com/g);
        if (match && !started) {
          started = true;
          self.once('started', callback);
          self.emit('started', match[0]);
        }
      });
    }
  };
  
  self.stop = function(callback) {
    if (!started) {
      self.emit('error', new Error('localtunnel not active'));
    } else {
      self.once('stopped', callback);
      child.kill();
    }
  };
}
util.inherits(LocalTunnel, EventEmitter);

module.exports = LocalTunnel;