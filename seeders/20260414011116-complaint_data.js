'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {

    const users = await queryInterface.sequelize.query(
      `SELECT id FROM Users WHERE role='student';`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const categories = await queryInterface.sequelize.query(
      `SELECT id, name FROM Categories;`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // build safe map instead of find()
    const categoryMap = {};
    categories.forEach(c => {
      categoryMap[c.name] = c.id;
    });

    const getUser = () => {
      if (!users.length) {
        throw new Error("No students found in Users table");
      }
      return users[Math.floor(Math.random() * users.length)].id;
    };

    const getCat = (name) => {
      if (!categoryMap[name]) {
        throw new Error(`Category not found in DB: ${name}`);
      }
      return categoryMap[name];
    };

    await queryInterface.bulkInsert('Complaints', [

      // 🛠 Maintenance
      {
        user_id: getUser(),
        category_id: getCat('Maintenance'),
        problem: 'Air conditioner not working in lecture hall 3',
        location: 'Building A - Hall 3',
        since: new Date(),
        ai_summary: 'AC malfunction affecting classroom environment',
        priority: 2,
        status: 'resolved',
        resolution_text: 'Maintenance team fixed the AC compressor issue.',
        resolved_at: new Date(),
        sla_deadline: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // 📊 Exams
      {
        user_id: getUser(),
        category_id: getCat('MidtermExams'),
        problem: 'Midterm exam grade not displayed on portal',
        location: 'Online Portal',
        since: new Date(),
        ai_summary: 'Missing exam results in student portal',
        priority: 1,
        status: 'in_progress',
        resolution_text: null,
        resolved_at: null,
        sla_deadline: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // 💻 IT Support
      {
        user_id: getUser(),
        category_id: getCat('IT Support'),
        problem: 'Cannot login to student portal',
        location: 'Online',
        since: new Date(),
        ai_summary: 'Authentication failure issue',
        priority: 1,
        status: 'resolved',
        resolution_text: 'Password reset link sent and issue resolved.',
        resolved_at: new Date(),
        sla_deadline: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // 📚 Library
      {
        user_id: getUser(),
        category_id: getCat('Library'),
        problem: 'Requested book is always unavailable',
        location: 'Main Library',
        since: new Date(),
        ai_summary: 'Book shortage issue in library system',
        priority: 3,
        status: 'pending',
        resolution_text: null,
        resolved_at: null,
        sla_deadline: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // 🔬 Labs
      {
        user_id: getUser(),
        category_id: getCat('Labs'),
        problem: 'Lab equipment not functioning during experiment',
        location: 'Physics Lab',
        since: new Date(),
        ai_summary: 'Faulty lab equipment',
        priority: 2,
        status: 'resolved',
        resolution_text: 'Equipment replaced and calibrated successfully.',
        resolved_at: new Date(),
        sla_deadline: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // 💰 Financial
      {
        user_id: getUser(),
        category_id: getCat('Financial'),
        problem: 'Tuition payment not reflected after bank transfer',
        location: 'Finance Office',
        since: new Date(),
        ai_summary: 'Payment sync delay issue',
        priority: 1,
        status: 'in_progress',
        resolution_text: null,
        resolved_at: null,
        sla_deadline: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // 🏛 Administrative
      {
        user_id: getUser(),
        category_id: getCat('Administrative'),
        problem: 'Wrong spelling in official enrollment certificate',
        location: 'Student Affairs',
        since: new Date(),
        ai_summary: 'Data entry mistake in official documents',
        priority: 2,
        status: 'resolved',
        resolution_text: 'Certificate reissued with corrected information.',
        resolved_at: new Date(),
        sla_deadline: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // 🎓 Graduation Certificates
      {
        user_id: getUser(),
        category_id: getCat('Graduation Certificates'),
        problem: 'Delay in issuing graduation certificate',
        location: 'Registry Office',
        since: new Date(),
        ai_summary: 'Processing delay for graduation documents',
        priority: 2,
        status: 'pending',
        resolution_text: null,
        resolved_at: null,
        sla_deadline: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // 📊 Grades
      {
        user_id: getUser(),
        category_id: getCat('Grades'),
        problem: 'Incorrect grade shown for Database course',
        location: 'Online Portal',
        since: new Date(),
        ai_summary: 'Grade mismatch issue',
        priority: 1,
        status: 'resolved',
        resolution_text: 'Grade reviewed and corrected by instructor.',
        resolved_at: new Date(),
        sla_deadline: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },

      {
        user_id: getUser(),
        category_id: getCat('Schedule'),
        problem: 'Lecture time changed without notification',
        location: 'CS Department',
        since: new Date(),
        ai_summary: 'Schedule update communication issue',
        priority: 2,
        status: 'resolved',
        resolution_text: 'Students notified and schedule updated correctly.',
        resolved_at: new Date(),
        sla_deadline: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // 🧾 Registration
      {
        user_id: getUser(),
        category_id: getCat('Registration'),
        problem: 'Unable to register for required course',
        location: 'Registration Portal',
        since: new Date(),
        ai_summary: 'Course capacity or system issue',
        priority: 1,
        status: 'in_progress',
        resolution_text: null,
        resolved_at: null,
        sla_deadline: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: getUser(),
        category_id: getCat('Hostel'),
        problem: 'Room AC not working in dormitory',
        location: 'Hostel Block B',
        since: new Date(),
        ai_summary: 'Accommodation facility issue',
        priority: 2,
        status: 'resolved',
        resolution_text: 'AC repaired by maintenance team.',
        resolved_at: new Date(),
        sla_deadline: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
,
      {
        user_id: getUser(),
        category_id: getCat('Grades'),
        problem: 'درجات مناقشة أسيمنت',
        location: 'Online',
        since: new Date(),
        ai_summary: 'Missing discussion grade',
        priority: 2,
        status: 'resolved',
        resolution_text: 'تم إضافة الدرجة بعد مراجعة الدكتور.',
        resolved_at: new Date(),
        sla_deadline: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },

      {
        user_id: getUser(),
        category_id: getCat('Grades'),
        problem: 'درجات assignment',
        location: 'Portal',
        since: new Date(),
        ai_summary: 'Assignment grade missing',
        priority: 2,
        status: 'in_progress',
        resolution_text: null,
        resolved_at: null,
        sla_deadline: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },

      {
        user_id: getUser(),
        category_id: getCat('Grades'),
        problem: 'درجات محطوطة غلط',
        location: 'Exam system',
        since: new Date(),
        ai_summary: 'Incorrect grade entry',
        priority: 1,
        status: 'resolved',
        resolution_text: 'تم تصحيح الخطأ بعد إعادة الرصد.',
        resolved_at: new Date(),
        sla_deadline: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },

      {
        user_id: getUser(),
        category_id: getCat('Grades'),
        problem: 'تظلم درجات',
        location: 'Student Affairs',
        since: new Date(),
        ai_summary: 'Grade appeal',
        priority: 1,
        status: 'pending',
        resolution_text: null,
        resolved_at: null,
        sla_deadline: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },

      {
        user_id: getUser(),
        category_id: getCat('Grades'),
        problem: 'عدم الاهتمام بطلاب في التصحيح',
        location: 'Faculty',
        since: new Date(),
        ai_summary: 'Fair grading complaint',
        priority: 2,
        status: 'in_progress',
        resolution_text: null,
        resolved_at: null,
        sla_deadline: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },

      {
        user_id: getUser(),
        category_id: getCat('Grades'),
        problem: 'عايزة درجات رأفة عشان انجح',
        location: 'Exam office',
        since: new Date(),
        ai_summary: 'Grade mercy request',
        priority: 3,
        status: 'pending',
        resolution_text: null,
        resolved_at: null,
        sla_deadline: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },

      {
        user_id: getUser(),
        category_id: getCat('Grades'),
        problem: 'نقص درجات',
        location: 'Portal',
        since: new Date(),
        ai_summary: 'Missing grade points',
        priority: 2,
        status: 'resolved',
        resolution_text: 'تمت مراجعة الدرجات وإضافة الناقص.',
        resolved_at: new Date(),
        sla_deadline: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },

      {
        user_id: getUser(),
        category_id: getCat('Grades'),
        problem: 'درجة امتحان أقل من المتوقع',
        location: 'Exam office',
        since: new Date(),
        ai_summary: 'Grade dissatisfaction',
        priority: 2,
        status: 'resolved',
        resolution_text: 'تم توضيح نموذج التصحيح للطالب.',
        resolved_at: new Date(),
        sla_deadline: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },

      {
        user_id: getUser(),
        category_id: getCat('Grades'),
        problem: 'اخطاء في التصحيح',
        location: 'Faculty',
        since: new Date(),
        ai_summary: 'Exam correction errors',
        priority: 1,
        status: 'resolved',
        resolution_text: 'تم إعادة تصحيح الورقة.',
        resolved_at: new Date(),
        sla_deadline: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },

      {
        user_id: getUser(),
        category_id: getCat('Grades'),
        problem: 'إعادة رصد درجات مادة',
        location: 'Exam office',
        since: new Date(),
        ai_summary: 'Regrading request',
        priority: 1,
        status: 'in_progress',
        resolution_text: null,
        resolved_at: null,
        sla_deadline: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // 💰 Financial
      {
        user_id: getUser(),
        category_id: getCat('Financial'),
        problem: 'المصاريف لم تظهر في النظام رغم الدفع',
        location: 'Finance office',
        since: new Date(),
        ai_summary: 'Payment sync issue',
        priority: 1,
        status: 'resolved',
        resolution_text: 'تم تحديث بيانات الدفع بنجاح.',
        resolved_at: new Date(),
        sla_deadline: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // 🏛 Administrative / Behavior
      {
        user_id: getUser(),
        category_id: getCat('Administrative'),
        problem: 'سوء معاملة',
        location: 'Student Affairs',
        since: new Date(),
        ai_summary: 'Staff behavior complaint',
        priority: 1,
        status: 'in_progress',
        resolution_text: null,
        resolved_at: null,
        sla_deadline: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },

      {
        user_id: getUser(),
        category_id: getCat('Administrative'),
        problem: 'تأخر صدور أوراق التحويل والمقاصة',
        location: 'Registry',
        since: new Date(),
        ai_summary: 'Delayed transfer papers',
        priority: 2,
        status: 'resolved',
        resolution_text: 'تم إصدار الأوراق بعد المراجعة.',
        resolved_at: new Date(),
        sla_deadline: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },

      {
        user_id: getUser(),
        category_id: getCat('Administrative'),
        problem: 'عدم الاهتمام بطلاب',
        location: 'Faculty',
        since: new Date(),
        ai_summary: 'Service quality complaint',
        priority: 2,
        status: 'pending',
        resolution_text: null,
        resolved_at: null,
        sla_deadline: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },

      {
        user_id: getUser(),
        category_id: getCat('Administrative'),
        problem: 'سلوك غير لائق من شباك الشؤون',
        location: 'Admin office',
        since: new Date(),
        ai_summary: 'Misconduct complaint',
        priority: 1,
        status: 'in_progress',
        resolution_text: null,
        resolved_at: null,
        sla_deadline: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },

      {
        user_id: getUser(),
        category_id: getCat('Administrative'),
        problem: 'شكوى تعدي لفظي',
        location: 'Faculty',
        since: new Date(),
        ai_summary: 'Verbal abuse complaint',
        priority: 1,
        status: 'resolved',
        resolution_text: 'تم التحقيق واتخاذ إجراء إداري.',
        resolved_at: new Date(),
        sla_deadline: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // 📅 Registration / Schedule
      {
        user_id: getUser(),
        category_id: getCat('Registration'),
        problem: 'مختارش القسم المسجل له',
        location: 'Portal',
        since: new Date(),
        ai_summary: 'Wrong department registration',
        priority: 2,
        status: 'resolved',
        resolution_text: 'تم تعديل القسم بنجاح.',
        resolved_at: new Date(),
        sla_deadline: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },

      {
        user_id: getUser(),
        category_id: getCat('Schedule'),
        problem: 'مشكلة في عدد الساعات في الموقع',
        location: 'Portal',
        since: new Date(),
        ai_summary: 'Credit hours mismatch',
        priority: 1,
        status: 'in_progress',
        resolution_text: null,
        resolved_at: null,
        sla_deadline: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // 🎓 Exams
      {
        user_id: getUser(),
        category_id: getCat('MidtermExams'),
        problem: 'جدول الامتحانات فيه مشكلة',
        location: 'Faculty website',
        since: new Date(),
        ai_summary: 'Exam schedule issue',
        priority: 2,
        status: 'resolved',
        resolution_text: 'تم تحديث الجدول وإعادة نشره.',
        resolved_at: new Date(),
        sla_deadline: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // 🎓 Graduation
      {
        user_id: getUser(),
        category_id: getCat('Graduation Certificates'),
        problem: 'شهادة التخرج اتأخرت',
        location: 'Registry',
        since: new Date(),
        ai_summary: 'Delayed certificate',
        priority: 2,
        status: 'pending',
        resolution_text: null,
        resolved_at: null,
        sla_deadline: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }


    ]);

  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('Complaints', null, {});
  }
};
