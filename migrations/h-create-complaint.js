'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Complaints', {
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
    category_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Categories",
          key: "id"
        },
        onDelete: "CASCADE"
      },
      problem: {
        type: Sequelize.TEXT
      },
      location: {
        type: Sequelize.STRING
      },
      since: {
        type: Sequelize.DATE
      },
      ai_summary: {
        type: Sequelize.TEXT
      },
      priority: {
        type: Sequelize.INTEGER
      },
     status: {
        type: Sequelize.ENUM("pending", "in_progress", "resolved", "appealed"),
        defaultValue: "pending"
      },
      resolution_text: {
        type: Sequelize.TEXT
      },
      resolved_at: {
        type: Sequelize.DATE
      },
      sla_deadline: {
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
       await queryInterface.addIndex('Complaints',["user_id"] );
       await queryInterface.addIndex('Complaints',["category_id"] );
       await queryInterface.addIndex('Complaints',["status"] );
       await queryInterface.addIndex('Complaints',["priority"] );
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Complaints');
  }
};