const DeleteComment = require('../../Domains/comments/entities/DeleteComment');

class DeleteCommentUseCase {
  constructor({ commentRepository, authenticationTokenManager }) {
    this._commentRepository = commentRepository;
    this._authenticationTokenManager = authenticationTokenManager;
  }

  async _verifyPayload({ authorization, threadId }) {
    if (authorization === undefined) {
      throw new Error('DELETE_COMMENT.NO_AUTHORIZATION');
    }
    if (threadId === undefined) {
      throw new Error('DELETE_COMMENT.NO_PARAMS');
    }
  }

  async execute(useCaseParams, useCaseHeaders) {
    const { authorization } = useCaseHeaders;
    const { threadId, commentId } = useCaseParams;
    await this._verifyPayload({ authorization, threadId });

    const splitAuth = authorization.split(' ');
    const { id } = await this._authenticationTokenManager.decodePayload(
      splitAuth[1],
    );
    const deleteComment = new DeleteComment({ owner: id, threadId, commentId });
    await this._commentRepository.deleteCommentInThread(deleteComment);
  }
}

module.exports = DeleteCommentUseCase;
