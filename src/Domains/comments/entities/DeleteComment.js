class DeleteComment {
  constructor(payload) {
    this._verifyPayload(payload);

    const { commentId } = payload;

    this.commentId = commentId;
  }

  _verifyPayload({ commentId }) {
    if (!commentId) {
      throw new Error('DELETE_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof commentId !== 'string') {
      throw new Error('DELETE_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = DeleteComment;
