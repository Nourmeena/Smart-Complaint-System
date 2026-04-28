'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
 
    const users = [];

    for (let i = 1; i <= 50; i++) {

      const role =
        i <= 35 ? 'student' :
        i <= 45 ? 'officer' :
        i <= 48 ? 'manager' : 'admin';

      users.push({
        full_name: `User ${i}`,
        email: `user${i}@test.com`,
        password_hash: 'hashedpassword',
        role,
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    await queryInterface.bulkInsert('Users', users);
  },

  async down (queryInterface, Sequelize) {
      await queryInterface.bulkDelete('Users', null, {});
  }
};
