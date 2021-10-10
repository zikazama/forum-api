const AddComment = require('../../Domains/comments/entities/AddComment');

class AddCommentUseCase {
  constructor({ commentRepository, authenticationTokenManager }) {
    this._commentRepository = commentRepository;
    this._authenticationTokenManager = authenticationTokenManager;
  }

  async execute(useCasePayload, useCaseHeaders, useCaseParams) {
    const { authorization } = useCaseHeaders;
    const { threadId } = useCaseParams;
    if (authorization === undefined) {
      throw new Error('ADD_COMMENT.NO_AUTHORIZATION');
    }
    if (threadId === undefined) {
      throw new Error('ADD_COMMENT.NO_PARAMS');
    }
    const splitAuth = authorization.split(' ');
    const { id } = await this._authenticationTokenManager.decodePayload(
      splitAuth[1],
    );
    const addComment = new AddComment({ owner: id, threadId, ...useCasePayload });
    return this._commentRepository.addCommentInThread(addComment);
  }
}

module.exports = AddCommentUseCase;
