'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Faculties', [
      {
        name: 'Faculty of Engineering',
        email_domain: '@eng.edu',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Faculty of Science',
        email_domain: '@sci.edu',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
     await queryInterface.bulkDelete('Faculties', null, {});  
  }
};
