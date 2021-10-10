const DetailThread = require('../../Domains/threads/entities/DetailThread');

class DetailThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCaseParams) {
    const detailThread = new DetailThread(useCaseParams);
    return this._threadRepository.getDetailThread(detailThread);
  }
}

module.exports = DetailThreadUseCase;
