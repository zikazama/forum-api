const routes = require('./routes');
const CommentssHandler = require('./handler');

module.exports = {
  name: 'comments',
  register: async (server, { container }) => {
    const commentsHandler = new CommentssHandler(container);
    server.route(routes(commentsHandler));
  },
};
