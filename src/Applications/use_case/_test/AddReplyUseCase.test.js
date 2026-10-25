const AddReply = require('../../../Domains/comments/entities/AddReply');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AuthenticationTokenManager = require('../../security/AuthenticationTokenManager');
const AddReplyUseCase = require('../AddReplyUseCase');

describe('AddReplyUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the add reply action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'sebuah balasan',
    };

    const useCaseHeaders = {
      authorization: 'jey',
    };

    const useCaseParams = {
      threadId: 'thread-123',
      commentId: 'comment-123',
    };

    const expectedAddedReply = {
      id: 'reply-123',
      content: useCasePayload.content,
      owner: 'user-123',
    };

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockAuthenticationTokenManager = new AuthenticationTokenManager();

    /** mocking needed function */
    mockCommentRepository.addReplyComment = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedAddedReply));
    mockAuthenticationTokenManager.verifyTokenFromHeader = jest.fn()
      .mockImplementation(() => Promise.resolve({ username: 'dicoding', id: 'user-123' }));

    /** creating use case instance */
    const addReplyUseCase = new AddReplyUseCase({
      commentRepository: mockCommentRepository,
      authenticationTokenManager: mockAuthenticationTokenManager,
    });

    // Action
    // eslint-disable-next-line max-len
    const addedReply = await addReplyUseCase.execute(useCasePayload, useCaseHeaders.authorization, useCaseParams);

    // Assert
    expect(addedReply).toStrictEqual(expectedAddedReply);
    expect(mockAuthenticationTokenManager.verifyTokenFromHeader).toBeCalledWith('jey');
    expect(mockCommentRepository.addReplyComment).toBeCalledWith(new AddReply({
      threadId: useCaseParams.threadId,
      commentId: useCaseParams.commentId,
      content: useCasePayload.content,
      owner: 'user-123',
    }));
  });

  it('should use owner from token instead of request body', async () => {
    // Arrange
    const useCasePayload = {
      content: 'sebuah balasan',
      owner: 'user-999',
    };

    const useCaseParams = {
      threadId: 'thread-123',
      commentId: 'comment-123',
    };

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockAuthenticationTokenManager = new AuthenticationTokenManager();

    /** mocking needed function */
    mockCommentRepository.addReplyComment = jest.fn()
      .mockImplementation(() => Promise.resolve({}));
    mockAuthenticationTokenManager.verifyTokenFromHeader = jest.fn()
      .mockImplementation(() => Promise.resolve({ username: 'dicoding', id: 'user-123' }));

    /** creating use case instance */
    const addReplyUseCase = new AddReplyUseCase({
      commentRepository: mockCommentRepository,
      authenticationTokenManager: mockAuthenticationTokenManager,
    });

    // Action
    await addReplyUseCase.execute(useCasePayload, 'jey', useCaseParams);

    // Assert
    expect(mockCommentRepository.addReplyComment).toBeCalledWith(new AddReply({
      threadId: useCaseParams.threadId,
      commentId: useCaseParams.commentId,
      content: useCasePayload.content,
      owner: 'user-123',
    }));
  });
});
