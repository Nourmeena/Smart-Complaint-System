const studentService = require('../services/studentService');

exports.submitComplaint = async (req, res) => {
    try {
        const result = await studentService.submitNewComplaint(req.body);
        res.status(201).json(result);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getMyComplaints = async (req, res) => {
    try {
const complaints = await studentService.getStudentComplaints(req.params.student_id);        res.status(200).json({ complaints });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getDetails = async (req, res) => {
    try {
        const data = await studentService.getComplaintById(req.params.id);
        if (!data) return res.status(404).json({ success: false, message: "الشكوى غير موجودة." });
        
        res.status(200).json({ 
            complaint: data, 
            student_data: data.User ? data.User.Student : null,
            faculty: data.User?.Student?.Faculty?.name || "N/A",
            history: data.ComplaintHistories 
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.submitAppeal = async (req, res) => {
    try {
        // افترضنا أن user_id سيتم أخذه من الـ Body أو الـ Auth middleware
        const result = await studentService.createAppeal(req.params.id, req.body.reason, req.body.user_id);
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};