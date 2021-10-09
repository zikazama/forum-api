const AddReplyComment = require('../AddReplyComment');

describe('AddReplyComment entities', () => {
  it('should throw error when payload does not contain needed property', () => {
    // Arrange
    const payload = {
      threadId: 'id',
      commentId: 'id',
      content: 'isi',
    };

    // Action & Assert
    expect(() => new AddReplyComment(payload)).toThrowError('ADD_REPLY_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      threadId: 'id',
      commentId: 12345,
      content: 'isi',
      owner: 123,
    };

    // Action & Assert
    expect(() => new AddReplyComment(payload)).toThrowError('ADD_REPLY_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create AddReplyComment entities correctly', () => {
    // Arrange
    const payload = {
      threadId: 'Judul',
      commentId: 'Ini Isi',
      content: 'isi',
      owner: 'user-123',
    };

    // Action
    const addComment = new AddReplyComment(payload);

    // Assert
    expect(addComment).toBeInstanceOf(AddReplyComment);
    expect(addComment.threadId).toEqual(payload.threadId);
    expect(addComment.commentId).toEqual(payload.commentId);
    expect(addComment.content).toEqual(payload.content);
    expect(addComment.owner).toEqual(payload.owner);
  });
});
