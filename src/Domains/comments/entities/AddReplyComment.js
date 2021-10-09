class AddReplyComment {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      threadId, commentId, content, owner,
    } = payload;

    this.threadId = threadId;
    this.commentId = commentId;
    this.content = content;
    this.owner = owner;
  }

  _verifyPayload({
    threadId, commentId, content, owner,
  }) {
    if (!threadId || !commentId || !content || !owner) {
      throw new Error('ADD_REPLY_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof threadId !== 'string' || typeof commentId !== 'string' || typeof content !== 'string' || typeof owner !== 'string') {
      throw new Error('ADD_REPLY_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }

    if (content.length > 50) {
      throw new Error('ADD_REPLY_COMMENT.TITLE_LIMIT_CHAR');
    }

    if (!content.match(/^[\w]+$/)) {
      throw new Error('ADD_REPLY_COMMENT.TITLE_CONTAIN_RESTRICTED_CHARACTER');
    }
  }
}

module.exports = AddReplyComment;
