const routes = require('./routes');
const CommentssHandler = require('./handler');

module.exports = {
  name: 'threads',
  register: async (server, { container }) => {
    const commentsHandler = new CommentssHandler(container);
    server.route(routes(commentsHandler));
  },
};
