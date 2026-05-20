const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./src/config/db');

dotenv.config();

connectDB();

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
// app.use(morgan('dev'));

app.get('/', (req, res) => {
    res.send('API is running...');
});

app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/statutory', require('./src/routes/statutoryRoutes'));
app.use('/api/employees', require('./src/routes/employeeRoutes'));
app.use('/api/salary', require('./src/routes/salaryRoutes'));
app.use('/api/attendance', require('./src/routes/attendanceRoutes'));
app.use('/api/payroll', require('./src/routes/payrollRoutes'));
app.use('/api/payroll-profile', require('./src/routes/payrollProfileRoutes'));
app.use('/api/tax', require('./src/routes/taxRoutes'));
app.use('/api/employee', require('./src/routes/essRoutes'));
app.use('/api/notifications', require('./src/routes/notificationRoutes'));
app.use('/api/audit-logs', require('./src/routes/auditLogRoutes'));
app.use('/api/reports', require('./src/routes/reportRoutes'));
app.use('/api/seed', require('./src/routes/seedRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
// Force restart for env update
