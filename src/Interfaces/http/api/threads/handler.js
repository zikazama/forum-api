const AddThreadUseCase = require('../../../../Applications/use_case/AddThreadUseCase');
const DetailThreadUseCase = require('../../../../Applications/use_case/DetailThreadUseCase');

class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.getDetailThreadHandler = this.getDetailThreadHandler.bind(this);
  }

  async postThreadHandler(req, res) {
    const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);
    const addedThread = await addThreadUseCase.execute(req.body, req.headers);

    res.status(201).json({
      status: 'success',
      data: {
        addedThread,
      },
    });
  }

  async getDetailThreadHandler(req, res) {
    const detailThreadUseCase = this._container.getInstance(DetailThreadUseCase.name);
    const thread = await detailThreadUseCase.execute(req.params);

    res.status(200).json({
      status: 'success',
      data: {
        thread,
      },
    });
  }
}

module.exports = ThreadsHandler;
