import { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import AuthContext from '../context/AuthContext';
import { FaFileInvoiceDollar, FaDownload, FaEye, FaSearch } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const MyPayslips = () => {
    const { user } = useContext(AuthContext);
    const [payslips, setPayslips] = useState([
        { _id: 'sample1', month: 'January', year: 2025, status: 'Paid', netSalary: 45000, grossSalary: 50000, totalDeductions: 5000, date: '2025-01-31' },
        { _id: 'sample2', month: 'December', year: 2024, status: 'Paid', netSalary: 45000, grossSalary: 50000, totalDeductions: 5000, date: '2024-12-31' },
        { _id: 'sample3', month: 'November', year: 2024, status: 'Paid', netSalary: 44500, grossSalary: 49500, totalDeductions: 5000, date: '2024-11-30' }
    ]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyPayslips();
    }, []);

    const fetchMyPayslips = async () => {
        try {
            const { data } = await api.get('/employee/payslips');
            if (data && data.length > 0) {
                setPayslips(data);
            }
        } catch (error) {
            console.error("Error fetching payslips", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">My Payslips</h1>
                    <p className="text-gray-500 mt-1">View and download your monthly salary statements</p>
                </div>
                <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by year..."
                        className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition w-full md:w-64 bg-white shadow-sm"
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Month & Year</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Gross Salary</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Deductions</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Net Payout</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {payslips.map((slip) => (
                                <tr key={slip._id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                                <FaFileInvoiceDollar />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800">{slip.month} {slip.year}</p>
                                                <p className="text-[10px] text-gray-400 uppercase font-black">Regular Payout</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        ₹ {slip.grossSalary?.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500">
                                        ₹ {slip.totalDeductions?.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <p className="font-bold text-green-600">₹ {slip.netSalary?.toLocaleString()}</p>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-md bg-green-50 text-green-700 border border-green-100">
                                            {slip.status || 'Paid'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link
                                                to={`/payslip/${slip._id}`}
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                title="View Payslip"
                                            >
                                                <FaEye />
                                            </Link>
                                            <button
                                                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                                                title="Download PDF"
                                            >
                                                <FaDownload />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {payslips.length === 0 && !loading && (
                    <div className="py-20 text-center bg-gray-50/50">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100">
                            <FaFileInvoiceDollar className="text-gray-300 text-3xl" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">No payslips found</h3>
                        <p className="text-gray-500 max-w-xs mx-auto text-sm">Your monthly payslips will appear here once they are processed by the HR team.</p>
                    </div>
                )}
            </div>

            {/* Assistance Card */}
            <div className="bg-gradient-to-br from-blue-700 to-indigo-800 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-xl font-bold mb-2">Detailed Earnings Report</h2>
                    <p className="text-blue-100 text-sm max-w-lg mb-6">Need a detailed breakdown of your annual earnings and tax deductions? Download your consolidated statement here.</p>
                    <button className="bg-white text-indigo-900 px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-blue-50 transition shadow-lg">
                        Download YTD Summary
                    </button>
                </div>
                <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-12 translate-y-12">
                    <FaFileInvoiceDollar size={200} />
                </div>
            </div>
        </div>
    );
};

export default MyPayslips;
