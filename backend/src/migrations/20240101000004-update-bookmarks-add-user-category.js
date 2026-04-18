'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDesc = await queryInterface.describeTable('bookmarks');

    if (!tableDesc.userId) {
      await queryInterface.addColumn('bookmarks', 'userId', {
        type: Sequelize.INTEGER,
        allowNull: true, // nullable for existing rows
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      });
    }

    if (!tableDesc.categoryId) {
      await queryInterface.addColumn('bookmarks', 'categoryId', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'categories', key: 'id' },
        onDelete: 'SET NULL',
      });
    }
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('bookmarks', 'userId');
    await queryInterface.removeColumn('bookmarks', 'categoryId');
  },
};
