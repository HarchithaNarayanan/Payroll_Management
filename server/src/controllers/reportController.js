const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');
const PayrollProfile = require('../models/PayrollProfile');
const AuditLog = require('../models/AuditLog');

// @desc    Get Payroll Summary (Gross, Deductions, Net)
// @route   GET /api/reports/summary
// @access  Private (Admin/Finance)
const getPayrollSummary = async (req, res) => {
    // RBAC: HR Admin should not see full financial summary totals
    if (req.user.role === 'HR Admin') {
        return res.status(403).json({ message: 'HR Admin restricted from viewing aggregate financial summary' });
    }

    let { month, year } = req.query;

    if (isNaN(month)) {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        month = months.indexOf(month) + 1;
    }

    const payrolls = await Payroll.find({
        organization: req.user.organization,
        month: parseInt(month),
        year: parseInt(year),
        status: 'Approved'
    });

    const summary = payrolls.reduce((acc, p) => {
        acc.totalGross += p.grossSalary;
        acc.totalNet += p.netSalary;
        p.deductions.forEach(d => acc.totalDeductions += d.amount);
        p.earnings.forEach(e => {
            if (e.name === 'Bonus') acc.totalBonuses += e.amount;
        });
        return acc;
    }, { totalGross: 0, totalNet: 0, totalDeductions: 0, totalBonuses: 0 });

    res.json(summary);
};

// @desc    Get CTC Analysis Report
// @route   GET /api/reports/ctc
// @access  Private (Admin/HR)
const getCTCAnalysis = async (req, res) => {
    const employees = await Employee.find({
        organization: req.user.organization,
        status: 'Active'
    }).populate('user', 'name');

    const profiles = await PayrollProfile.find({
        organization: req.user.organization
    });

    const report = employees.map(emp => {
        const profile = profiles.find(p => p.employee.toString() === emp._id.toString());
        const monthlyGross = profile?.grossSalary || 0;

        return {
            employeeId: emp.employeeId,
            name: emp.user?.name || 'N/A',
            designation: emp.designation,
            department: emp.department,
            monthlyGross: monthlyGross,
            annualCTC: monthlyGross * 12
        };
    });

    res.json(report);
};

// @desc    Get Department-wise Payroll Report
// @route   GET /api/reports/department
// @access  Private (Admin/Finance/HR)
const getDepartmentReport = async (req, res) => {
    let { month, year } = req.query;

    if (isNaN(month)) {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        month = months.indexOf(month) + 1;
    }

    const payrolls = await Payroll.find({
        organization: req.user.organization,
        month: parseInt(month),
        year: parseInt(year),
        status: 'Approved'
    }).populate({
        path: 'employee',
        select: 'department'
    });

    const deptBreakdown = payrolls.reduce((acc, p) => {
        const dept = p.employee?.department || 'Unassigned';
        if (!acc[dept]) {
            acc[dept] = { department: dept, totalSalary: 0, employeeCount: 0 };
        }
        acc[dept].totalSalary += p.netSalary;
        acc[dept].employeeCount += 1;
        return acc;
    }, {});

    res.json(Object.values(deptBreakdown));
};

// @desc    Get System Audit Logs
// @route   GET /api/reports/audit-logs
// @access  Private (Super Admin)
const getAuditLogs = async (req, res) => {
    const logs = await AuditLog.find({
        organization: req.user.organization
    })
        .populate('user', 'name role')
        .sort({ createdAt: -1 })
        .limit(100);

    res.json(logs);
};

// @desc    Export Report Data as CSV
// @route   GET /api/reports/export
// @access  Private (Admin/Finance)
const exportReport = async (req, res) => {
    const { type, month, year } = req.query;
    let data = [];
    let filename = `report_${type}.csv`;

    if (type === 'summary') {
        let m = month;
        if (isNaN(m)) {
            const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            m = months.indexOf(m) + 1;
        }
        const payrolls = await Payroll.find({
            organization: req.user.organization,
            month: parseInt(m),
            year: parseInt(year),
            status: 'Approved'
        }).populate({
            path: 'employee',
            populate: { path: 'user', select: 'name' }
        });

        data = payrolls.map(p => ({
            EmployeeID: p.employee.employeeId,
            Name: p.employee.user?.name || 'N/A',
            Gross: p.grossSalary,
            Deductions: p.totalDeductions || 0,
            NetPay: p.netSalary,
            Status: p.status
        }));
    } else if (type === 'ctc') {
        const employees = await Employee.find({ organization: req.user.organization, status: 'Active' }).populate('user', 'name');
        const profiles = await PayrollProfile.find({ organization: req.user.organization });

        data = employees.map(emp => {
            const profile = profiles.find(p => p.employee.toString() === emp._id.toString());
            return {
                EmployeeID: emp.employeeId,
                Name: emp.user?.name || 'N/A',
                Department: emp.department,
                Designation: emp.designation,
                MonthlyGross: profile?.grossSalary || 0,
                AnnualCTC: (profile?.grossSalary || 0) * 12
            };
        });
    }

    if (data.length === 0) {
        return res.status(404).json({ message: 'No data found for export' });
    }

    // Simple CSV generator
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj => Object.values(obj).join(',')).join('\n');
    const csv = `${headers}\n${rows}`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.status(200).send(csv);
};

// @desc    Get PF Report Data
const getPFReport = async (req, res) => {
    const { month, year } = req.query;
    const payrolls = await Payroll.find({
        organization: req.user.organization,
        month,
        year,
        status: 'Approved'
    }).populate({
        path: 'employee',
        populate: { path: 'user', select: 'name' }
    });

    const reportData = payrolls.map(p => {
        const pfDeduction = p.deductions.find(d => d.name === 'Provident Fund')?.amount || 0;
        return {
            EmployeeId: p.employee.employeeId,
            Name: p.employee.user ? p.employee.user.name : 'N/A',
            GrossWages: p.grossSalary,
            PF_Deduction: pfDeduction,
            Employer_Contribution: pfDeduction
        };
    });
    res.json(reportData);
};

// @desc    Get ESI Report Data
const getESIReport = async (req, res) => {
    const { month, year } = req.query;
    const payrolls = await Payroll.find({
        organization: req.user.organization,
        month,
        year,
        status: 'Approved'
    }).populate({
        path: 'employee',
        populate: { path: 'user', select: 'name' }
    });

    const reportData = payrolls.map(p => {
        const esiDeduction = p.deductions.find(d => d.name === 'ESI')?.amount || 0;
        return {
            EmployeeId: p.employee.employeeId,
            Name: p.employee.user ? p.employee.user.name : 'N/A',
            GrossWages: p.grossSalary,
            ESI_Deduction: esiDeduction,
            Employer_Contribution: Math.round(esiDeduction * 3.25 / 0.75)
        };
    });
    res.json(reportData);
};

module.exports = {
    getPFReport,
    getESIReport,
    getPayrollSummary,
    getCTCAnalysis,
    getDepartmentReport,
    getAuditLogs,
    exportReport
};
