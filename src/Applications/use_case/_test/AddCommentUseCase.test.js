const AddComment = require('../../../Domains/comments/entities/AddComment');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AuthenticationTokenManager = require('../../security/AuthenticationTokenManager');
const AddCommentUseCase = require('../AddCommentUseCase');

describe('AddCommentUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should throw error if authorization undefined', async () => {
    // Arrange
    const useCasePayload = {
      content: 'isi',
      owner: 'user-123',
    };

    const useCaseHeaders = null;

    const useCaseParams = {
      threadId: 'thread-123',
    };

    const expectedComment = {
      id: 'comment-123',
      threadId: useCaseParams.threadId,
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    };

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockAuthenticationTokenManager = new AuthenticationTokenManager();

    /** mocking needed function */
    mockCommentRepository.addCommentInThread = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedComment));
    mockAuthenticationTokenManager.decodePayload = jest.fn()
      .mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const getCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      authenticationTokenManager: mockAuthenticationTokenManager,
    });

    // Assert
    await expect(getCommentUseCase.execute(useCasePayload, useCaseHeaders, useCaseParams))
      .rejects
      .toThrowError('ADD_COMMENT.NO_AUTHORIZATION');
  });

  it('should throw error if threadId undefined', async () => {
    // Arrange
    const useCasePayload = {
      content: 'isi',
      owner: 'user-123',
    };

    const useCaseHeaders = {
      authorization: 'user-123',
    };

    const useCaseParams = {
    };

    const expectedComment = {
      id: 'comment-123',
      threadId: useCaseParams.threadId,
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    };

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockAuthenticationTokenManager = new AuthenticationTokenManager();

    /** mocking needed function */
    mockCommentRepository.addCommentInThread = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedComment));
    mockAuthenticationTokenManager.decodePayload = jest.fn()
      .mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const getCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      authenticationTokenManager: mockAuthenticationTokenManager,
    });

    // Assert
    await expect(getCommentUseCase.execute(useCasePayload, useCaseHeaders, useCaseParams))
      .rejects
      .toThrowError('ADD_COMMENT.NO_PARAMS');
  });

  it('should orchestrating the add comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'isi',
      owner: 'user-123',
    };

    const useCaseHeaders = 'jey';

    const useCaseParams = {
      threadId: 'thread-123',
    };

    const expectedComment = {
      id: 'comment-123',
      threadId: useCaseParams.threadId,
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    };

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockAuthenticationTokenManager = new AuthenticationTokenManager();

    /** mocking needed function */
    mockCommentRepository.addCommentInThread = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedComment));
    mockAuthenticationTokenManager.decodePayload = jest.fn()
      .mockImplementation(() => Promise.resolve({ username: 'dicoding', id: 'user-123' }));

    /** creating use case instance */
    const getCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      authenticationTokenManager: mockAuthenticationTokenManager,
    });

    // Action
    // eslint-disable-next-line max-len
    const addedComment = await getCommentUseCase.execute(useCasePayload, useCaseHeaders, useCaseParams);

    // Assert
    expect(addedComment).toStrictEqual(expectedComment);
    expect(mockCommentRepository.addCommentInThread).toBeCalledWith(new AddComment({
      threadId: useCaseParams.threadId,
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    }));
  });
});
