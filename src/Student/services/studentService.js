const axios = require('axios');
const { 
    Complaint, User, Student, Category, 
    PriorityRules, Appeal, Faculty, ComplaintHistory, sequelize 
} = require('../../../models');

exports.submitNewComplaint = async (data) => {
    // استخدام Transaction لضمان حفظ الشكوى والـ History معاً أو لا شيء
    const t = await sequelize.transaction();
    try {
        // جلب القواعد من الداتا بيز (للتأكد من أن الاتصال سليم)
        const rules = await PriorityRules.findAll();

        /* ⚠️ تم تعطيل الاتصال بالـ AI مؤقتاً لأن سيرفر البايثون غير متاح حالياً.
        سيتم تفعيل هذا الجزء عند الربط النهائي.
        
        const aiResponse = await axios.post('http://localhost:5000/api/chat/priority', {
            text: data.problem,
            category: data.category_id,
            rules: rules
        });
        */

        // أولوية افتراضية (Normal) لحين تفعيل الـ AI
        const priorityFromAI = 3; 

        // 1. إنشاء الشكوى في جدول Complaints
        const complaint = await Complaint.create({
            user_id: data.user_id,
            category_id: data.category_id,
            problem: data.problem,
            location: data.location,
            since: data.since,
            ai_summary: data.ai_summary || "جاري التحليل...",
            priority: priorityFromAI, 
            status: 'pending'
        }, { transaction: t });

        // 2. تسجيل أول حركة في الـ History (تم الإنشاء)
        await ComplaintHistory.create({
            complaint_id: complaint.id,
            status: 'pending',
            changed_by: data.user_id, // الطالب هو من أنشأها
            changed_at: new Date()
        }, { transaction: t });

        // تثبيت العملية بنجاح
        await t.commit();
        
        return { 
            success: true, 
            complaint_id: complaint.id, 
            priority: complaint.priority 
        };

    } catch (error) {
        // في حالة حدوث أي خطأ، يتم التراجع عن كل ما حدث في الداتا بيز
        if (t) await t.rollback();
        console.error("Error in submitNewComplaint:", error);
        throw error;
    }
};

exports.getStudentComplaints = async (user_id) => {
    return await Complaint.findAll({
        where: { user_id },
        include: [{ model: Category, attributes: ['name'] }],
        order: [['createdAt', 'DESC']]
    });
};

exports.getComplaintById = async (id) => {
    return await Complaint.findByPk(id, {
        include: [
            { 
                model: User, 
                attributes: ['full_name'], 
                include: [{ 
                    model: Student, 
                    attributes: ['department', 'student_number'],
                    include: [{ model: Faculty, attributes: ['name'] }]
                }] 
            },
            { model: Category, attributes: ['name', 'sla_hours'] },
            { model: Appeal },
            { model: ComplaintHistory, order: [['changed_at', 'ASC']] }
        ]
    });
};

exports.createAppeal = async (complaintId, reason, userId) => {
    const t = await sequelize.transaction();
    try {
        await Appeal.create({ 
            complaint_id: complaintId, 
            reason: reason,
            status: 'pending'
        }, { transaction: t });
        
        await Complaint.update({ status: 'appealed' }, { where: { id: complaintId }, transaction: t });

        // تسجيل حركة التظلم في الـ History
        await ComplaintHistory.create({
            complaint_id: complaintId,
            status: 'appealed',
            changed_by: userId,
            changed_at: new Date()
        }, { transaction: t });

        await t.commit();
        return { success: true };
    } catch (error) {
        if (t) await t.rollback();
        throw error;
    }
};