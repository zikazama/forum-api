const createRouter = require('../../createRouter');
const routes = require('./routes');
const ThreadsHandler = require('./handler');

module.exports = (container) => {
  const threadsHandler = new ThreadsHandler(container);
  return createRouter(routes(threadsHandler));
};
