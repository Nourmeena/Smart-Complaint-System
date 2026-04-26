const { sequelize } = require('./models');

async function fixTable() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to database...');

        // 1. محاولة إضافة عمود createdAt
        try {
            await sequelize.query(`ALTER TABLE ComplaintHistories ADD COLUMN createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;`);
            console.log('✔ Column "createdAt" added.');
        } catch (err) {
            console.log('ℹ "createdAt" might already exist, skipping...');
        }

        // 2. محاولة إضافة عمود updatedAt
        try {
            await sequelize.query(`ALTER TABLE ComplaintHistories ADD COLUMN updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;`);
            console.log('✔ Column "updatedAt" added.');
        } catch (err) {
            console.log('ℹ "updatedAt" might already exist, skipping...');
        }

        console.log('🚀 DB Fix process finished!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Critical Error:', error.message);
        process.exit(1);
    }
}

fixTable();