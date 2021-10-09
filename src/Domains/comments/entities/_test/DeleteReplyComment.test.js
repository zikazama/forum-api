const DeleteReplyComment = require('../DeleteReplyComment');

describe('DeleteReplyComment entities', () => {
  it('should throw error when payload does not contain needed property', () => {
    // Arrange
    const payload = {
    };

    // Action & Assert
    expect(() => new DeleteReplyComment(payload)).toThrowError('DELETE_REPLY_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      commentId: 123,
    };

    // Action & Assert
    expect(() => new DeleteReplyComment(payload)).toThrowError('DELETE_REPLY_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create deleteReplyComment entities correctly', () => {
    // Arrange
    const payload = {
      commentId: 'id',
    };

    // Action
    const deleteReplyComment = new DeleteReplyComment(payload);

    // Assert
    expect(deleteReplyComment).toBeInstanceOf(DeleteReplyComment);
    expect(deleteReplyComment.commentId).toEqual(payload.commentId);
  });
});
