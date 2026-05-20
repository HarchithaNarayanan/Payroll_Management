const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');

const logAction = async ({ userId, role, action, description, ip }) => {
    try {
        await AuditLog.create({
            user: userId,
            role,
            action,
            description,
            ip
        });
    } catch (error) {
        console.error('Audit Log Error:', error);
    }
};

const notifyUser = async ({ userId, message, type = 'info' }) => {
    try {
        await Notification.create({
            userId,
            message,
            type
        });
    } catch (error) {
        console.error('Notification Error:', error);
    }
};

const notifyAllEmployees = async (message, type = 'info') => {
    try {
        const User = require('../models/User');
        const employees = await User.find({ role: 'Employee' });

        const notifications = employees.map(emp => ({
            userId: emp._id,
            message,
            type
        }));

        await Notification.insertMany(notifications);
    } catch (error) {
        console.error('Bulk Notification Error:', error);
    }
};

module.exports = {
    logAction,
    notifyUser,
    notifyAllEmployees
};
