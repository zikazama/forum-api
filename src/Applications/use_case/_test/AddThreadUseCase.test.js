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
      authorization: 'user-123',
    };

    const expectedThread = {
      id: 'thread-123',
      title: 'judul',
      body: 'isi',
      owner: 'user-123',
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockAuthenticationTokenManager = new AuthenticationTokenManager();

    /** mocking needed function */
    mockThreadRepository.addThread = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedThread));
    mockAuthenticationTokenManager.decodePayload = jest.fn()
      .mockImplementation(() => Promise.resolve({ username: 'dicoding', id: 'user-123' }));

    /** creating use case instance */
    const getThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
      authenticationTokenManager: mockAuthenticationTokenManager,
    });

    // Action
    const verifiedThread = await getThreadUseCase._verifyPayload(useCaseHeaders);
    const addedThread = await getThreadUseCase.execute(useCasePayload, useCaseHeaders);

    // Assert
    expect(verifiedThread).toBeUndefined();
    expect(addedThread).toStrictEqual(expectedThread);
    expect(mockThreadRepository.addThread).toBeCalledWith(new AddThread({
      title: useCasePayload.title,
      body: useCasePayload.body,
      owner: useCasePayload.owner,
    }));
  });

  it('should orchestrating the add thread action false payload', async () => {
    // Arrange
    const useCasePayload = {
      title: 'judul',
      body: 'isi',
      owner: 'user-123',
    };

    const useCaseHeaders = {
    };

    const expectedThread = {
      id: 'thread-123',
      title: 'judul',
      body: 'isi',
      owner: 'user-123',
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockAuthenticationTokenManager = new AuthenticationTokenManager();

    /** mocking needed function */
    mockThreadRepository.addThread = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedThread));
    mockAuthenticationTokenManager.decodePayload = jest.fn()
      .mockImplementation(() => Promise.resolve({ username: 'dicoding', id: 'user-123' }));

    /** creating use case instance */
    const getThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
      authenticationTokenManager: mockAuthenticationTokenManager,
    });

    // Assert
    await expect(getThreadUseCase._verifyPayload(useCaseHeaders))
      .rejects
      .toThrowError('ADD_THREAD.NO_AUTHORIZATION');
    // eslint-disable-next-line max-len
    await expect(getThreadUseCase.execute(useCasePayload, useCaseHeaders))
      .rejects
      .toThrowError('ADD_THREAD.NO_AUTHORIZATION');
  });
});
