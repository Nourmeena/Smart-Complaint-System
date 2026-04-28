'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {

    const categories = await queryInterface.sequelize.query(
      `SELECT id, name FROM Categories;`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

   const categoryMap = {};
categories.forEach(c => {
  categoryMap[c.name] = c.id;
});

const getCat = (name) => {
  if (!categoryMap[name]) {
    throw new Error(`Category not found: ${name}`);
  }
  return categoryMap[name];
};

    await queryInterface.bulkInsert('CategoryKeywords', [

      // 🛠 Maintenance
      { category_id: getCat('Maintenance'), keyword: 'تكييف' },
      { category_id: getCat('Maintenance'), keyword: 'AC' },
      { category_id: getCat('Maintenance'), keyword: 'كهربا' },
      { category_id: getCat('Maintenance'), keyword: 'broken chair' },
      { category_id: getCat('Maintenance'), keyword: 'كرسي مكسور' },
      { category_id: getCat('Maintenance'), keyword: 'classroom' },

      // 🎓 Exams
      { category_id: getCat('MidtermExams'), keyword: 'امتحان' },
      { category_id: getCat('MidtermExams'), keyword: 'exam' },
      { category_id: getCat('MidtermExams'), keyword: 'midterm' },
      { category_id: getCat('MidtermExams'), keyword: 'final' },
      { category_id: getCat('MidtermExams'), keyword: 'جدول الامتحانات' },
      { category_id: getCat('MidtermExams'), keyword: 'schedule exam' },

      // 💻 IT Support
      { category_id: getCat('IT Support'), keyword: 'موقع' },
      { category_id: getCat('IT Support'), keyword: 'website' },
      { category_id: getCat('IT Support'), keyword: 'login' },
      { category_id: getCat('IT Support'), keyword: 'password' },
      { category_id: getCat('IT Support'), keyword: 'نسيت الباسورد' },
      { category_id: getCat('IT Support'), keyword: 'system error' },

      // 📚 Library
      { category_id: getCat('Library'), keyword: 'مكتبة' },
      { category_id: getCat('Library'), keyword: 'library' },
      { category_id: getCat('Library'), keyword: 'book' },
      { category_id: getCat('Library'), keyword: 'كتاب' },
      { category_id: getCat('Library'), keyword: 'borrow' },

      // 🔬 Labs
      { category_id: getCat('Labs'), keyword: 'لاب' },
      { category_id: getCat('Labs'), keyword: 'lab' },
      { category_id: getCat('Labs'), keyword: 'experiment' },
      { category_id: getCat('Labs'), keyword: 'معدات' },
      { category_id: getCat('Labs'), keyword: 'equipment' },

      // 💰 Financial
      { category_id: getCat('Financial'), keyword: 'مصروفات' },
      { category_id: getCat('Financial'), keyword: 'fees' },
      { category_id: getCat('Financial'), keyword: 'payment' },
      { category_id: getCat('Financial'), keyword: 'دفعت ومش ظاهر' },
      { category_id: getCat('Financial'), keyword: 'refund' },
      { category_id: getCat('Financial'), keyword: 'tuition' },

      // 🏛 Administrative
      { category_id: getCat('Administrative'), keyword: 'شؤون' },
      { category_id: getCat('Administrative'), keyword: 'student affairs' },
      { category_id: getCat('Administrative'), keyword: 'سوء معاملة' },
      { category_id: getCat('Administrative'), keyword: 'document' },
      { category_id: getCat('Administrative'), keyword: 'ورق' },
      { category_id: getCat('Administrative'), keyword: 'certificate' },

      // 🎓 Graduation
      { category_id: getCat('Graduation Certificates'), keyword: 'تخرج' },
      { category_id: getCat('Graduation Certificates'), keyword: 'graduation' },
      { category_id: getCat('Graduation Certificates'), keyword: 'شهادة التخرج' },
      { category_id: getCat('Graduation Certificates'), keyword: 'certificate delay' },

      // 📊 Grades
      { category_id: getCat('Grades'), keyword: 'درجات' },
      { category_id: getCat('Grades'), keyword: 'grade' },
      { category_id: getCat('Grades'), keyword: 'marks' },
      { category_id: getCat('Grades'), keyword: 'رصد' },
      { category_id: getCat('Grades'), keyword: 'تظلم' },
      { category_id: getCat('Grades'), keyword: 'result' },

      // 📅 Schedule
      { category_id: getCat('Schedule'), keyword: 'جدول' },
      { category_id: getCat('Schedule'), keyword: 'schedule' },
      { category_id: getCat('Schedule'), keyword: 'ساعات' },
      { category_id: getCat('Schedule'), keyword: 'hours' },

      // 🧾 Registration
      { category_id: getCat('Registration'), keyword: 'تسجيل' },
      { category_id: getCat('Registration'), keyword: 'register' },
      { category_id: getCat('Registration'), keyword: 'كورسات' },
      { category_id: getCat('Registration'), keyword: 'course' },
      { category_id: getCat('Registration'), keyword: 'enroll' }

    ]);

  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('CategoryKeywords', null, {});
  }
};
