const AddCommentUseCase = require('../../../../Applications/use_case/AddCommentUseCase');
const DeleteCommentUseCase = require('../../../../Applications/use_case/DeleteCommentUseCase');
const AddReplyUseCase = require('../../../../Applications/use_case/AddReplyUseCase');
const DeleteReplyUseCase = require('../../../../Applications/use_case/DeleteReplyUseCase');

class CommentsHandler {
  constructor(container) {
    this._container = container;
    this.postCommentHandler = this.postCommentHandler.bind(this);
    this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
    this.postReplyHandler = this.postReplyHandler.bind(this);
    this.deleteReplyHandler = this.deleteReplyHandler.bind(this);
  }

  async postCommentHandler(req, res) {
    const addCommentUseCase = this._container.getInstance(AddCommentUseCase.name);
    const { authorization } = req.headers;
    // eslint-disable-next-line max-len
    const addedComment = await addCommentUseCase.execute(req.body, authorization, req.params);

    res.status(201).json({
      status: 'success',
      data: {
        addedComment,
      },
    });
  }

  async deleteCommentHandler(req, res) {
    const { authorization } = req.headers;
    const { threadId, commentId } = req.params;
    const deleteCommentUseCase = this._container.getInstance(DeleteCommentUseCase.name);

    // eslint-disable-next-line max-len
    await deleteCommentUseCase.execute({ authorization, threadId, commentId });

    res.status(200).json({
      status: 'success',
    });
  }

  async postReplyHandler(req, res) {
    const addReplyUseCase = this._container.getInstance(AddReplyUseCase.name);
    const { authorization } = req.headers;
    // eslint-disable-next-line max-len
    const addedReply = await addReplyUseCase.execute(req.body, authorization, req.params);

    res.status(201).json({
      status: 'success',
      data: {
        addedReply,
      },
    });
  }

  async deleteReplyHandler(req, res) {
    const { authorization } = req.headers;
    const { threadId, commentId, replyId } = req.params;
    const deleteReplyUseCase = this._container.getInstance(DeleteReplyUseCase.name);

    // eslint-disable-next-line max-len
    await deleteReplyUseCase.execute({
      authorization, threadId, commentId, replyId,
    });

    res.status(200).json({
      status: 'success',
    });
  }
}

module.exports = CommentsHandler;
