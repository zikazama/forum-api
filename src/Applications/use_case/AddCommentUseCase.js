const AddComment = require('../../Domains/comments/entities/AddComment');

class AddCommentUseCase {
  constructor({ commentRepository, authenticationTokenManager }) {
    this._commentRepository = commentRepository;
    this._authenticationTokenManager = authenticationTokenManager;
  }

  async execute(useCasePayload, useCaseHeaders) {
    const { authorization } = useCaseHeaders;
    if (authorization === undefined) {
      throw new Error('ADD_COMMENT.NO_AUTHORIZATION');
    }
    const splitAuth = authorization.split(' ');
    const { id } = await this._authenticationTokenManager.decodePayload(
      splitAuth[1],
    );
    const addComment = new AddComment({ owner: id, ...useCasePayload });
    return this._commentRepository.addCommentInThread(addComment);
  }
}

module.exports = AddCommentUseCase;
