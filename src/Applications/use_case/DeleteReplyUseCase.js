const DeleteReply = require('../../Domains/comments/entities/DeleteReply');

class DeleteReplyUseCase {
  constructor({ commentRepository, authenticationTokenManager }) {
    this._commentRepository = commentRepository;
    this._authenticationTokenManager = authenticationTokenManager;
  }

  async execute({
    authorization, threadId, commentId, replyId,
  }) {
    // eslint-disable-next-line max-len
    const { id } = await this._authenticationTokenManager.verifyTokenFromHeader(authorization);
    const deleteReply = new DeleteReply({
      owner: id, threadId, commentId, replyId,
    });
    await this._commentRepository.deleteReplyComment(deleteReply);
  }
}

module.exports = DeleteReplyUseCase;
