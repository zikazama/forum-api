const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist add thread and return added comment correctly', async () => {
      // Arrange
      const addComment = new AddComment({
        threadId: 'thread-123',
        content: 'isi',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Assert
      expect(commentRepositoryPostgres.addCommentInThread(addComment))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should return added comment correctly', async () => {
      // Arrange
      const addComment = new AddComment({
        threadId: 'thread-123',
        content: 'isi',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Assert
      expect(commentRepositoryPostgres.addCommentInThread(addComment))
        .rejects
        .toThrowError(NotFoundError);
    });
  });
});
