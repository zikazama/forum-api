const AddCommentUseCase = require('../../../../Applications/use_case/AddCommentUseCase');
const DeleteCommentUseCase = require('../../../../Applications/use_case/DeleteCommentUseCase');

class CommentsHandler {
  constructor(container) {
    this._container = container;
    this.postCommentHandler = this.postCommentHandler.bind(this);
    this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
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
}

module.exports = CommentsHandler;
