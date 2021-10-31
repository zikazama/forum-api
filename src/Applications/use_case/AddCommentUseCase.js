const AddComment = require('../../Domains/comments/entities/AddComment');

class AddCommentUseCase {
  constructor({ commentRepository, authenticationTokenManager }) {
    this._commentRepository = commentRepository;
    this._authenticationTokenManager = authenticationTokenManager;
  }

  async _verifyPayload({ authorization, threadId }) {
    if (authorization === undefined || authorization === null) {
      throw new Error('ADD_COMMENT.NO_AUTHORIZATION');
    }
    if (threadId === undefined || threadId === null) {
      throw new Error('ADD_COMMENT.NO_PARAMS');
    }
  }

  async execute(useCasePayload, authorization, useCaseParams) {
    const { threadId } = useCaseParams;
    await this._verifyPayload({ authorization, threadId });

    // eslint-disable-next-line max-len
    const { id } = await this._authenticationTokenManager.verifyTokenFromHeader(authorization);
    const addComment = new AddComment({ owner: id, threadId, ...useCasePayload });
    return this._commentRepository.addCommentInThread(addComment);
  }
}

module.exports = AddCommentUseCase;
