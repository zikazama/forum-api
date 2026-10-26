/* istanbul ignore file */
const request = require('supertest');
const Jwt = require('jsonwebtoken');
const UsersTableTestHelper = require('./UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('./AuthenticationsTableTestHelper');
const ThreadsTableTestHelper = require('./ThreadsTableTestHelper');
const CommentsTableTestHelper = require('./CommentsTableTestHelper');
const RepliesTableTestHelper = require('./RepliesTableTestHelper');

const ServerTestHelper = {
  // Mendaftarkan pengguna lalu login. Mengembalikan header Authorization dan id pengguna.
  async login(app, {
    username = 'dicoding', password = 'secret', fullname = 'Dicoding Indonesia',
  } = {}) {
    await request(app).post('/users').send({ username, password, fullname });
    const response = await request(app).post('/authentications').send({ username, password });
    const { accessToken } = response.body.data;
    const { id: userId } = Jwt.decode(accessToken);

    return { authorization: `Bearer ${accessToken}`, userId };
  },

  async addThread(app, authorization) {
    const response = await request(app)
      .post('/threads')
      .set('Authorization', authorization)
      .send({ title: 'sebuah thread', body: 'sebuah body thread' });

    return response.body.data.addedThread.id;
  },

  async addComment(app, authorization, threadId, content = 'sebuah comment') {
    const response = await request(app)
      .post(`/threads/${threadId}/comments`)
      .set('Authorization', authorization)
      .send({ content });

    return response.body.data.addedComment.id;
  },

  async addReply(app, authorization, threadId, commentId, content = 'sebuah balasan') {
    const response = await request(app)
      .post(`/threads/${threadId}/comments/${commentId}/replies`)
      .set('Authorization', authorization)
      .send({ content });

    return response.body.data.addedReply.id;
  },

  // Urutan penghapusan mengikuti relasi antar tabel.
  async cleanAllTables() {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  },
};

module.exports = ServerTestHelper;
