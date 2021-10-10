const AddThread = require('../../../Domains/threads/entities/AddThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AuthenticationTokenManager = require('../../security/AuthenticationTokenManager');
const AddThreadUseCase = require('../AddThreadUseCase');

describe('AddThreadUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the add thread action correctly', async () => {
    // Arrange
    const useCasePayload = {
      title: 'judul',
      body: 'isi',
      owner: 'user-123',
    };

    const useCaseHeaders = {
      authorization: 'jey',
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockAuthenticationTokenManager = new AuthenticationTokenManager();

    /** mocking needed function */
    mockThreadRepository.addThread = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockAuthenticationTokenManager.decodePayload = jest.fn()
      .mockImplementation(() => Promise.resolve({ username: 'dicoding', id: 'user-123' }));

    /** creating use case instance */
    const getThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
      authenticationTokenManager: mockAuthenticationTokenManager,
    });

    // Action
    const addedThread = await getThreadUseCase.execute(useCasePayload, useCaseHeaders);

    // Assert
    expect(mockThreadRepository.addThread).toBeCalledWith(new AddThread({
      title: useCasePayload.title,
      body: useCasePayload.body,
      owner: useCasePayload.owner,
    }));
  });
});
