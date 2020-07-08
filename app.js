const path = require('path');
require('dotenv').config({ path: path.join(__dirname, './.env') });
const config = require('config');
const express = require('express');
const http = require('http');
require('./database');
const logger = require('./modules/Logger');

const app = express();
const port = config.get('webPort');

// Trust all proxies, this is required for `req.ip` to work properly with Cloudflare.
app.set('trust proxy', true);

// Parse the HTTP message body for input parameters.
// Any parameters that are found will be added to `req.body`.
app.use(require('./middlewares/bodyParserJson'));
app.use(require('./middlewares/bodyParserUrlencoded'));

// Configure cross-origin resource sharing (CORS).
// Allows CORS to from all origins.
app.use(require('./middlewares/cors'));

// Load all API routes.
const testLinkRoute = require('./routes/testLinkRoute');
const testIdRoute = require('./routes/testIdRoute');
const testNameRoute = require('./routes/testNameRoute');
const itemRoute = require('./routes/itemRoute');
const paintkitRoute = require('./routes/paintkitRoute');
const skinRoute = require('./routes/skinRoute');

// Register the API routes.
app.use('/inspect-links', testLinkRoute);
app.use('/tests/link', testLinkRoute);
app.use('/tests/id', testIdRoute);
app.use('/tests/name', testNameRoute);
app.use('/items', itemRoute);
app.use('/paintkits', paintkitRoute);
app.use('/skins', skinRoute);

// Use a 404 handler for all requests where no Express route was found.
app.use('*', require('./middlewares/notFoundHandler'));

// The global error handler.
app.use(require('./middlewares/errorHandler'));

// Create a new HTTP server instance and attach our Express app as the request listener.
const server = http.createServer(app);

// Start the HTTP server and listen for connections.
server.listen(port, '0.0.0.0', () => {
  logger.info(`Web server is now listening on port ${port}`);
});

module.exports = { app, server };
