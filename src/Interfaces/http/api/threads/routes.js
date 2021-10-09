const routes = (handler) => [
  // wajib
  {
    method: 'POST',
    path: '/threads',
    handler: handler.postUserHandler,
  },
  {
    method: 'GET',
    path: '/threads/{threadId}',
    handler: handler.postUserHandler,
  },
];

module.exports = routes;
