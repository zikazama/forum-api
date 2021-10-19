const DeleteComment = require('../../../Domains/comments/entities/DeleteComment');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AuthenticationTokenManager = require('../../security/AuthenticationTokenManager');
const DeleteCommentUseCase = require('../DeleteCommentUseCase');

describe('DeleteCommentUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */

  it('should throw error if authorization undefined', async () => {
    // Arrange
    const useCaseHeaders = {
    };

    const useCaseParams = {
      threadId: 'thread-123',
      commentId: 'comment-123',
    };

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockAuthenticationTokenManager = new AuthenticationTokenManager();

    /** mocking needed function */
    mockCommentRepository.deleteCommentInThread = jest.fn()
      // eslint-disable-next-line max-len
      .mockImplementation(() => Promise.resolve());
    mockAuthenticationTokenManager.decodePayload = jest.fn()
      .mockImplementation(() => Promise.resolve({ username: 'dicoding', id: 'user-123' }));

    /** creating use case instance */
    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      authenticationTokenManager: mockAuthenticationTokenManager,
    });

    // Assert
    await expect(deleteCommentUseCase
      .execute({
        userId: useCaseHeaders.authorization,
        threadId: useCaseParams.threadId,
        commentId: useCaseParams.commentId,
      }))
      .rejects
      .toThrowError('DELETE_COMMENT.NO_AUTHORIZATION');
  });

  it('should throw error if threadId undefined', async () => {
    // Arrange
    const useCaseHeaders = {
      authorization: 'user-123',
    };

    const useCaseParams = {
      commentId: 'comment-123',
    };

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockAuthenticationTokenManager = new AuthenticationTokenManager();

    /** mocking needed function */
    mockCommentRepository.deleteCommentInThread = jest.fn()
      // eslint-disable-next-line max-len
      .mockImplementation(() => Promise.resolve());
    mockAuthenticationTokenManager.decodePayload = jest.fn()
      .mockImplementation(() => Promise.resolve({ username: 'dicoding', id: 'user-123' }));

    /** creating use case instance */
    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      authenticationTokenManager: mockAuthenticationTokenManager,
    });

    // Assert
    await expect(deleteCommentUseCase
      .execute({
        userId: useCaseHeaders.authorization,
        threadId: useCaseParams.threadId,
        commentId: useCaseParams.commentId,
      }))
      .rejects
      .toThrowError('DELETE_COMMENT.NO_PARAMS');
  });

  it('should orchestrating the delete comment action correctly', async () => {
    // Arrange
    const useCaseHeaders = {
      authorization: 'user-123',
    };

    const useCaseParams = {
      threadId: 'thread-123',
      commentId: 'comment-123',
    };

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockAuthenticationTokenManager = new AuthenticationTokenManager();

    /** mocking needed function */
    mockCommentRepository.deleteCommentInThread = jest.fn()
      // eslint-disable-next-line max-len
      .mockImplementation(() => Promise.resolve());
    mockAuthenticationTokenManager.decodePayload = jest.fn()
      .mockImplementation(() => Promise.resolve({ username: 'dicoding', id: 'user-123' }));

    /** creating use case instance */
    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      authenticationTokenManager: mockAuthenticationTokenManager,
    });

    // Action
    // eslint-disable-next-line max-len
    await deleteCommentUseCase.execute(
      {
        userId: useCaseHeaders.authorization,
        threadId: useCaseParams.threadId,
        commentId: useCaseParams.commentId,
      },
    );

    // Assert
    expect(mockCommentRepository.deleteCommentInThread).toBeCalledWith(new DeleteComment({
      threadId: useCaseParams.threadId,
      commentId: useCaseParams.commentId,
      owner: useCaseHeaders.authorization,
    }));
  });
});
