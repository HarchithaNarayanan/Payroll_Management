const Payroll = require('../models/Payroll');

// @desc    Generate Bank Transfer CSV
// @route   GET /api/payroll/bank-transfer
// @access  Private (Payroll Admin)
const generateBankFile = async (req, res) => {
    try {
        const { month, year } = req.query;

        if (!month || !year) {
            return res.status(400).json({ message: 'Please provide month and year' });
        }

        const payrolls = await Payroll.find({
            month,
            year,
            status: 'Approved' // Only approved payrolls
        })
            .populate({
                path: 'employee',
                populate: { path: 'user', select: 'name' }
            });

        if (!payrolls || payrolls.length === 0) {
            return res.status(404).json({ message: 'No approved payroll records found for this period' });
        }

        // CSV Header
        let csv = 'Employee ID,Name,Account Number,IFSC Code,Bank Name,Amount,Remarks\n';

        // CSV Rows
        payrolls.forEach(record => {
            const emp = record.employee;
            const payment = emp.paymentDetails || {};

            const row = [
                emp.employeeId,
                emp.user ? emp.user.name : 'N/A', // Assuming populate works deep or handled elsewhere, but Payroll model has employee ref which is Employee model, Employee has user ref. We need to populate user too.
                payment.accountNumber || 'N/A',
                payment.ifscCode || 'N/A',
                payment.bankName || 'N/A',
                record.netSalary,
                `Salary for ${month}/${year}`
            ].join(',');

            csv += row + '\n';
        });

        const filename = `Bank_Advice_${month}_${year}.csv`;

        res.header('Content-Type', 'text/csv');
        res.header('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(csv);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { generateBankFile };
