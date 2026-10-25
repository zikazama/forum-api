const AddReply = require('../AddReply');

describe('AddReply entities', () => {
  it('should throw error when payload does not contain needed property', () => {
    // Arrange
    const payload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      owner: 'user-123',
    };

    // Action & Assert
    expect(() => new AddReply(payload)).toThrowError('ADD_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      content: 12345,
      owner: 'user-123',
    };

    // Action & Assert
    expect(() => new AddReply(payload)).toThrowError('ADD_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create AddReply entities correctly', () => {
    // Arrange
    const payload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      content: 'sebuah balasan',
      owner: 'user-123',
    };

    // Action
    const addReply = new AddReply(payload);

    // Assert
    expect(addReply).toBeInstanceOf(AddReply);
    expect(addReply.threadId).toEqual(payload.threadId);
    expect(addReply.commentId).toEqual(payload.commentId);
    expect(addReply.content).toEqual(payload.content);
    expect(addReply.owner).toEqual(payload.owner);
  });
});
