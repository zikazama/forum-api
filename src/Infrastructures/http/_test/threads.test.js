const request = require('supertest');
const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await ServerTestHelper.cleanAllTables();
  });

  describe('when POST /threads', () => {
    it('should response 201 and persisted thread', async () => {
      // Arrange
      const app = await createServer(container);
      const { authorization, userId } = await ServerTestHelper.login(app);

      // Action
      const response = await request(app)
        .post('/threads')
        .set('Authorization', authorization)
        .send({ title: 'sebuah thread', body: 'sebuah body thread' });

      // Assert
      expect(response.status).toEqual(201);
      expect(response.body.status).toEqual('success');
      const { addedThread } = response.body.data;
      expect(addedThread.id).toEqual(expect.any(String));
      expect(addedThread.title).toEqual('sebuah thread');
      expect(addedThread.owner).toEqual(userId);
      const threads = await ThreadsTableTestHelper.getDetailThread(addedThread.id);
      expect(threads).toHaveLength(1);
    });

    it('should ignore owner in payload and use the authenticated user', async () => {
      // Arrange
      const app = await createServer(container);
      const { authorization, userId } = await ServerTestHelper.login(app);

      // Action
      const response = await request(app)
        .post('/threads')
        .set('Authorization', authorization)
        .send({ title: 'sebuah thread', body: 'sebuah body thread', owner: 'user-lain' });

      // Assert
      expect(response.status).toEqual(201);
      expect(response.body.data.addedThread.owner).toEqual(userId);
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const app = await createServer(container);
      const { authorization } = await ServerTestHelper.login(app);

      // Action
      const response = await request(app)
        .post('/threads')
        .set('Authorization', authorization)
        .send({ title: 'sebuah thread' });

      // Assert
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request has no payload at all', async () => {
      // Arrange
      const app = await createServer(container);
      const { authorization } = await ServerTestHelper.login(app);

      // Action
      const response = await request(app).post('/threads').set('Authorization', authorization);

      // Assert
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const app = await createServer(container);
      const { authorization } = await ServerTestHelper.login(app);

      // Action
      const response = await request(app)
        .post('/threads')
        .set('Authorization', authorization)
        .send({ title: 123, body: 'sebuah body thread' });

      // Assert
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('tidak dapat membuat thread baru karena tipe data tidak sesuai');
    });

    it('should response 400 when title more than 50 character', async () => {
      // Arrange
      const app = await createServer(container);
      const { authorization } = await ServerTestHelper.login(app);

      // Action
      const response = await request(app)
        .post('/threads')
        .set('Authorization', authorization)
        .send({ title: 'a'.repeat(51), body: 'sebuah body thread' });

      // Assert
      expect(response.status).toEqual(400);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('tidak dapat membuat thread baru karena karakter judul melebihi batas limit');
    });

    it('should response 401 when request has no authentication', async () => {
      // Arrange
      const app = await createServer(container);

      // Action
      const response = await request(app)
        .post('/threads')
        .send({ title: 'sebuah thread', body: 'sebuah body thread' });

      // Assert
      expect(response.status).toEqual(401);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('Missing authentication');
    });

    it('should response 401 when access token is invalid', async () => {
      // Arrange
      const app = await createServer(container);

      // Action
      const response = await request(app)
        .post('/threads')
        .set('Authorization', 'Bearer token-palsu')
        .send({ title: 'sebuah thread', body: 'sebuah body thread' });

      // Assert
      expect(response.status).toEqual(401);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('access token tidak valid');
    });
  });

  describe('when GET /threads/{threadId}', () => {
    it('should response 200 and return thread detail with comments and replies', async () => {
      // Arrange
      const app = await createServer(container);
      const dicoding = await ServerTestHelper.login(app, { username: 'dicoding' });
      const johndoe = await ServerTestHelper.login(app, { username: 'johndoe', fullname: 'John Doe' });
      const threadId = await ServerTestHelper.addThread(app, dicoding.authorization);
      const commentA = await ServerTestHelper
        .addComment(app, johndoe.authorization, threadId, 'sebuah comment');
      const commentB = await ServerTestHelper
        .addComment(app, dicoding.authorization, threadId, 'comment yang dihapus');
      await request(app)
        .delete(`/threads/${threadId}/comments/${commentB}`)
        .set('Authorization', dicoding.authorization);
      const reply1 = await ServerTestHelper
        .addReply(app, dicoding.authorization, threadId, commentA, 'sebuah balasan');
      const reply2 = await ServerTestHelper
        .addReply(app, johndoe.authorization, threadId, commentA, 'balasan yang dihapus');
      await request(app)
        .delete(`/threads/${threadId}/comments/${commentA}/replies/${reply2}`)
        .set('Authorization', johndoe.authorization);

      // Action
      const response = await request(app).get(`/threads/${threadId}`);

      // Assert
      expect(response.status).toEqual(200);
      expect(response.body.status).toEqual('success');
      const { thread } = response.body.data;
      expect(thread).toMatchObject({
        id: threadId,
        title: 'sebuah thread',
        body: 'sebuah body thread',
        username: 'dicoding',
      });
      expect(thread.date).toEqual(expect.any(String));
      expect(thread.comments).toHaveLength(2);
      expect(thread.comments[0]).toMatchObject({
        id: commentA, username: 'johndoe', content: 'sebuah comment',
      });
      expect(thread.comments[0].date).toEqual(expect.any(String));
      expect(thread.comments[0].replies).toEqual([
        {
          id: reply1, content: 'sebuah balasan', date: expect.any(String), username: 'dicoding',
        },
        {
          id: reply2, content: '**balasan telah dihapus**', date: expect.any(String), username: 'johndoe',
        },
      ]);
      expect(thread.comments[1]).toMatchObject({
        id: commentB, username: 'dicoding', content: '**komentar telah dihapus**', replies: [],
      });
      expect(thread.comments[1]).not.toHaveProperty('is_delete');
    });

    it('should response 200 with empty comments when thread has no comment', async () => {
      // Arrange
      const app = await createServer(container);
      const { authorization } = await ServerTestHelper.login(app);
      const threadId = await ServerTestHelper.addThread(app, authorization);

      // Action
      const response = await request(app).get(`/threads/${threadId}`);

      // Assert
      expect(response.status).toEqual(200);
      expect(response.body.data.thread.comments).toEqual([]);
    });

    it('should response 404 when thread not found', async () => {
      // Arrange
      const app = await createServer(container);

      // Action
      const response = await request(app).get('/threads/thread-tidak-ada');

      // Assert
      expect(response.status).toEqual(404);
      expect(response.body.status).toEqual('fail');
      expect(response.body.message).toEqual('thread tidak ditemukan');
    });
  });
});
