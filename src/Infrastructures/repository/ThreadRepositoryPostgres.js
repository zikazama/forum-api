const InvariantError = require('../../Commons/exceptions/InvariantError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addThread(addThread) {
    const { title, body, owner } = addThread;
    const id = `thread-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO threads VALUES($1, $2, $3, $4) RETURNING id, title, body, owner',
      values: [id, title, body, owner],
    };

    const result = await this._pool.query(query);

    return { ...result.rows[0] };
  }

  async getDetailThread(getThread) {
    const { threadId } = getThread;
    const query = {
      text: 'SELECT threads.id, "title", "body", "createdAt" AS date, "username" FROM threads JOIN users ON users.id = threads.owner WHERE threads.id = $1',
      values: [threadId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('thread tidak ditemukan');
    }

    const queryComment = {
      text: 'SELECT comments.id, "username", "createdAt" AS date, CASE is_delete WHEN $2 THEN $3 ELSE content END as content FROM comments JOIN users ON users.id = comments.owner WHERE comments."threadId" = $1',
      values: [threadId, '1', '**komentar telah dihapus**'],
    };

    const resultComment = await this._pool.query(queryComment);

    return { ...result.rows[0], comments: resultComment.rows };
  }
}

module.exports = ThreadRepositoryPostgres;
