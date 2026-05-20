import { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import AuthContext from '../context/AuthContext';
import { generatePDF } from '../utils/pdfGenerator';
import PayslipDocument from '../components/PayslipDocument';
import { createRoot } from 'react-dom/client';

const PayrollProcess = () => {
    const { user } = useContext(AuthContext);
    const canManagePayroll = user?.role === 'Super Admin' || user?.role === 'Payroll Admin';
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [payrolls, setPayrolls] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchPayroll();
    }, [month, year]);

    const fetchPayroll = async () => {
        try {
            const { data } = await api.get('/payroll', { params: { month, year } });
            setPayrolls(data);
        } catch (error) {
            console.error(error);
        }
    };

    // NEW FUNCTION
    const disbursePayroll = async () => {
        if (!confirm('Are you sure you want to mark these salaries as PAID? This action cannot be undone.')) return;
        try {
            const { data } = await api.put('/payroll/disburse', { month, year });
            setMessage(data.message);
            fetchPayroll();
        } catch (error) {
            console.error(error);
            setMessage('Error disbursing payroll');
        }
    };

    const downloadBankAdvice = async () => {
        try {
            const response = await api.get('/payroll/bank-transfer', {
                params: { month, year },
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Bank_Advice_${month}_${year}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error(error);
            setMessage('Error downloading Bank Advice');
        }
    };

    const downloadPayslipPDF = async (payrollId) => {
        try {
            const { data: payslip } = await api.get(`/payroll/payslip/${payrollId}`);

            // Create a hidden container to render the payslip
            const container = document.createElement('div');
            container.style.position = 'absolute';
            container.style.left = '-9999px';
            container.style.top = '0';
            document.body.appendChild(container);

            const root = createRoot(container);
            root.render(
                <div id={`payslip-${payrollId}`}>
                    <PayslipDocument payslip={payslip} id={`payslip-content-${payrollId}`} />
                </div>
            );

            // Wait specifically for the element to be present in DOM
            await new Promise(resolve => setTimeout(resolve, 500));

            await generatePDF(`payslip-content-${payrollId}`, `Payslip_${payslip.employee.employeeId}_${month}_${year}.pdf`);

            // Cleanup
            setTimeout(() => {
                root.unmount();
                document.body.removeChild(container);
            }, 100);

        } catch (error) {
            console.error('Error downloading payslip', error);
            setMessage('Error generating payslip PDF');
        }
    };


    const runPayroll = async () => {
        setLoading(true);
        try {
            const { data } = await api.post('/payroll/run', { month, year });
            setMessage(data.message);
            fetchPayroll();
        } catch (error) {
            console.error('Payroll error:', error);
            setMessage(error.response?.data?.message || 'Error running payroll');
        } finally {
            setLoading(false);
        }
    };

    const approvePayroll = async () => {
        if (!confirm('Are you sure? This will lock the payroll entries.')) return;
        try {
            await api.put('/payroll/approve', { month, year });
            setMessage('Payroll Approved Successfully');
            fetchPayroll();
        } catch (error) {
            setMessage('Error approving payroll');
        }
    };

    const unlockPayroll = async () => {
        if (!confirm('Are you sure you want to unlock? This will revert status to Draft.')) return;
        try {
            await api.put('/payroll/unlock', { month, year });
            setMessage('Payroll Unlocked. Status reverted to Draft.');
            fetchPayroll();
        } catch (error) {
            setMessage('Error unlocking payroll');
        }
    };

    const getTotalNet = () => payrolls.reduce((acc, curr) => acc + curr.netSalary, 0);

    return (
        <div className="container px-4 py-8 mx-auto animate-fade-in">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-green-100 rounded-lg text-green-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Process Payroll</h1>
                    <p className="text-gray-500">Run, approve, and finalize monthly salaries</p>
                </div>
            </div>

            {message && <div className="p-4 mb-6 bg-blue-50 text-blue-700 border-l-4 border-blue-500 rounded-lg shadow-sm flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                {message}
            </div>}

            {/* Controls */}
            <div className="mb-6 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="flex gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                            <select value={month} onChange={e => setMonth(e.target.value)} className="w-[140px] border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 p-2.5">
                                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                    <option key={m} value={m}>Month {m}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                            <select value={year} onChange={e => setYear(e.target.value)} className="w-[120px] border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 p-2.5">
                                <option value="2024">2024</option>
                                <option value="2025">2025</option>
                                <option value="2026">2026</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        {canManagePayroll && (
                            <button
                                onClick={runPayroll}
                                disabled={loading || (payrolls.length > 0 && payrolls[0].status === 'Approved')}
                                className={`px-6 py-2.5 rounded-lg text-white font-medium shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center gap-2 ${loading || (payrolls.length > 0 && payrolls[0].status === 'Approved')
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30'
                                    }`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                {loading ? 'Processing...' : 'Run Payroll'}
                            </button>
                        )}

                        {canManagePayroll && payrolls.length > 0 && payrolls[0].status !== 'Approved' && (
                            <button
                                onClick={approvePayroll}
                                className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-lg shadow-green-500/30 flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                Approve Payroll
                            </button>
                        )}

                        {payrolls.length > 0 && payrolls[0].status === 'Approved' && (
                            <>
                                <button
                                    onClick={downloadBankAdvice}
                                    className="px-6 py-2.5 bg-indigo-50 text-indigo-700 rounded-lg font-medium hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center gap-2 border border-indigo-200"
                                    title="Download Bank Transfer CSV"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                    Bank Advice
                                </button>
                                <div className="flex items-center gap-2">
                                    {canManagePayroll && (
                                        <button
                                            onClick={disbursePayroll}
                                            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-lg shadow-blue-500/30 flex items-center gap-2"
                                            title="Mark as Paid"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                            Mark as Paid
                                        </button>
                                    )}
                                    <span className="px-6 py-2.5 bg-green-100 text-green-700 rounded-lg font-semibold flex items-center gap-2 border border-green-200">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                        Approved
                                    </span>
                                    {canManagePayroll && (
                                        <button
                                            onClick={unlockPayroll}
                                            className="px-4 py-2 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 rounded-lg font-medium transition flex items-center gap-2 border border-yellow-300"
                                            title="Revert to Draft"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"></path></svg>
                                            Unlock
                                        </button>
                                    )}
                                </div>
                            </>
                        )}

                        {payrolls.length > 0 && payrolls[0].status === 'Paid' && (
                            <div className="flex items-center gap-2">
                                <span className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-semibold flex items-center gap-2 border border-gray-200">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                    Paid
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <p className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-1">Total Employees</p>
                    <p className="text-3xl font-bold text-gray-800">{payrolls.length}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <p className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-1">Total Net Pay</p>
                    <p className="text-3xl font-bold text-gray-800">₹{getTotalNet().toLocaleString()}</p>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {payrolls.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No Payroll Data</h3>
                        <p className="text-gray-500 mt-1">Run payroll for this month to generate records.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Days (P/W)</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">OT Hours</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Gross</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Deductions</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Net Pay</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {payrolls.map(item => (
                                    <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {item.employee?.user?.name || item.employee?.employeeId || 'Unknown Employee'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {item.presentDays} / {item.workingDays}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 font-medium">
                                            {item.overtimeHours || 0} hrs
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            ₹{item.grossSalary.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                                            -₹{item.totalDeductions.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-700">
                                            ₹{item.netSalary.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${item.status === 'Approved' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                                }`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
                                            <a href={`/payslip/${item._id}`} target="_blank" className="text-indigo-600 hover:text-indigo-900 hover:underline">View</a>
                                            <button
                                                onClick={() => downloadPayslipPDF(item._id)}
                                                className="text-gray-600 hover:text-gray-900 hover:underline flex items-center gap-1"
                                                title="Download PDF"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                                Download
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PayrollProcess;
