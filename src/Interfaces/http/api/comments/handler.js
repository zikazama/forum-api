const AddCommentUseCase = require('../../../../Applications/use_case/AddCommentUseCase');
const DeleteCommentUseCase = require('../../../../Applications/use_case/DeleteCommentUseCase');
const AuthenticationTokenManager = require('../../../../Applications/security/AuthenticationTokenManager');

class CommentsHandler {
  constructor(container) {
    this._container = container;
    this.postCommentHandler = this.postCommentHandler.bind(this);
    this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
  }

  async postCommentHandler(request, h) {
    const addCommentUseCase = this._container.getInstance(AddCommentUseCase.name);
    const { authorization } = request.headers;
    // eslint-disable-next-line max-len
    const addedComment = await addCommentUseCase.execute(request.payload, authorization, request.params);

    const response = h.response({
      status: 'success',
      data: {
        addedComment,
      },
    });
    response.code(201);
    return response;
  }

  async deleteCommentHandler(request, h) {
    const { authorization } = request.headers;
    const { threadId, commentId } = request.params;
    const deleteCommentUseCase = this._container.getInstance(DeleteCommentUseCase.name);

    // eslint-disable-next-line max-len
    await deleteCommentUseCase.execute({ authorization, threadId, commentId });

    const response = h.response({
      status: 'success',
    });
    response.code(200);
    return response;
  }
}

module.exports = CommentsHandler;
