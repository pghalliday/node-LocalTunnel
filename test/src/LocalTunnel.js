var expect = require('expect.js'),
    LocalTunnel = require('../../'),
    http = require('http'),
    fork = require('child_process').fork;

var PORT = 8080;
var TEST_RESPONSE = "This is a test";
var LOCALTUNNEL_NOT_FOUND_RESPONSE = "Not found";

describe('LocalTunnel', function() {
  it('should error if the binary does not exist', function(done) {
    var localTunnel = new LocalTunnel(PORT, 'blahblah');
    localTunnel.on('error', function(error) {
      expect(error.message).to.contain('localtunnel failed to start');
      done();
    });
    localTunnel.start(function(hostname) {
      expect().fail('should not get started event');
    });
  });

  it('should error if stopped before started', function(done) {
    var localTunnel = new LocalTunnel(PORT);
    localTunnel.on('error', function(error) {
      expect(error.message).to.be('localtunnel not active');
      done();
    });
    localTunnel.stop(function() {
      expect().fail('should not get stopped event');
    });    
  });

  it('should start a localtunnel', function(done) {
    this.timeout(10000);
    var localTunnel = new LocalTunnel(PORT);
    localTunnel.on('error', function(error) {
      expect().fail('Error encountered starting the tunnel:\n' + error);
    });
    localTunnel.start(function(hostname) {
      expect(hostname).to.contain('localtunnel.com');
      var server = http.createServer(function(request, response) {
        response.end(TEST_RESPONSE);
      });
      server.listen(PORT, function() {
        http.get({
          hostname: hostname
        }, function(response) {
          expect(response.statusCode).to.equal(200);       
          response.setEncoding();
          var responseData = '';
          response.on('data', function(data) {
            responseData += data;
          });
          response.on('end', function() {
            expect(responseData).to.equal(TEST_RESPONSE);
            
            server.close(function() {
              localTunnel.stop(done);
            });
          });
        });
      });
    });
  });

  it('should error if started when already running', function(done) {
    this.timeout(10000);
    var localTunnel = new LocalTunnel(PORT);
    function tempErrorHandler(error) {
      expect().fail('Error encountered starting the tunnel:\n' + error);
    }
    localTunnel.on('error', tempErrorHandler);
    localTunnel.start(function(hostname) {
      localTunnel.removeListener('error', tempErrorHandler);
      localTunnel.on('error', function(error) {
        expect(error.message).to.be('local tunnel already started');
        localTunnel.stop(function(error) {
          done(error);
        });
      });
      localTunnel.start(function(hostname) {
        expect().fail('should not get started event');
      });
    });
  });

  it('should stop when the process exits', function(done) {
    this.timeout(10000);
    var child = fork('./test/support/childProcess.js', [PORT]);
    child.on('message', function(message) {
      if (message.error) {
        expect().fail('Error encountered starting the tunnel:\n' + message.error);
        child.on('exit', done);
      } else {
        expect(message.hostname).to.contain('localtunnel.com');
        child.on('exit', function(code, signal) {
          var server = http.createServer(function(request, response) {
            response.end(TEST_RESPONSE);
          });
          server.listen(PORT, function() {
            http.get({
              hostname: message.hostname
            }, function(response) {
              expect(response.statusCode).to.equal(501);
              response.on('end', function() {
                server.close(done);
              });
            });
          });
        });
      }
      child.kill();
    });
  });
});