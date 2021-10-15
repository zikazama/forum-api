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

    const splitAuth = authorization.split(' ');
    const { id } = await this._authenticationTokenManager.decodePayload(
      splitAuth[1],
    );
    const addComment = new AddComment({ owner: id, threadId, ...useCasePayload });
    return this._commentRepository.addCommentInThread(addComment);
  }
}

module.exports = AddCommentUseCase;
