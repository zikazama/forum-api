const DeleteComment = require('../../Domains/comments/entities/DeleteComment');

class DeleteCommentUseCase {
  constructor({ commentRepository, authenticationTokenManager }) {
    this._commentRepository = commentRepository;
    this._authenticationTokenManager = authenticationTokenManager;
  }

  async _verifyPayload({ token, threadId, commentId }) {
    if (token === undefined || token === null) {
      throw new Error('DELETE_COMMENT.NO_AUTHORIZATION');
    }
    if (threadId === undefined || commentId === undefined) {
      throw new Error('DELETE_COMMENT.NO_PARAMS');
    }
  }

  async execute({ token, threadId, commentId }) {
    await this._verifyPayload({ token, threadId, commentId });
    const { id: userId } = await this._authenticationTokenManager.decodePayload(
      token,
    );
    const deleteComment = new DeleteComment({ owner: userId, threadId, commentId });
    await this._commentRepository.deleteCommentInThread(deleteComment);
  }
}

module.exports = DeleteCommentUseCase;
