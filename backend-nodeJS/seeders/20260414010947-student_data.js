'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {

    const faculties = await queryInterface.sequelize.query(
      `SELECT id, name FROM Faculties;`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const eng = faculties.find(f => f.name === 'Faculty of Engineering')?.id;
    const sci = faculties.find(f => f.name === 'Faculty of Science')?.id;

    await queryInterface.bulkInsert('Students', [

      {
        faculty_id: eng,
        student_number: '20241001',
        full_name: 'Ahmed Hassan',
        email: 'ahmed.hassan@uni.edu',
        department: 'Computer Science',
        academic_year: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      {
        faculty_id: sci,
        student_number: '20241002',
        full_name: 'Omar Khaled',
        email: 'omar.khaled@uni.edu',
        department: 'Information Systems',
        academic_year: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      {
        faculty_id: eng,
        student_number: '20241003',
        full_name: 'Mohamed Ali',
        email: 'mohamed.ali@uni.edu',
        department: 'Software Engineering',
        academic_year: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      {
        faculty_id: sci,
        student_number: '20241004',
        full_name: 'Youssef Samir',
        email: 'youssef.samir@uni.edu',
        department: 'Computer Science',
        academic_year: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      {
        faculty_id: eng,
        student_number: '20241005',
        full_name: 'Abdelrahman Tarek',
        email: 'abdelrahman.tarek@uni.edu',
        department: 'AI Department',
        academic_year: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      {
        faculty_id: sci,
        student_number: '20241006',
        full_name: 'Mostafa Nabil',
        email: 'mostafa.nabil@uni.edu',
        department: 'Data Science',
        academic_year: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      {
        faculty_id: eng,
        student_number: '20241007',
        full_name: 'Kareem Adel',
        email: 'kareem.adel@uni.edu',
        department: 'Computer Engineering',
        academic_year: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      {
        faculty_id: sci,
        student_number: '20241008',
        full_name: 'Hassan Mahmoud',
        email: 'hassan.mahmoud@uni.edu',
        department: 'Information Technology',
        academic_year: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      {
        faculty_id: eng,
        student_number: '20241009',
        full_name: 'Tamer Ashraf',
        email: 'tamer.ashraf@uni.edu',
        department: 'Software Engineering',
        academic_year: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      {
        faculty_id: sci,
        student_number: '20241010',
        full_name: 'Mahmoud Saeed',
        email: 'mahmoud.saeed@uni.edu',
        department: 'Computer Science',
        academic_year: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      }

    ]);

  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('Students', null, {});
  }
};