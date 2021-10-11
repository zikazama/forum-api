const CommentRepository = require('../../../Domains/comments/CommentRepository');
const DeleteCommentUseCase = require('../DeleteCommentUseCase');
const CommnetRepository = require('../../../Domains/comments/CommentRepository');
const AuthenticationTokenManager = require('../../security/AuthenticationTokenManager');

describe('DeleteCommentUseCase', () => {
  it('should throw error if use case payload not contain params', async () => {
    // Arrange
    const useCaseParams = {};
    const useCaseHeaders = {};
    const deleteCommentUseCase = new DeleteCommentUseCase({});

    // Action & Assert
    await expect(deleteCommentUseCase.execute(useCaseParams, useCaseHeaders))
      .rejects
      .toThrowError('DELETE_COMMENT.NO_AUTHORIZATION');
  });

  it('should throw error if no needed property', async () => {
    // Arrange
    const useCaseParams = {
      commentId: 'comment-123',
    };
    const useCaseHeaders = {
      authorization: 'user-123',
    };

    /** creating dependency of use case */
    const mockCommentRepository = new CommnetRepository();
    const mockAuthenticationTokenManager = new AuthenticationTokenManager();

    /** mocking needed function */
    mockCommentRepository.deleteCommentInThread = jest.fn()
      // eslint-disable-next-line max-len
      .mockImplementation(() => Promise.resolve({ owner: useCaseHeaders.authorization, ...useCaseParams }));
    mockAuthenticationTokenManager.decodePayload = jest.fn()
      .mockImplementation(() => Promise.resolve({ username: 'dicoding', id: 'user-123' }));

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      authenticationTokenManager: mockAuthenticationTokenManager,
    });

    // Action & Assert
    await expect(deleteCommentUseCase.execute(useCaseParams, useCaseHeaders))
      .rejects
      .toThrowError('DELETE_COMMENT.NO_PARAMS');
  });

  it('should throw error if no needed property', async () => {
    // Arrange
    const useCaseParams = {
      commentId: 'comment-123',
    };
    const useCaseHeaders = {
      authorization: 'user-123',
    };

    /** creating dependency of use case */
    const mockCommentRepository = new CommnetRepository();
    const mockAuthenticationTokenManager = new AuthenticationTokenManager();

    /** mocking needed function */
    mockCommentRepository.deleteCommentInThread = jest.fn()
      // eslint-disable-next-line max-len
      .mockImplementation(() => Promise.resolve({ owner: useCaseHeaders.authorization, ...useCaseParams }));
    mockAuthenticationTokenManager.decodePayload = jest.fn()
      .mockImplementation(() => Promise.resolve({ username: 'dicoding', id: 'user-123' }));

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      authenticationTokenManager: mockAuthenticationTokenManager,
    });

    // Action & Assert
    await expect(deleteCommentUseCase.execute(useCaseParams, useCaseHeaders))
      .rejects
      .toThrowError('DELETE_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error if no meet spec', async () => {
    // Arrange
    const useCaseParams = {
      commentId: 123,
      threadId: 'thread-123',
    };
    const useCaseHeaders = {
      authorization: 'user-123',
    };

    /** creating dependency of use case */
    const mockCommentRepository = new CommnetRepository();
    const mockAuthenticationTokenManager = new AuthenticationTokenManager();

    /** mocking needed function */
    mockCommentRepository.deleteCommentInThread = jest.fn()
      // eslint-disable-next-line max-len
      .mockImplementation(() => Promise.resolve({ owner: useCaseHeaders.authorization, ...useCaseParams }));
    mockAuthenticationTokenManager.decodePayload = jest.fn()
      .mockImplementation(() => Promise.resolve({ username: 'dicoding', id: 'user-123' }));

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      authenticationTokenManager: mockAuthenticationTokenManager,
    });

    // Action & Assert
    await expect(deleteCommentUseCase.execute(useCaseParams, useCaseHeaders))
      .rejects
      .toThrowError('DELETE_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should orchestrating the delete comment action correctly', async () => {
    // Arrange
    const useCaseParams = {
      threadId: 'thread-123',
      commentId: 'comment-123',
    };
    const useCaseHeaders = {
      authorization: 'user-123',
    };

    /** creating dependency of use case */
    const mockCommentRepository = new CommnetRepository();
    const mockAuthenticationTokenManager = new AuthenticationTokenManager();

    /** mocking needed function */
    mockCommentRepository.deleteCommentInThread = jest.fn()
      // eslint-disable-next-line max-len
      .mockImplementation(() => Promise.resolve({ owner: useCaseHeaders.authorization, ...useCaseParams }));
    mockAuthenticationTokenManager.decodePayload = jest.fn()
      .mockImplementation(() => Promise.resolve({ username: 'dicoding', id: 'user-123' }));

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      authenticationTokenManager: mockAuthenticationTokenManager,
    });

    // Act
    await deleteCommentUseCase.execute(useCaseParams, useCaseHeaders);

    // Assert
    expect(mockCommentRepository.deleteCommentInThread)
      .toHaveBeenCalledWith(useCaseParams, useCaseHeaders);
  });
});
