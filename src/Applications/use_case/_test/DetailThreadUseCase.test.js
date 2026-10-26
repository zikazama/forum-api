const DetailThread = require('../../../Domains/threads/entities/DetailThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const DetailThreadUseCase = require('../DetailThreadUseCase');

describe('DetailThreadUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should not show deleted comment', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
    };

    const detailThread = {
      id: 'thread-123',
      title: 'judul',
      body: 'isi',
      date: '2021-09-22',
      username: 'user-123',
      comments: [
        {
          id: 'comment-123',
          username: 'user-123',
          content: 'bagus',
          is_delete: null,
        },
        {
          id: 'comment-122',
          username: 'user-122',
          content: 'bagus',
          is_delete: '1',
        },
      ],
    };

    const expectedThread = {
      id: 'thread-123',
      title: 'judul',
      body: 'isi',
      date: '2021-09-22',
      username: 'user-123',
    };

    const expectedComment = [
      {
        id: 'comment-123',
        username: 'user-123',
        content: 'bagus',
      },
      {
        id: 'comment-122',
        username: 'user-122',
        content: '**komentar telah dihapus**',
      },
    ];

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockThreadRepository.getThread = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedThread));
    mockCommentRepository.getCommentInThread = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedComment));
    mockCommentRepository.getRepliesInThread = jest.fn()
      .mockImplementation(() => Promise.resolve([]));

    /** creating use case instance */
    const getDetailThreadUseCase = new DetailThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    await getDetailThreadUseCase.execute(useCasePayload);
    const result = await getDetailThreadUseCase.filterDeletedComment(detailThread);

    // Assert
    expect(result).toStrictEqual(detailThread);
    expect(mockThreadRepository.getThread).toBeCalledWith(new DetailThread({
      threadId: useCasePayload.threadId,
    }));
    expect(mockCommentRepository.getCommentInThread).toBeCalledWith(new DetailThread({
      threadId: useCasePayload.threadId,
    }));
  });

  it('should orchestrating the add thread action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
    };

    const expectedThread = {
      id: 'thread-123',
      title: 'judul',
      body: 'isi',
      date: '2021-09-22',
      username: 'user-123',
    };

    const expectedComment = [
      {
        id: 'comment-123',
        username: 'user-123',
        content: 'bagus',
        is_delete: null,
      },
      {
        id: 'comment-122',
        username: 'user-122',
        content: 'bagus',
        is_delete: 1,
      },
    ];

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockThreadRepository.getThread = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedThread));
    mockCommentRepository.getCommentInThread = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedComment));
    mockCommentRepository.getRepliesInThread = jest.fn()
      .mockImplementation(() => Promise.resolve([]));

    /** creating use case instance */
    const getDetailThreadUseCase = new DetailThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const detailThread = await getDetailThreadUseCase.execute(useCasePayload);

    // Assert
    expect(detailThread).toStrictEqual(expectedThread);
    expect(mockThreadRepository.getThread).toBeCalledWith(new DetailThread({
      threadId: useCasePayload.threadId,
    }));
    expect(mockCommentRepository.getCommentInThread).toBeCalledWith(new DetailThread({
      threadId: useCasePayload.threadId,
    }));
  });

  it('should attach replies to each comment and hide deleted replies', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
    };

    const expectedThread = {
      id: 'thread-123',
      title: 'judul',
      body: 'isi',
      date: '2021-09-22',
      username: 'user-123',
    };

    const expectedComments = [
      {
        id: 'comment-123',
        username: 'user-123',
        date: '2021-09-22T07:00:00.000Z',
        content: 'bagus',
        is_delete: null,
      },
    ];

    const expectedReplies = [
      {
        id: 'reply-123',
        commentId: 'comment-123',
        username: 'user-122',
        date: '2021-09-22T07:01:00.000Z',
        content: 'sebuah balasan',
        is_delete: null,
      },
      {
        id: 'reply-124',
        commentId: 'comment-123',
        username: 'user-123',
        date: '2021-09-22T07:02:00.000Z',
        content: 'balasan yang dihapus',
        is_delete: '1',
      },
      {
        id: 'reply-125',
        commentId: 'comment-999',
        username: 'user-123',
        date: '2021-09-22T07:03:00.000Z',
        content: 'balasan milik komentar lain',
        is_delete: null,
      },
    ];

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockThreadRepository.getThread = jest.fn()
      .mockImplementation(() => Promise.resolve({ ...expectedThread }));
    mockCommentRepository.getCommentInThread = jest.fn()
      .mockImplementation(() => Promise.resolve([...expectedComments]));
    mockCommentRepository.getRepliesInThread = jest.fn()
      .mockImplementation(() => Promise.resolve([...expectedReplies]));

    /** creating use case instance */
    const getDetailThreadUseCase = new DetailThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const detailThread = await getDetailThreadUseCase.execute(useCasePayload);

    // Assert
    expect(detailThread).toStrictEqual({
      ...expectedThread,
      comments: [
        {
          id: 'comment-123',
          username: 'user-123',
          date: '2021-09-22T07:00:00.000Z',
          content: 'bagus',
          replies: [
            {
              id: 'reply-123',
              content: 'sebuah balasan',
              date: '2021-09-22T07:01:00.000Z',
              username: 'user-122',
            },
            {
              id: 'reply-124',
              content: '**balasan telah dihapus**',
              date: '2021-09-22T07:02:00.000Z',
              username: 'user-123',
            },
          ],
        },
      ],
    });
    expect(mockCommentRepository.getRepliesInThread).toBeCalledWith(new DetailThread({
      threadId: useCasePayload.threadId,
    }));
  });
});
