/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const RepliesTableTestHelper = {
  async addReply({
    id = 'reply-123', commentId = 'comment-123', content = 'isi', owner = 'user-123',
  }) {
    const query = {
      text: 'INSERT INTO replies (id, "commentId", content, owner) VALUES($1, $2, $3, $4)',
      values: [id, commentId, content, owner],
    };

    await pool.query(query);
  },

  async getDetailReply(id) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM replies WHERE 1=1');
  },
};

module.exports = RepliesTableTestHelper;
