'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.addIndex('bookmarks', ['url'], {
      name: 'bookmarks_url_idx',
    });
    await queryInterface.addIndex('bookmarks', ['createdAt'], {
      name: 'bookmarks_created_at_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('bookmarks', 'bookmarks_url_idx');
    await queryInterface.removeIndex('bookmarks', 'bookmarks_created_at_idx');
  },
};
