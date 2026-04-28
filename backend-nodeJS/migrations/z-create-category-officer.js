'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('CategoryOfficers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
        category_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "Categories",
        key: "id"
      },
      onDelete: "CASCADE"
    },

    officer_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id"
      },
      onDelete: "CASCADE"
    },
    assigned_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    }
    });
    await queryInterface.addIndex('CategoryOfficers',["category_id","officer_id"],{unique:true});
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('CategoryOfficers');
  }
};