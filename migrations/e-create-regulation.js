'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Regulations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
     faculty_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "Faculties",
        key: "id"
      },
      onDelete: "CASCADE"
    },
      article_number: {
        type: Sequelize.STRING
      },
      content: {
        type: Sequelize.TEXT
      },
      type: {
        type: Sequelize.ENUM("regulation", "faq"),
        allowNull: false
      },
      embedding_id: {
        type: Sequelize.STRING,
        allowNull:true // need to know why
      },
     added_by: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "Users",
        key: "id"
      },
      onDelete: "SET NULL"
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
        await queryInterface.addIndex('Regulations',["article_number"] );
        await queryInterface.addIndex('Regulations',["faculty_id"] );
        await queryInterface.addIndex('Regulations',["type"] );

  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Regulations');
  }
};