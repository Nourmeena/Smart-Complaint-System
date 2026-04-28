'use strict';

const { Model } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PriorityRules', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      priority_level: {
        type: Sequelize.INTEGER
      },
      description: {
        type: Sequelize.STRING
      },
      examples: {
        type: Sequelize.JSON // cause there's no array of string here
      },
      category_id: {
        type: Sequelize.INTEGER,
        allowNull:true,
        references:{
          model:"Categories",
          key:"id"
        }
      },
      created_by: {
        type: Sequelize.INTEGER,
        refrences:{
          Model:"Users",
          key:"id"
        }
      },
      updatedAt: {
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('PriorityRules');
  }
};