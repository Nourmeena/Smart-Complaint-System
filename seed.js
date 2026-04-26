const { User, Category, Faculty, Student, sequelize } = require('./models');

async function seedData() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected! Seeding the entire student chain...');

        // 1. زرع الكلية (الأساس)
        const [faculty] = await Faculty.findOrCreate({
            where: { id: 1 },
            defaults: { 
                name: 'Faculty of Computers and Artificial Intelligence',
                email_domain: '@fci-cu.edu.eg'
            }
        });
        console.log('✔ Faculty 1 (FCAI) is ready!');

        // 2. زرع القسم (Category)
        await Category.findOrCreate({
            where: { id: 1 },
            defaults: { 
                name: 'General Complaints',
                faculty_id: faculty.id,
                sla_hours: 48,
                is_active: true
            }
        });
        console.log('✔ Category 1 is ready!');

        // 3. زرع بيانات الطالب (Student) - دي الحلقة اللي كانت ناقصة
        const [student] = await Student.findOrCreate({
            where: { id: 1 },
            defaults: {
                faculty_id: faculty.id,
                department: 'Information Systems',
                student_number: '20260001'
            }
        });
        console.log('✔ Student record (Academic Info) is ready!');

        // 4. زرع اليوزر (User) وربطه بالطالب
        // ملحوظة: لو العمود عندك اسمه password_hash غيريه هنا
        await User.findOrCreate({
            where: { id: 1 },
            defaults: {
                full_name: 'Fatma Atef',
                email: 'fatma@example.com',
                password: 'password123', // تأكدي لو اسم العمود password_hash في الداتا بيز
                role: 'student',
                student_id: student.id // 🎯 الربط المباشر بسجل الطالب
            }
        });
        console.log('✔ User 1 (Fatma) is linked to Student!');

        console.log('🚀 ALL DONE! The chain is complete: User -> Student -> Faculty.');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error during seeding:', error.message);
        if (error.parent) console.error('🔍 SQL Details:', error.parent.sqlMessage);
        process.exit(1);
    }
}

seedData();