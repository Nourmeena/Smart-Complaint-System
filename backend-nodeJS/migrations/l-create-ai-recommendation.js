'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('AiRecommendations', {
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
      pattern_detected: {
        type: Sequelize.TEXT
      },
      recommendation: {
        type: Sequelize.TEXT
      },
      status: {
        type: Sequelize.ENUM('pending', 'implemented', 'ignored'),
        defaultValue: 'pending'
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });
    await queryInterface.addIndex('AiRecommendations', ['category_id']);
    await queryInterface.addIndex('AiRecommendations', ['status']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('AiRecommendations');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_AiRecommendations_status";');

  }
};