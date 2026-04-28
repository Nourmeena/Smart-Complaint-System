'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('OtpTokens', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      student_number: {
        type: Sequelize.STRING,
         allowNull: false,
          references: {
            model: "Students",
            key: "student_number"
          },
          onDelete: "CASCADE"
      },
      otp_code: {
        type: Sequelize.STRING,
        allowNull:false
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      is_used: {
        type: Sequelize.BOOLEAN,
         defaultValue: false
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
    await queryInterface.addIndex('OtpTokens',["student_number"] );
        await queryInterface.addIndex('OtpTokens',["expires_at"] );

  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('OtpTokens');
  }
};