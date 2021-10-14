const InvariantError = require('../../Commons/exceptions/InvariantError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const CommentRepository = require('../../Domains/comments/CommentRepository');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async verifyThreadAvailability(threadId) {
    const queryThread = {
      text: 'SELECT * FROM threads WHERE id = $1',
      values: [threadId],
    };

    const resultThread = await this._pool.query(queryThread);
    if (resultThread.rowCount === 0) {
      throw new NotFoundError('thread tidak ditemukan');
    }
  }

  async verifyCommentAvailability(threadId, commentId, owner) {
    const checkQuery = {
      text: 'SELECT * FROM comments WHERE "threadId" = $1 AND id = $2',
      values: [threadId, commentId],
    };

    const resultCheck = await this._pool.query(checkQuery);

    if (resultCheck.rowCount === 0) {
      throw new NotFoundError('komentar tidak ditemukan');
    }

    if (resultCheck.rows[0].owner !== owner) {
      throw new AuthorizationError('autorisasi salah');
    }
  }

  async addCommentInThread(addComment) {
    const { threadId, content, owner } = addComment;

    await this.verifyThreadAvailability(threadId);

    const id = `comment-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4) RETURNING id, "threadId", content, owner',
      values: [id, threadId, content, owner],
    };

    const result = await this._pool.query(query);

    return { ...result.rows[0] };
  }

  async deleteCommentInThread(deleteComment) {
    const { threadId, commentId, owner } = deleteComment;

    await this.verifyCommentAvailability(threadId, commentId, owner);

    const query = {
      text: 'UPDATE comments SET is_delete = $4 WHERE "threadId" = $1 AND id = $2 AND owner = $3',
      values: [threadId, commentId, owner, '1'],
    };

    await this._pool.query(query);
  }
}

module.exports = CommentRepositoryPostgres;
