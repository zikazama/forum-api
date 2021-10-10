const AddThread = require('../../Domains/threads/entities/AddThread');

class AddThreadUseCase {
  constructor({ threadRepository, authenticationTokenManager }) {
    this._threadRepository = threadRepository;
    this._authenticationTokenManager = authenticationTokenManager;
  }

  async execute(useCasePayload, useCaseHeaders) {
    const { authorization } = useCaseHeaders;
    if (authorization === undefined) {
      throw new Error('ADD_THREAD.NO_AUTHORIZATION');
    }
    const splitAuth = authorization.split(' ');
    const { id } = await this._authenticationTokenManager.decodePayload(
      splitAuth[1],
    );
    const addThread = new AddThread({ owner: id, ...useCasePayload });
    return this._threadRepository.addThread(addThread);
  }
}

module.exports = AddThreadUseCase;
