'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {

    const faculties = await queryInterface.sequelize.query(
      `SELECT id, name FROM Faculties;`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const eng = faculties.find(f => f.name === 'Faculty of Engineering')?.id;
    const sci = faculties.find(f => f.name === 'Faculty of Science')?.id;

    await queryInterface.bulkInsert('Categories', [

      { name: 'Maintenance', description: 'Facilities issues', faculty_id: eng, is_active: true, createdAt: new Date(), updatedAt: new Date() },

      { name: 'MidtermExams', description: 'Exam issues', faculty_id: eng, is_active: true, createdAt: new Date(), updatedAt: new Date() },

      { name: 'IT Support', description: 'Tech issues', faculty_id: eng, is_active: true, createdAt: new Date(), updatedAt: new Date() },

      { name: 'Library', description: 'Library issues', faculty_id: sci, is_active: true, createdAt: new Date(), updatedAt: new Date() },

      { name: 'Labs', description: 'Lab issues', faculty_id: sci, is_active: true, createdAt: new Date(), updatedAt: new Date() },

      { name: 'Financial', description: 'Tuition fees, payments, refunds', faculty_id: eng, is_active: true, createdAt: new Date(), updatedAt: new Date() },

      { name: 'Administrative', description: 'Paperwork, enrollment, official procedures', faculty_id: eng, is_active: true, createdAt: new Date(), updatedAt: new Date() },

      { name: 'Graduation Certificates', description: 'Issues related to graduation documents', faculty_id: eng, is_active: true, createdAt: new Date(), updatedAt: new Date() },

      { name: 'Grades', description: 'Marks, results, grading disputes', faculty_id: eng, is_active: true, createdAt: new Date(), updatedAt: new Date() },

      { name: 'Schedule', description: 'Timetable and lecture scheduling issues', faculty_id: eng, is_active: true, createdAt: new Date(), updatedAt: new Date() },

      { name: 'Registration', description: 'Course registration problems', faculty_id: eng, is_active: true, createdAt: new Date(), updatedAt: new Date() },

      { name: 'Hostel', description: 'Accommodation and housing issues', faculty_id: sci, is_active: true, createdAt: new Date(), updatedAt: new Date() }

    ]);

  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('Categories', null, {});
  }
};