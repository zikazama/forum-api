const routes = (handler) => [
  // wajib
  {
    method: 'POST',
    path: '/threads/{threadId}/comments',
    handler: handler.postCommentHandler,
  },
  {
    method: 'DELETE',
    path: '/threads/{threadId}/comments/{commentId}',
    handler: handler.deleteCommentHandler,
  },
  // // tidak wajib
  // {
  //   method: 'POST',
  //   path: '/threads/{threadId}/comments/{commentId}/replies',
  //   handler: handler.postUserHandler,
  // },
  // {
  //   method: 'DELETE',
  //   path: '/threads/{threadId}/comments/{commentId}/replies/{replyId}',
  //   handler: handler.postUserHandler,
  // },
];

module.exports = routes;
