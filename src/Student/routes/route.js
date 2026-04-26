const express = require('express');
const router = express.Router();
const controller = require('../controllers/studentController');
const validator = require('../middlewares/studentValidator');

// 1. إنشاء شكوى
router.post('/', validator.validateComplaint, controller.submitComplaint);

// 2. عرض شكاوى الطالب - 🎯 التعديل هنا: الاسم مطابق للكنترولر والباراميتر
router.get('/student/:student_id', controller.getMyComplaints); 

// 3. تفاصيل شكوى
router.get('/:id', controller.getDetails);

// 4. تقديم تظلم
router.post('/:id/appeal', validator.validateAppeal, controller.submitAppeal);

module.exports = router;