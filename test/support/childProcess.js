var LocalTunnel = require('../../');

var localTunnel = new LocalTunnel(process.argv[2]);
localTunnel.start(function(error, hostname) {
  if (error) {
    process.send({error: error.toString()});
  } else {
    process.send({hostname: hostname});
  }
});

