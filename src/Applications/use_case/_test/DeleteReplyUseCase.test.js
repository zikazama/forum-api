const DeleteReply = require('../../../Domains/comments/entities/DeleteReply');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AuthenticationTokenManager = require('../../security/AuthenticationTokenManager');
const DeleteReplyUseCase = require('../DeleteReplyUseCase');

describe('DeleteReplyUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the delete reply action correctly', async () => {
    // Arrange
    const useCaseParams = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      replyId: 'reply-123',
    };

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockAuthenticationTokenManager = new AuthenticationTokenManager();

    /** mocking needed function */
    mockCommentRepository.deleteReplyComment = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockAuthenticationTokenManager.verifyTokenFromHeader = jest.fn()
      .mockImplementation(() => Promise.resolve({ username: 'dicoding', id: 'user-123' }));

    /** creating use case instance */
    const deleteReplyUseCase = new DeleteReplyUseCase({
      commentRepository: mockCommentRepository,
      authenticationTokenManager: mockAuthenticationTokenManager,
    });

    // Action
    await deleteReplyUseCase.execute({ authorization: 'jey', ...useCaseParams });

    // Assert
    expect(mockAuthenticationTokenManager.verifyTokenFromHeader).toBeCalledWith('jey');
    expect(mockCommentRepository.deleteReplyComment).toBeCalledWith(new DeleteReply({
      threadId: useCaseParams.threadId,
      commentId: useCaseParams.commentId,
      replyId: useCaseParams.replyId,
      owner: 'user-123',
    }));
  });
});
