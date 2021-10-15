const DetailThread = require('../../../Domains/threads/entities/DetailThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
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
      comments: [
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
      ],
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.getDetailThread = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedThread));

    /** creating use case instance */
    const getDetailThreadUseCase = new DetailThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    const result = await getDetailThreadUseCase.filterDeletedComment(detailThread);

    // Assert
    expect(result).toStrictEqual(expectedThread);
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
          is_delete: 1,
        },
      ],
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.getDetailThread = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedThread));

    /** creating use case instance */
    const getDetailThreadUseCase = new DetailThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    const detailThread = await getDetailThreadUseCase.execute(useCasePayload);

    // Assert
    expect(detailThread).toStrictEqual(expectedThread);
    expect(mockThreadRepository.getDetailThread).toBeCalledWith(new DetailThread({
      threadId: useCasePayload.threadId,
    }));
  });
});
