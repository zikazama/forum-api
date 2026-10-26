const createRouter = require('../../createRouter');
const UsersHandler = require('./handler');
const routes = require('./routes');

module.exports = (container) => {
  const usersHandler = new UsersHandler(container);
  return createRouter(routes(usersHandler));
};
