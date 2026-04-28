'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Students', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      student_number: {
        type: Sequelize.STRING
      },
      full_name: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      department: {
        type: Sequelize.STRING
      },
      academic_year: {
        type: Sequelize.INTEGER
      },
      faculty_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
       references: {
          model: "Faculties",
          key: "id"
      },
      onDelete: "CASCADE",
       onUpdate: "CASCADE"
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
        await queryInterface.addIndex('Students',["student_number"],{unique:true});
        await queryInterface.addIndex('Students',["email"] ,{unique:true});
        await queryInterface.addIndex('Students',["faculty_id"] );

  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Students');
  }
};