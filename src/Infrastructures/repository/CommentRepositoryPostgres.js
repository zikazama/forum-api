const InvariantError = require('../../Commons/exceptions/InvariantError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const CommentRepository = require('../../Domains/comments/CommentRepository');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addCommentInThread(addComment) {
    const { threadId, content, owner } = addComment;

    const queryThread = {
      text: 'SELECT * FROM threads WHERE id = $1',
      values: [threadId],
    };

    const resultThread = await this._pool.query(queryThread);
    if (resultThread.rowCount === 0) {
      throw new NotFoundError('thread tidak ditemukan');
    }

    const id = `comment-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4) RETURNING id, "threadId", content, owner',
      values: [id, threadId, content, owner],
    };

    const result = await this._pool.query(query);

    return { ...result.rows[0] };
  }
}

module.exports = CommentRepositoryPostgres;
