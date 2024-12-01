require('dotenv').config()
const app = require('./app');
const debug = require('debug')('mrestaurant:server');
const http = require('http');

/**
 * Get port from environment and store in Express.
 */
const port = process.env.PORT || 8080;
app.set('port', port);

/**
 * Create HTTP server.
 */
const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port);

/**
 * Event listener for HTTP server "error" event.
 */
server.on('error', error =>{
    if (error.syscall !== 'listen') {
        throw error;
    }

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error('Port requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error('Port is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
});

/**
 * Event listener for HTTP server "listening" event.
 */
server.on('listening', () => {
    var addr = server.address();
    debug('Listening on ' + addr.port);
});
