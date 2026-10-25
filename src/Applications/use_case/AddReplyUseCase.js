const AddReply = require('../../Domains/comments/entities/AddReply');

class AddReplyUseCase {
  constructor({ commentRepository, authenticationTokenManager }) {
    this._commentRepository = commentRepository;
    this._authenticationTokenManager = authenticationTokenManager;
  }

  async execute(useCasePayload, authorization, useCaseParams) {
    const { threadId, commentId } = useCaseParams;
    // eslint-disable-next-line max-len
    const { id } = await this._authenticationTokenManager.verifyTokenFromHeader(authorization);
    // owner diambil dari token, bukan dari body, agar tidak bisa menyamar sebagai pengguna lain
    const addReply = new AddReply({
      ...useCasePayload, threadId, commentId, owner: id,
    });
    return this._commentRepository.addReplyComment(addReply);
  }
}

module.exports = AddReplyUseCase;
