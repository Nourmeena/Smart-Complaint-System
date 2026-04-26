const express = require('express');
const app = express(); // 1. هنا بنعرف الـ app اللي كان ناقص

// استدعاء ملف الـ Routes بتاع الطالب
const studentRoutes = require('./Student/routes/route'); 

// Middlewares أساسية
app.use(express.json()); // 2. مهم جداً عشان السيرفر يفهم الـ JSON اللي هنبعته من Thunder Client

// تفعيل الـ Routes
app.use('/api/complaints', studentRoutes);

// تشغيل السيرفر
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});