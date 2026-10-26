/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('replies', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    commentId: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"comments"',
    },
    content: {
      type: 'TEXT',
      notNull: true,
    },
    owner: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"users"',
    },
    is_delete: {
      type: 'CHAR(1)',
    },
    createdAt: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('replies');
};
