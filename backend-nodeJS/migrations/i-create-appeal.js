'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Appeals', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
     complaint_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Complaints",
          key: "id"
        },
        onDelete: "CASCADE"
      },
      responded_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "users",
          key: "id"
        },
        onDelete: "SET NULL"
      },
      reason: {
        type: Sequelize.TEXT
      },
     status: {
        type: Sequelize.ENUM("pending", "reviewed"),
        defaultValue: "pending"
      },
      response_text: {
        type: Sequelize.TEXT
      },
      responded_at: {
        type: Sequelize.DATE
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
      await queryInterface.addIndex('Appeals',["complaint_id"] );
      await queryInterface.addIndex('Appeals',["status"] );
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Appeals');
  }
};