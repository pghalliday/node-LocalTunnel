var expect = require('expect.js'),
    LocalTunnel = require('../../'),
    http = require('http');

var PORT = 8080;
var TEST_RESPONSE = "This is a test";

describe('LocalTunnel', function() {
  var server;
  
  before(function(done) {
    server = http.createServer(function(request, response) {
      response.end(TEST_RESPONSE);
    });
    server.listen(PORT, done);
  });

  it('should start and stop the localtunnel client', function(done) {
    this.timeout(10000);
    var localTunnel = new LocalTunnel(PORT);
    localTunnel.start(function(error, hostname) {
      if (error) {
        expect().fail('Error encountered starting the tunnel:\n' + error);
      } else {
        expect(hostname).to.contain('localtunnel.com');
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
            localTunnel.stop(function(error) {
              if (error) {
                expect().fail('Error encountered stopping the tunnel:\n' + error);
              } else {
                done();
              }
            });
          });
        });
      }
    });
  });

  it('should error if the binary does not exist', function(done) {
    var localTunnel = new LocalTunnel(PORT, 'blahblah');
    localTunnel.start(function(error, hostname) {
      expect(error.message).to.contain('child failed to start');
      expect(hostname).to.not.be.ok();
      done();
    });
  });

  it('should error if stopped before started', function(done) {
    var localTunnel = new LocalTunnel(PORT);
    localTunnel.stop(function(error) {
      expect(error.message).to.be('child not started');
      done();
    });    
  });

  it('should error if started when already running', function(done) {
    this.timeout(10000);
    var localTunnel = new LocalTunnel(PORT);
    localTunnel.start(function(error, hostname) {
      if (error) {
        expect().fail('Error encountered starting the tunnel:\n' + error);
      } else {
        localTunnel.start(function(error, hostname) {
          expect(error.message).to.be('child already started');
          expect(hostname).to.not.be.ok();
          localTunnel.stop(function(error) {
            if (error) {
              expect().fail('Error encountered stopping the tunnel:\n' + error);
            } else {
              done();
            }
          });
        });
      }
    });
  });
  
  after(function(done) {
    server.close(done);
  });
});