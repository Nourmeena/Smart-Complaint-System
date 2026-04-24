'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      student_id: {
        type: Sequelize.INTEGER,
        allowNull:true,
          references: {
          model: "Students",
          key: "id"
      },
      onDelete: "CASCADE"
      },
      full_name: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      password_hash: {
        type: Sequelize.STRING
      },
      role: {
      type: Sequelize.ENUM("student", "officer", "manager", "admin"),
      allowNull: false
      },
      is_active: {
        type: Sequelize.BOOLEAN
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deletedAt:{
        allowNull:true,
        type:Sequelize.DATE
      }
    });
    await queryInterface.addIndex('Users',["email"],{unique:true});
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Users');
  }
};