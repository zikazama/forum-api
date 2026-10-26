const request = require('supertest');
const pool = require('../../database/postgres/pool');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads/{threadId}/comments endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await ServerTestHelper.cleanAllTables();
  });

  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 201 and persisted comment', async () => {
      // Arrange
      const app = await createServer(container);
      const { authorization, userId } = await ServerTestHelper.login(app);
      const threadId = await ServerTestHelper.addThread(app, authorization);

      // Action
      const response = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set('Authorization', authorization)
        .send({ content: 'sebuah comment' });

      // Assert
      expect(response.status).toEqual(201);
      expect(response.body.status).toEqual('success');
      const { addedComment } = response.body.data;
      expect(addedComment.id).toEqual(expect.any(String));
      expect(addedComment.content).toEqual('sebuah comment');
      expect(addedComment.owner).toEqual(userId);
      const comments = await CommentsTableTestHelper.getDetailComment(addedComment.id);
      expect(comments).toHaveLength(1);
    });

    it('should ignore owner in payload and use the authenticated user', async () => {
      // Arrange
      const app = await createServer(container);
      const { authorization, userId } = await ServerTestHelper.login(app);
      const threadId = await ServerTestHelper.addThread(app, authorization);

      // Action
      const response = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set('Authorization', authorization)
        .send({ content: 'sebuah comment', owner: 'user-lain' });

      // Assert
      expect(response.status).toEqual(201);
      expect(response.body.data.addedComment.owner).toEqual(userId);
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const app = await createServer(container);
      const { authorization } = await ServerTestHelper.login(app);
      const threadId = await ServerTestHelper.addThread(app, authorization);

      // Action
      const response = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set('Authorization', authorization)
        .send({});

      // Assert
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('tidak dapat membuat comment baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const app = await createServer(container);
      const { authorization } = await ServerTestHelper.login(app);
      const threadId = await ServerTestHelper.addThread(app, authorization);

      // Action
      const response = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set('Authorization', authorization)
        .send({ content: 12345 });

      // Assert
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('tidak dapat membuat comment baru karena tipe data tidak sesuai');
    });

    it('should response 400 when content more than 150 character', async () => {
      // Arrange
      const app = await createServer(container);
      const { authorization } = await ServerTestHelper.login(app);
      const threadId = await ServerTestHelper.addThread(app, authorization);

      // Action
      const response = await request(app)
        .post(`/threads/${threadId}/comments`)
        .set('Authorization', authorization)
        .send({ content: 'a'.repeat(151) });

      // Assert
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('tidak dapat membuat comment baru karena karakter komentar melebihi batas limit');
    });

    it('should response 401 when request has no authentication', async () => {
      // Arrange
      const app = await createServer(container);
      const { authorization } = await ServerTestHelper.login(app);
      const threadId = await ServerTestHelper.addThread(app, authorization);

      // Action
      const response = await request(app)
        .post(`/threads/${threadId}/comments`)
        .send({ content: 'sebuah comment' });

      // Assert
      expect(response.status).toEqual(401);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('Missing authentication');
    });

    it('should response 404 when thread not found', async () => {
      // Arrange
      const app = await createServer(container);
      const { authorization } = await ServerTestHelper.login(app);

      // Action
      const response = await request(app)
        .post('/threads/thread-tidak-ada/comments')
        .set('Authorization', authorization)
        .send({ content: 'sebuah comment' });

      // Assert
      expect(response.status).toEqual(404);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('thread tidak ditemukan');
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should response 200 and soft delete the comment', async () => {
      // Arrange
      const app = await createServer(container);
      const { authorization } = await ServerTestHelper.login(app);
      const threadId = await ServerTestHelper.addThread(app, authorization);
      const commentId = await ServerTestHelper.addComment(app, authorization, threadId);

      // Action
      const response = await request(app)
        .delete(`/threads/${threadId}/comments/${commentId}`)
        .set('Authorization', authorization);

      // Assert
      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual('success');
      const comments = await CommentsTableTestHelper.getDetailComment(commentId);
      expect(comments).toHaveLength(1);
      expect(comments[0].is_delete).toEqual('1');
    });

    it('should response 403 when user is not the comment owner', async () => {
      // Arrange
      const app = await createServer(container);
      const dicoding = await ServerTestHelper.login(app, { username: 'dicoding' });
      const johndoe = await ServerTestHelper.login(app, { username: 'johndoe', fullname: 'John Doe' });
      const threadId = await ServerTestHelper.addThread(app, dicoding.authorization);
      const commentId = await ServerTestHelper.addComment(app, dicoding.authorization, threadId);

      // Action
      const response = await request(app)
        .delete(`/threads/${threadId}/comments/${commentId}`)
        .set('Authorization', johndoe.authorization);

      // Assert
      expect(response.status).toEqual(403);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('autorisasi salah');
    });

    it('should response 404 when comment not found', async () => {
      // Arrange
      const app = await createServer(container);
      const { authorization } = await ServerTestHelper.login(app);
      const threadId = await ServerTestHelper.addThread(app, authorization);

      // Action
      const response = await request(app)
        .delete(`/threads/${threadId}/comments/comment-tidak-ada`)
        .set('Authorization', authorization);

      // Assert
      expect(response.status).toEqual(404);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('komentar tidak ditemukan');
    });

    it('should response 404 when thread not found', async () => {
      // Arrange
      const app = await createServer(container);
      const { authorization } = await ServerTestHelper.login(app);

      // Action
      const response = await request(app)
        .delete('/threads/thread-tidak-ada/comments/comment-tidak-ada')
        .set('Authorization', authorization);

      // Assert
      expect(response.status).toEqual(404);
      expect(response.body.status).toEqual('fail');
    });

    it('should response 401 when request has no authentication', async () => {
      // Arrange
      const app = await createServer(container);
      const { authorization } = await ServerTestHelper.login(app);
      const threadId = await ServerTestHelper.addThread(app, authorization);
      const commentId = await ServerTestHelper.addComment(app, authorization, threadId);

      // Action
      const response = await request(app).delete(`/threads/${threadId}/comments/${commentId}`);

      // Assert
      expect(response.status).toEqual(401);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('Missing authentication');
    });
  });

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should response 201 and persisted reply', async () => {
      // Arrange
      const app = await createServer(container);
      const { authorization, userId } = await ServerTestHelper.login(app);
      const threadId = await ServerTestHelper.addThread(app, authorization);
      const commentId = await ServerTestHelper.addComment(app, authorization, threadId);

      // Action
      const response = await request(app)
        .post(`/threads/${threadId}/comments/${commentId}/replies`)
        .set('Authorization', authorization)
        .send({ content: 'sebuah balasan' });

      // Assert
      expect(response.status).toEqual(201);
      expect(response.body.status).toEqual('success');
      const { addedReply } = response.body.data;
      expect(addedReply.id).toEqual(expect.any(String));
      expect(addedReply.content).toEqual('sebuah balasan');
      expect(addedReply.owner).toEqual(userId);
      const replies = await RepliesTableTestHelper.getDetailReply(addedReply.id);
      expect(replies).toHaveLength(1);
    });

    it('should ignore owner in payload and use the authenticated user', async () => {
      // Arrange
      const app = await createServer(container);
      const { authorization, userId } = await ServerTestHelper.login(app);
      const threadId = await ServerTestHelper.addThread(app, authorization);
      const commentId = await ServerTestHelper.addComment(app, authorization, threadId);

      // Action
      const response = await request(app)
        .post(`/threads/${threadId}/comments/${commentId}/replies`)
        .set('Authorization', authorization)
        .send({ content: 'sebuah balasan', owner: 'user-lain' });

      // Assert
      expect(response.status).toEqual(201);
      expect(response.body.data.addedReply.owner).toEqual(userId);
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const app = await createServer(container);
      const { authorization } = await ServerTestHelper.login(app);
      const threadId = await ServerTestHelper.addThread(app, authorization);
      const commentId = await ServerTestHelper.addComment(app, authorization, threadId);

      // Action
      const response = await request(app)
        .post(`/threads/${threadId}/comments/${commentId}/replies`)
        .set('Authorization', authorization)
        .send({});

      // Assert
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('tidak dapat membuat balasan baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const app = await createServer(container);
      const { authorization } = await ServerTestHelper.login(app);
      const threadId = await ServerTestHelper.addThread(app, authorization);
      const commentId = await ServerTestHelper.addComment(app, authorization, threadId);

      // Action
      const response = await request(app)
        .post(`/threads/${threadId}/comments/${commentId}/replies`)
        .set('Authorization', authorization)
        .send({ content: ['bukan string'] });

      // Assert
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('tidak dapat membuat balasan baru karena tipe data tidak sesuai');
    });

    it('should response 401 when request has no authentication', async () => {
      // Arrange
      const app = await createServer(container);
      const { authorization } = await ServerTestHelper.login(app);
      const threadId = await ServerTestHelper.addThread(app, authorization);
      const commentId = await ServerTestHelper.addComment(app, authorization, threadId);

      // Action
      const response = await request(app)
        .post(`/threads/${threadId}/comments/${commentId}/replies`)
        .send({ content: 'sebuah balasan' });

      // Assert
      expect(response.status).toEqual(401);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('Missing authentication');
    });

    it('should response 404 when thread not found', async () => {
      // Arrange
      const app = await createServer(container);
      const { authorization } = await ServerTestHelper.login(app);

      // Action
      const response = await request(app)
        .post('/threads/thread-tidak-ada/comments/comment-tidak-ada/replies')
        .set('Authorization', authorization)
        .send({ content: 'sebuah balasan' });

      // Assert
      expect(response.status).toEqual(404);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('thread tidak ditemukan');
    });

    it('should response 404 when comment not found', async () => {
      // Arrange
      const app = await createServer(container);
      const { authorization } = await ServerTestHelper.login(app);
      const threadId = await ServerTestHelper.addThread(app, authorization);

      // Action
      const response = await request(app)
        .post(`/threads/${threadId}/comments/comment-tidak-ada/replies`)
        .set('Authorization', authorization)
        .send({ content: 'sebuah balasan' });

      // Assert
      expect(response.status).toEqual(404);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('komentar tidak ditemukan');
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    it('should response 200 and soft delete the reply', async () => {
      // Arrange
      const app = await createServer(container);
      const { authorization } = await ServerTestHelper.login(app);
      const threadId = await ServerTestHelper.addThread(app, authorization);
      const commentId = await ServerTestHelper.addComment(app, authorization, threadId);
      const replyId = await ServerTestHelper.addReply(app, authorization, threadId, commentId);

      // Action
      const response = await request(app)
        .delete(`/threads/${threadId}/comments/${commentId}/replies/${replyId}`)
        .set('Authorization', authorization);

      // Assert
      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual('success');
      const replies = await RepliesTableTestHelper.getDetailReply(replyId);
      expect(replies).toHaveLength(1);
      expect(replies[0].is_delete).toEqual('1');
    });

    it('should response 403 when user is not the reply owner', async () => {
      // Arrange
      const app = await createServer(container);
      const dicoding = await ServerTestHelper.login(app, { username: 'dicoding' });
      const johndoe = await ServerTestHelper.login(app, { username: 'johndoe', fullname: 'John Doe' });
      const threadId = await ServerTestHelper.addThread(app, dicoding.authorization);
      const commentId = await ServerTestHelper.addComment(app, dicoding.authorization, threadId);
      const replyId = await ServerTestHelper
        .addReply(app, johndoe.authorization, threadId, commentId);

      // Action
      const response = await request(app)
        .delete(`/threads/${threadId}/comments/${commentId}/replies/${replyId}`)
        .set('Authorization', dicoding.authorization);

      // Assert
      expect(response.status).toEqual(403);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('autorisasi salah');
    });

    it('should response 404 when reply not found', async () => {
      // Arrange
      const app = await createServer(container);
      const { authorization } = await ServerTestHelper.login(app);
      const threadId = await ServerTestHelper.addThread(app, authorization);
      const commentId = await ServerTestHelper.addComment(app, authorization, threadId);

      // Action
      const response = await request(app)
        .delete(`/threads/${threadId}/comments/${commentId}/replies/reply-tidak-ada`)
        .set('Authorization', authorization);

      // Assert
      expect(response.status).toEqual(404);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('balasan tidak ditemukan');
    });

    it('should response 404 when comment or thread not found', async () => {
      // Arrange
      const app = await createServer(container);
      const { authorization } = await ServerTestHelper.login(app);
      const threadId = await ServerTestHelper.addThread(app, authorization);

      // Action
      const commentMissing = await request(app)
        .delete(`/threads/${threadId}/comments/comment-tidak-ada/replies/reply-tidak-ada`)
        .set('Authorization', authorization);
      const threadMissing = await request(app)
        .delete('/threads/thread-tidak-ada/comments/comment-tidak-ada/replies/reply-tidak-ada')
        .set('Authorization', authorization);

      // Assert
      expect(commentMissing.status).toEqual(404);
      expect(commentMissing.body.message).toEqual('komentar tidak ditemukan');
      expect(threadMissing.status).toEqual(404);
      expect(threadMissing.body.message).toEqual('thread tidak ditemukan');
    });

    it('should response 401 when request has no authentication', async () => {
      // Arrange
      const app = await createServer(container);
      const { authorization } = await ServerTestHelper.login(app);
      const threadId = await ServerTestHelper.addThread(app, authorization);
      const commentId = await ServerTestHelper.addComment(app, authorization, threadId);
      const replyId = await ServerTestHelper.addReply(app, authorization, threadId, commentId);

      // Action
      const response = await request(app)
        .delete(`/threads/${threadId}/comments/${commentId}/replies/${replyId}`);

      // Assert
      expect(response.status).toEqual(401);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('Missing authentication');
    });
  });
});
