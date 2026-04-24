'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('AuditLogs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
         allowNull: false,
        references: {
          model: "Users",
          key: "id"
        },
        onDelete: "CASCADE"
      },
      action: {
        type: Sequelize.STRING
      },
      entity_type: {
        type: Sequelize.STRING,
        allowNull:false
      },
      entity_id: {
        type: Sequelize.INTEGER,
        allowNull:false
      },
      old_value: {
        type: Sequelize.JSON,
        allowNull:true
      },
      new_value: {
        type: Sequelize.JSON,
        allowNull:true
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
    await queryInterface.addIndex('AuditLogs',["user_id"] );
    await queryInterface.addIndex('AuditLogs',["entity_type"] );
    await queryInterface.addIndex('AuditLogs',["entity_id"] );
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('AuditLogs');
  }
};