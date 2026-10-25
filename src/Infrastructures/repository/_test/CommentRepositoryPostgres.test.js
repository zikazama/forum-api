const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddReply = require('../../../Domains/comments/entities/AddReply');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const AddUser = require('../../../Domains/users/entities/RegisterUser');
const RegisterUser = require('../../../Domains/users/entities/RegisterUser');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const UserRepositoryPostgres = require('../UserRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const InvariantError = require('../../../Commons/exceptions/InvariantError');

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('Available thread and comment function', () => {
    it('should not throw NotFoundError when comment available', async () => {
      // Arrange
      const registerUser = new RegisterUser({
        username: 'dicoding',
        password: 'secret_password',
        fullname: 'Dicoding Indonesia',
      });

      const addThread = new AddThread({
        title: 'judul',
        body: 'isi',
        owner: 'user-123',
      });

      const addComment = new AddComment({
        threadId: 'thread-123',
        content: 'isi',
        owner: 'user-123',
      });

      const fakeIdGenerator = () => '123'; // stub!
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, fakeIdGenerator);
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await userRepositoryPostgres.addUser(registerUser);
      await threadRepositoryPostgres.addThread(addThread);
      await commentRepositoryPostgres.addCommentInThread(addComment);

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentAvailability('thread-123', 'comment-123', 'user-123')).resolves.not.toThrowError(NotFoundError);
    });

    it('should throw NotFoundError when comment not available', async () => {
      // Arrange

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentAvailability('thread-123', 'comment-123', 'user-123')).rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when thread available', async () => {
      // Arrange
      const registerUser = new RegisterUser({
        username: 'dicoding',
        password: 'secret_password',
        fullname: 'Dicoding Indonesia',
      });

      const addThread = new AddThread({
        title: 'judul',
        body: 'isi',
        owner: 'user-123',
      });

      const fakeIdGenerator = () => '123'; // stub!
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, fakeIdGenerator);
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      await userRepositoryPostgres.addUser(registerUser);
      await threadRepositoryPostgres.addThread(addThread);

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyThreadAvailability('thread-123')).resolves.not.toThrowError(NotFoundError);
    });

    it('should throw NotFoundError when thread not available', async () => {
      // Arrange

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyThreadAvailability('thread-123')).rejects.toThrowError(NotFoundError);
    });

    it('should throw AuthorizationError when user have no authorization', async () => {
      const registerUser = new RegisterUser({
        username: 'dicoding',
        password: 'secret_password',
        fullname: 'Dicoding Indonesia',
      });

      const addThread = new AddThread({
        title: 'judul',
        body: 'isi',
        owner: 'user-123',
      });

      const addComment = new AddComment({
        threadId: 'thread-123',
        content: 'isi',
        owner: 'user-123',
      });

      const fakeIdGenerator = () => '123'; // stub!
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, fakeIdGenerator);
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action & Assert
      await userRepositoryPostgres.addUser(registerUser);
      await threadRepositoryPostgres.addThread(addThread);
      await commentRepositoryPostgres.addCommentInThread(addComment);
      await expect(commentRepositoryPostgres.verifyCommentAvailability('thread-123', 'comment-123', 'user-234')).rejects.toThrowError(AuthorizationError);
    });

    it('should get comment', async () => {
      // Arrange
      const registerUser = new RegisterUser({
        username: 'dicoding',
        password: 'secret_password',
        fullname: 'Dicoding Indonesia',
      });

      const addThread = new AddThread({
        title: 'judul',
        body: 'isi',
        owner: 'user-123',
      });

      const addComment = new AddComment({
        threadId: 'thread-123',
        content: 'isi',
        owner: 'user-123',
      });

      const fakeIdGenerator = () => '123'; // stub!
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, fakeIdGenerator);
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await userRepositoryPostgres.addUser(registerUser);
      await threadRepositoryPostgres.addThread(addThread);
      await commentRepositoryPostgres.addCommentInThread(addComment);

      // Action & Assert
      await expect(commentRepositoryPostgres.getCommentInThread({ threadId: 'thread-123' })).resolves.not.toThrowError(NotFoundError);
      expect(await commentRepositoryPostgres.getCommentInThread({ threadId: 'thread-123' })).toHaveLength(1);
    });
  });

  describe('addComment function', () => {
    it('should persist add thread and return added comment correctly', async () => {
      // Arrange
      const registerUser = new RegisterUser({
        username: 'dicoding',
        password: 'secret_password',
        fullname: 'Dicoding Indonesia',
      });

      const addThread = new AddThread({
        title: 'judul',
        body: 'isi',
        owner: 'user-123',
      });

      const addComment = new AddComment({
        threadId: 'thread-123',
        content: 'isi',
        owner: 'user-123',
      });

      const fakeIdGenerator = () => '123'; // stub!
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, fakeIdGenerator);
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await userRepositoryPostgres.addUser(registerUser);
      await threadRepositoryPostgres.addThread(addThread);
      const resultAddComment = await commentRepositoryPostgres.addCommentInThread(addComment);

      // Assert
      const comments = await CommentsTableTestHelper.getDetailComment('comment-123');
      expect(resultAddComment).toStrictEqual(
        {
          content: 'isi', id: 'comment-123', owner: 'user-123', threadId: 'thread-123',
        },
      );
      expect(comments).toHaveLength(1);
    });
  });

  describe('deleteComment function', () => {
    it('should persist add thread and return added comment correctly', async () => {
      // Arrange
      const registerUser = new RegisterUser({
        username: 'dicoding',
        password: 'secret_password',
        fullname: 'Dicoding Indonesia',
      });

      const addThread = new AddThread({
        title: 'judul',
        body: 'isi',
        owner: 'user-123',
      });

      const addComment = new AddComment({
        threadId: 'thread-123',
        content: 'isi',
        owner: 'user-123',
      });

      const fakeIdGenerator = () => '123'; // stub!
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, fakeIdGenerator);
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await userRepositoryPostgres.addUser(registerUser);
      await threadRepositoryPostgres.addThread(addThread);
      await commentRepositoryPostgres.addCommentInThread(addComment);
      await commentRepositoryPostgres
        .deleteCommentInThread({ threadId: 'thread-123', commentId: 'comment-123', owner: 'user-123' });

      // Assert
      const comments = await CommentsTableTestHelper.getDetailComment('comment-123');
      expect(comments[0].is_delete).toContain('1');
    });
  });

  describe('replies functions', () => {
    const seedThreadAndComment = async () => {
      const registerUser = new RegisterUser({
        username: 'dicoding',
        password: 'secret_password',
        fullname: 'Dicoding Indonesia',
      });
      const addThread = new AddThread({
        title: 'judul',
        body: 'isi',
        owner: 'user-123',
      });
      const addComment = new AddComment({
        threadId: 'thread-123',
        content: 'isi',
        owner: 'user-123',
      });

      const fakeIdGenerator = () => '123'; // stub!
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, fakeIdGenerator);
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      await userRepositoryPostgres.addUser(registerUser);
      await threadRepositoryPostgres.addThread(addThread);
      await commentRepositoryPostgres.addCommentInThread(addComment);

      return commentRepositoryPostgres;
    };

    it('should persist add reply and return added reply correctly', async () => {
      // Arrange
      const commentRepositoryPostgres = await seedThreadAndComment();
      const addReply = new AddReply({
        threadId: 'thread-123',
        commentId: 'comment-123',
        content: 'sebuah balasan',
        owner: 'user-123',
      });

      // Action
      const addedReply = await commentRepositoryPostgres.addReplyComment(addReply);

      // Assert
      expect(addedReply).toStrictEqual({
        id: 'reply-123',
        content: 'sebuah balasan',
        owner: 'user-123',
      });
      const replies = await RepliesTableTestHelper.getDetailReply('reply-123');
      expect(replies).toHaveLength(1);
    });

    it('should throw NotFoundError when comment for the reply not available', async () => {
      // Arrange
      const registerUser = new RegisterUser({
        username: 'dicoding',
        password: 'secret_password',
        fullname: 'Dicoding Indonesia',
      });
      const addThread = new AddThread({
        title: 'judul',
        body: 'isi',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, fakeIdGenerator);
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);
      await userRepositoryPostgres.addUser(registerUser);
      await threadRepositoryPostgres.addThread(addThread);

      const addReply = new AddReply({
        threadId: 'thread-123',
        commentId: 'comment-999',
        content: 'sebuah balasan',
        owner: 'user-123',
      });

      // Action & Assert
      await expect(commentRepositoryPostgres.addReplyComment(addReply))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should soft delete reply when the owner deletes it', async () => {
      // Arrange
      const commentRepositoryPostgres = await seedThreadAndComment();
      await RepliesTableTestHelper.addReply({ id: 'reply-123', commentId: 'comment-123', owner: 'user-123' });

      // Action
      await commentRepositoryPostgres.deleteReplyComment({
        threadId: 'thread-123',
        commentId: 'comment-123',
        replyId: 'reply-123',
        owner: 'user-123',
      });

      // Assert
      const replies = await RepliesTableTestHelper.getDetailReply('reply-123');
      expect(replies).toHaveLength(1);
      expect(replies[0].is_delete).toContain('1');
    });

    it('should throw AuthorizationError when user is not the reply owner', async () => {
      // Arrange
      const commentRepositoryPostgres = await seedThreadAndComment();
      await RepliesTableTestHelper.addReply({ id: 'reply-123', commentId: 'comment-123', owner: 'user-123' });

      // Action & Assert
      await expect(commentRepositoryPostgres.deleteReplyComment({
        threadId: 'thread-123',
        commentId: 'comment-123',
        replyId: 'reply-123',
        owner: 'user-234',
      })).rejects.toThrowError(AuthorizationError);
    });

    it('should throw NotFoundError when reply not available', async () => {
      // Arrange
      const commentRepositoryPostgres = await seedThreadAndComment();

      // Action & Assert
      await expect(commentRepositoryPostgres.deleteReplyComment({
        threadId: 'thread-123',
        commentId: 'comment-123',
        replyId: 'reply-999',
        owner: 'user-123',
      })).rejects.toThrowError(NotFoundError);
    });

    it('should return replies in thread with username, date, and deletion flag', async () => {
      // Arrange
      const commentRepositoryPostgres = await seedThreadAndComment();
      await RepliesTableTestHelper.addReply({ id: 'reply-123', commentId: 'comment-123', content: 'balasan pertama' });
      await RepliesTableTestHelper.addReply({ id: 'reply-124', commentId: 'comment-123', content: 'balasan kedua' });

      // Action
      const replies = await commentRepositoryPostgres.getRepliesInThread({ threadId: 'thread-123' });

      // Assert
      expect(replies).toHaveLength(2);
      expect(replies[0]).toStrictEqual({
        id: 'reply-123',
        commentId: 'comment-123',
        username: 'dicoding',
        date: expect.any(Date),
        content: 'balasan pertama',
        is_delete: null,
      });
      expect(replies[1].id).toEqual('reply-124');
    });
  });
});
