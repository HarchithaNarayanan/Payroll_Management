import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { FaUserEdit, FaCheckCircle, FaTimesCircle, FaUsers, FaEye } from 'react-icons/fa';
import AuthContext from '../context/AuthContext';

const PayrollProfileList = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user: currentUser } = useContext(AuthContext);

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch all employees
            const { data } = await api.get('/employees');

            // Ensure data is an array
            if (Array.isArray(data)) {
                setEmployees(data);
            } else {
                console.error('Expected array from /employees, got:', data);
                setEmployees([]);
                setError('Invalid data format received from server.');
            }
        } catch (err) {
            console.error('Failed to fetch employees:', err);
            setError('Failed to load employee list. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    if (error) return (
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-2xl mx-auto max-w-4xl mt-12">
            <div className="flex items-center gap-4">
                <div className="bg-red-100 p-2 rounded-lg text-red-600">
                    <FaTimesCircle />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-red-800">Error Loading Profiles</h3>
                    <p className="text-red-600 text-sm">{error}</p>
                </div>
            </div>
            <button
                onClick={fetchEmployees}
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-700 transition"
            >
                Try Again
            </button>
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in pb-12">
            <div className="flex justify-between items-center">
                <div className="text-left">
                    <h1 className="text-3xl font-bold text-gray-800">Employee Payroll Profiles</h1>
                    <p className="text-gray-500 mt-1">Configure individual salary structures and payment settings</p>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Employee ID</th>
                                <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Full Name</th>
                                <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Department</th>
                                <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Configuration</th>
                                <th className="px-6 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {employees.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center text-gray-300">
                                            <FaUsers size={48} className="mb-4 opacity-20" />
                                            <p className="text-sm font-medium italic">No employees found in your organization.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : employees.map((emp) => (
                                <tr key={emp._id} className="hover:bg-indigo-50/30 transition-all group">
                                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm font-bold text-indigo-600">
                                        {emp.employeeId}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-left">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white text-xs font-black shadow-lg shadow-indigo-100">
                                                {emp.user?.name?.charAt(0) || '?'}
                                            </div>
                                            <div>
                                                <span className="text-sm font-bold text-gray-800 block">{emp.user?.name || 'N/A'}</span>
                                                <span className="text-[10px] text-gray-400 block tracking-tight">{emp.user?.email || 'No email set'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-left font-medium text-gray-500">
                                        {emp.department || 'General'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-left">
                                        {emp.salaryStructure ? (
                                            <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-600 text-[10px] font-black px-2.5 py-1 rounded-full border border-green-100">
                                                <FaCheckCircle size={10} /> CONFIGURED
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-600 text-[10px] font-black px-2.5 py-1 rounded-full border border-amber-100">
                                                <FaTimesCircle size={10} /> NOT SET
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <Link
                                            to={`/payroll-profile/${emp._id}`}
                                            className="inline-flex items-center gap-2 bg-white text-indigo-600 border border-indigo-100 px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-600 hover:text-white hover:shadow-lg hover:shadow-indigo-100 transition-all active:scale-95"
                                        >
                                            {currentUser?.role === 'Payroll Admin' ? <><FaEye size={14} /> View</> : <><FaUserEdit size={14} /> Configure</>}
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div >
    );
};

export default PayrollProfileList;
