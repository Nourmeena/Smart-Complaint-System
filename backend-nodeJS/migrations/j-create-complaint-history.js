'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ComplaintHistories', {
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
    changed_by: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "Users",
        key: "id"
      },
      onDelete: "SET NULL"
    },
    status: {
        type: Sequelize.ENUM("pending", "in_progress", "resolved", "appealed"),
        allowNull: false
      },
      changed_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
   await queryInterface.addIndex('ComplaintHistories',["complaint_id"] );
  await queryInterface.addIndex('ComplaintHistories',["changed_by"] );
  await queryInterface.addIndex('ComplaintHistories',["status"] );

  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ComplaintHistories');
  }
};