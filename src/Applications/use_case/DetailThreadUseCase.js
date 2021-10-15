const DetailThread = require('../../Domains/threads/entities/DetailThread');

class DetailThreadUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async filterDeletedComment(results) {
    const data = {
      id: results.id,
      title: results.title,
      body: results.body,
      date: results.date,
      username: results.username,
      comments: [],
    };
    results.comments.forEach((result) => {
      const temp = result;
      if (result.is_delete === '1') {
        // eslint-disable-next-line no-param-reassign
        temp.content = '**komentar telah dihapus**';
      }
      delete temp.is_delete;
      data.comments.push(result);
    });
    return data;
  }

  async execute(useCaseParams) {
    const detailThread = new DetailThread(useCaseParams);
    const results = await this._threadRepository.getThread(detailThread);
    const comments = await this._commentRepository.getCommentInThread(detailThread);
    results.comments = comments;

    const data = await this.filterDeletedComment(results);
    return data;
  }
}

module.exports = DetailThreadUseCase;
