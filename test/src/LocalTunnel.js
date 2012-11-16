var expect = require('expect.js'),
    LocalTunnel = require('../../'),
    http = require('http');

var PORT = 8080;
var TEST_RESPONSE = "This is a test";

describe('LocalTunnel', function() {
  it('should error if the binary does not exist', function(done) {
    var localTunnel = new LocalTunnel(PORT, 'blahblah');
    localTunnel.start(function(error, hostname) {
      expect(error.toString()).to.contain('localtunnel failed to start');
      done();
    });
  });

  it('should error if stopped before started', function(done) {
    var localTunnel = new LocalTunnel(PORT);
    localTunnel.stop(function(error) {
      expect(error.toString()).to.contain('localtunnel not active');
      done();
    });    
  });

  it('should start a localtunnel', function(done) {
    this.timeout(10000);
    var localTunnel = new LocalTunnel(PORT);
    localTunnel.start(function(error, hostname) {
      if (error) {
        expect().fail('Error encountered starting the tunnel:\n' + error);
      }
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
        }).on('error', function(error) {
          server.close(function() {
            localTunnel.stop(function() {
              done(error);
            });
          });
        });
      });
    });
  });

  it.skip('should error if started when already running', function(done) {
    done();
  });

  it.skip('should stop when the process exits', function(done) {
    done();
  });
});