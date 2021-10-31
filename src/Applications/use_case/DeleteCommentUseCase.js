const DeleteComment = require('../../Domains/comments/entities/DeleteComment');

class DeleteCommentUseCase {
  constructor({ commentRepository, authenticationTokenManager }) {
    this._commentRepository = commentRepository;
    this._authenticationTokenManager = authenticationTokenManager;
  }

  async _verifyPayload({ authorization, threadId, commentId }) {
    if (authorization === undefined || authorization === null) {
      throw new Error('DELETE_COMMENT.NO_AUTHORIZATION');
    }
    if (threadId === undefined || commentId === undefined) {
      throw new Error('DELETE_COMMENT.NO_PARAMS');
    }
  }

  async execute({ authorization, threadId, commentId }) {
    await this._verifyPayload({ authorization, threadId, commentId });
    // eslint-disable-next-line max-len
    const { id } = await this._authenticationTokenManager.verifyTokenFromHeader(authorization);
    const deleteComment = new DeleteComment({ owner: id, threadId, commentId });
    await this._commentRepository.deleteCommentInThread(deleteComment);
  }
}

module.exports = DeleteCommentUseCase;
