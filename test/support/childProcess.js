var LocalTunnel = require('../../');

var localTunnel = new LocalTunnel(process.argv[2]);
localTunnel.on('error', function(error) {
  process.send({error: error.toString()});	
});
localTunnel.start(function(hostname) {
  process.send({hostname: hostname});
});

