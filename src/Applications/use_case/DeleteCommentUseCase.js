const DeleteComment = require('../../Domains/comments/entities/DeleteComment');

class DeleteCommentUseCase {
  constructor({ commentRepository, authenticationTokenManager }) {
    this._commentRepository = commentRepository;
    this._authenticationTokenManager = authenticationTokenManager;
  }

  async _verifyPayload({ userId, threadId, commentId }) {
    if (userId === undefined) {
      throw new Error('DELETE_COMMENT.NO_AUTHORIZATION');
    }
    if (threadId === undefined || commentId === undefined) {
      throw new Error('DELETE_COMMENT.NO_PARAMS');
    }
  }

  async execute({ userId, threadId, commentId }) {
    await this._verifyPayload({ userId, threadId, commentId });
    const deleteComment = new DeleteComment({ owner: userId, threadId, commentId });
    await this._commentRepository.deleteCommentInThread(deleteComment);
  }
}

module.exports = DeleteCommentUseCase;
