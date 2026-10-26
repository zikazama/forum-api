const createRouter = require('../../createRouter');
const routes = require('./routes');
const AuthenticationsHandler = require('./handler');

module.exports = (container) => {
  const authenticationsHandler = new AuthenticationsHandler(container);
  return createRouter(routes(authenticationsHandler));
};
