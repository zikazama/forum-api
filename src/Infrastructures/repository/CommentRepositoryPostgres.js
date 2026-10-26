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

  async getCommentInThread(getComment) {
    const { threadId } = getComment;
    await this.verifyThreadAvailability(threadId);

    const queryComment = {
      text: 'SELECT comments.id, "username", "createdAt" AS date, content, is_delete FROM comments JOIN users ON users.id = comments.owner WHERE comments."threadId" = $1 ORDER BY comments."createdAt" ASC',
      values: [threadId],
    };

    const resultComment = await this._pool.query(queryComment);

    return [...resultComment.rows];
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

  async verifyCommentExistence(threadId, commentId) {
    const query = {
      text: 'SELECT id FROM comments WHERE "threadId" = $1 AND id = $2',
      values: [threadId, commentId],
    };

    const result = await this._pool.query(query);
    if (result.rowCount === 0) {
      throw new NotFoundError('komentar tidak ditemukan');
    }
  }

  async verifyReplyAvailability(commentId, replyId, owner) {
    const query = {
      text: 'SELECT owner FROM replies WHERE "commentId" = $1 AND id = $2',
      values: [commentId, replyId],
    };

    const result = await this._pool.query(query);
    if (result.rowCount === 0) {
      throw new NotFoundError('balasan tidak ditemukan');
    }

    if (result.rows[0].owner !== owner) {
      throw new AuthorizationError('autorisasi salah');
    }
  }

  async addReplyComment(addReply) {
    const {
      threadId, commentId, content, owner,
    } = addReply;

    await this.verifyThreadAvailability(threadId);
    await this.verifyCommentExistence(threadId, commentId);

    const id = `reply-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO replies (id, "commentId", content, owner) VALUES($1, $2, $3, $4) RETURNING id, content, owner',
      values: [id, commentId, content, owner],
    };

    const result = await this._pool.query(query);

    return { ...result.rows[0] };
  }

  async getRepliesInThread(getReply) {
    const { threadId } = getReply;

    const query = {
      text: `SELECT replies.id, replies."commentId", users.username, replies."createdAt" AS date, replies.content, replies.is_delete
        FROM replies
        JOIN comments ON comments.id = replies."commentId"
        JOIN users ON users.id = replies.owner
        WHERE comments."threadId" = $1
        ORDER BY replies."createdAt" ASC`,
      values: [threadId],
    };

    const result = await this._pool.query(query);

    return [...result.rows];
  }

  async deleteReplyComment(deleteReply) {
    const {
      threadId, commentId, replyId, owner,
    } = deleteReply;

    await this.verifyThreadAvailability(threadId);
    await this.verifyCommentExistence(threadId, commentId);
    await this.verifyReplyAvailability(commentId, replyId, owner);

    const query = {
      text: 'UPDATE replies SET is_delete = $3 WHERE "commentId" = $1 AND id = $2',
      values: [commentId, replyId, '1'],
    };

    await this._pool.query(query);
  }
}

module.exports = CommentRepositoryPostgres;
