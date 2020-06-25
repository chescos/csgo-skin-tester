const path = require('path');
require('dotenv').config({ path: path.join(__dirname, './.env') });
const config = require('config');
const express = require('express');
const http = require('http');
require('./database');
const logger = require('./modules/Logger');

const app = express();
const port = config.get('port');

// Parse the HTTP message body for input parameters.
// Any parameters that are found will be added to `req.body`.
app.use(require('./middlewares/bodyParserJson'));
app.use(require('./middlewares/bodyParserUrlencoded'));

// Load all API routes.
const inspectLinkRoute = require('./routes/inspectLinkRoute');

// Register the API routes.
app.use('/inspect-links', inspectLinkRoute);

// Use a 404 handler for all requests where no Express route was found.
app.use('*', require('./middlewares/notFoundHandler'));

// The global error handler.
app.use(require('./middlewares/errorHandler'));

// Create a new HTTP server instance and attach our Express app as the request listener.
const server = http.createServer(app);

// Start the HTTP server and listen for connections.
server.listen(port, '0.0.0.0', () => {
  logger.info(`Listening on port ${port}`);
});

module.exports = { app, server };
