'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {

    const categories = await queryInterface.sequelize.query(
      `SELECT id, name FROM Categories;`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const users = await queryInterface.sequelize.query(
      `SELECT id FROM Users WHERE role='officer';`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const getCat = (name) =>
      categories.find(c => c.name === name);

    const getOfficer = (index = 0) =>
      users[index % users.length];

    await queryInterface.bulkInsert('CategoryOfficers', [

      // 💰 Financial → financial officer
      {
        category_id: getCat('Financial').id,
        officer_id: getOfficer(0).id,
        officer_type: 'financial_officer',
        assigned_at: new Date()
      },

      // 🏛 Administrative → admin staff
      {
        category_id: getCat('Administrative').id,
        officer_id: getOfficer(1).id,
        officer_type: 'admin_staff',
        assigned_at: new Date()
      },

      // 📊 Grades → doctor
      {
        category_id: getCat('Grades').id,
        officer_id: getOfficer(2).id,
        officer_type: 'doctor',
        assigned_at: new Date()
      },

      // 📝 Exams → ta / doctor
      {
        category_id: getCat('MidtermExams').id,
        officer_id: getOfficer(3).id,
        officer_type: 'ta',
        assigned_at: new Date()
      },

      // 💻 IT Support
      {
        category_id: getCat('IT Support').id,
        officer_id: getOfficer(4).id,
        officer_type: 'it_support',
        assigned_at: new Date()
      },

      // 📚 Library
      {
        category_id: getCat('Library').id,
        officer_id: getOfficer(5).id,
        officer_type: 'library_staff',
        assigned_at: new Date()
      },

      // 🔬 Labs
      {
        category_id: getCat('Labs').id,
        officer_id: getOfficer(6).id,
        officer_type: 'lab_assistant',
        assigned_at: new Date()
      },

      // 🛠 Maintenance
      {
        category_id: getCat('Maintenance').id,
        officer_id: getOfficer(7).id,
        officer_type: 'maintenance_staff',
        assigned_at: new Date()
      }

    ]);

  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('CategoryOfficers', null, {});
  }
};
