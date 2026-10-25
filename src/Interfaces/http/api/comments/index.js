const createRouter = require('../../createRouter');
const routes = require('./routes');
const CommentsHandler = require('./handler');

module.exports = (container) => {
  const commentsHandler = new CommentsHandler(container);
  return createRouter(routes(commentsHandler));
};
