node-localtunnel
=========

Node.js wrapper for the localtunnel ruby client

## Features

- should start the localtunnel client
- should stop the localtunnel client when the process exits
- should error if the binary does not exist
- should error if stopped before started
- should error if started when already running

## Prerequisites

The ruby localtunnel client should be installed and correctly configured with a public key

http://progrium.com/localtunnel/

## Installation

```
npm install node-localtunnel
```

## API

```javascript
var LocalTunnel = require('node-localtunnel');

var localTunnel = new LocalTunnel(8080);
localTunnel.on('error', function(error) {
  console.log(error);
});
localTunnel.start(function(hostname) {
  // Now forwarding to local port 8080 through localtunnel.com
  // The assigned hostname is given in the hostname parameter
});
```

## Roadmap

- Nothing yet

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using ``./grunt.sh`` or ``.\grunt.bat``.

## Release History
_(Nothing yet)_

## License
Copyright (c) 2012 Peter Halliday  
Licensed under the MIT license.