exports.validateComplaint = (req, res, next) => {
    const { user_id, category_id, problem, location, since } = req.body;
    if (!user_id || !category_id || !problem || !location || !since) {
        return res.status(400).json({ success: false, message: "بيانات الشكوى غير مكتملة." });
    }
    next();
};

exports.validateAppeal = (req, res, next) => {
    if (!req.body.reason) {
        return res.status(400).json({ success: false, message: "سبب التظلم مطلوب." });
    }
    next();
};