import { useContext, useEffect, useState } from 'react';
import AuthContext from '../context/AuthContext';
import api from '../utils/api';
import {
    FaUsers, FaMoneyBillWave, FaCalendarCheck, FaClock,
    FaArrowRight, FaFileInvoiceDollar, FaChartLine,
    FaUserTie, FaBriefcase, FaHandHoldingUsd, FaShieldAlt, FaUniversity, FaCheckCircle
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import EmployeeDashboardPage from './EmployeeDashboard';

// --- Shared Components ---
const StatCard = ({ title, value, icon: Icon, color, link, subtext }) => (
    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 transition-transform transform hover:-translate-y-1 hover:shadow-lg relative overflow-hidden" style={{ borderColor: color }}>
        <div className="flex items-center justify-between relative z-10">
            <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-2">{value}</h3>
                {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
            </div>
            <div className={`p-4 rounded-full bg-opacity-10`} style={{ backgroundColor: `${color}20` }}>
                <Icon className="text-2xl" style={{ color: color }} />
            </div>
        </div>
        {link && (
            <div className="mt-4 pt-4 border-t border-gray-100 relative z-10">
                <Link to={link} className="text-sm font-medium flex items-center hover:underline" style={{ color: color }}>
                    View Details <FaArrowRight className="ml-2 w-3 h-3" />
                </Link>
            </div>
        )}
        {/* Decorator */}
        <div className="absolute -bottom-4 -right-4 text-9xl opacity-5 pointer-events-none" style={{ color: color }}>
            <Icon />
        </div>
    </div>
);

const QuickAction = ({ title, desc, link, icon: Icon, color }) => (
    <Link to={link} className="group relative bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden">
        <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110`}>
            <Icon size={64} color={color} />
        </div>
        <div className="relative z-10">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4`} style={{ backgroundColor: `${color}15` }}>
                <Icon size={24} color={color} />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">{title}</h3>
            <p className="text-sm text-gray-500">{desc}</p>
        </div>
    </Link>
);

const WelcomeBanner = ({ user, icon: Icon = FaBriefcase }) => (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden mb-8">
        <div className="relative z-10 max-w-2xl">
            <h2 className="text-2xl font-bold mb-2">Welcome back, {user.name}!</h2>
            <p className="text-blue-100 mb-6">You are logged in as <span className="font-semibold">{user.role}</span>.</p>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-12 translate-y-12">
            <Icon size={200} />
        </div>
    </div>
);

// --- Role Specific Dashboards ---

const AdminDashboard = ({ user }) => {
    const [stats, setStats] = useState({ employees: 0, payrollCost: 0, pendingTasks: 0 });
    const [profile, setProfile] = useState(null);
    const [declarations, setDeclarations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const emps = await api.get('/employees');
                setStats({
                    employees: emps.data ? emps.data.length : 0,
                    pendingTasks: 3,
                    payrollCost: 'Running'
                });

                // Also fetch personal payroll profile for the admin themselves
                const profileRes = await api.get('/employees/me');
                setProfile(profileRes.data);

                // If HR Admin, fetch all declarations
                if (user.role === 'HR Admin') {
                    const decRes = await api.get('/tax/all');
                    setDeclarations(decRes.data);
                }
            } catch (error) {
                console.error('Error fetching admin dashboard data', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user.role]);

    return (
        <div className="space-y-8 animate-fade-in">
            <WelcomeBanner user={user} icon={FaUserTie} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Employees" value={stats.employees} icon={FaUsers} color="#4F46E5" link="/employees" subtext="Active workforce" />
                <StatCard title="Payroll Status" value={stats.payrollCost} icon={FaMoneyBillWave} color="#10B981" link="/payroll" subtext="Current cycle" />
                <StatCard title="Statutory" value="Active" icon={FaFileInvoiceDollar} color="#F59E0B" link="/statutory" subtext="PF, ESI & PT" />
            </div>

            {/* Admin's Personal Payroll Profile */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">My Payroll Profile</h2>
                        <p className="text-sm text-gray-500">Your tax and salary settings</p>
                    </div>
                    <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                        <FaShieldAlt className="w-5 h-5" />
                    </div>
                </div>
                <div className="p-6">
                    {loading ? (
                        <div className="animate-pulse flex space-x-4">
                            <div className="flex-1 space-y-4 py-1">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-200 rounded"></div>
                                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                            </div>
                        </div>
                    ) : profile ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Tax Regime</p>
                                <p className="text-sm font-bold text-gray-700 bg-indigo-50 inline-block px-2 py-1 rounded">
                                    {profile.payrollProfile?.taxRegime || profile.taxRegime || 'Not Set'} Regime
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Salary Structure</p>
                                <p className="text-sm font-bold text-gray-700">
                                    {profile.salaryStructure?.name || 'Standard Structure'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Bank Details</p>
                                <div className="flex items-center gap-2">
                                    <FaUniversity className="text-gray-400 text-xs" />
                                    <p className="text-sm font-bold text-gray-700">
                                        {(profile.payrollProfile?.bankDetails?.bankName || profile.paymentDetails?.bankName) || 'N/A'}
                                        (...{(profile.payrollProfile?.bankDetails?.accountNumber?.slice(-4) || profile.paymentDetails?.accountNumber?.slice(-4)) || 'XXXX'})
                                    </p>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Employee ID</p>
                                <p className="text-sm font-bold text-gray-700">{profile.employeeId}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-gray-500 italic">
                            <p className="text-sm">Personal payroll profile details not found. System accounts may not have linked employee profiles.</p>
                        </div>
                    )}
                </div>
            </div>
            {/* Module Pipelines */}
            {user.role === 'HR Admin' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Module Pipelines</h2>
                            <p className="text-sm text-gray-500">Track progress across all payroll modules</p>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                { name: 'Org & Statutory', status: 'Completed', progress: 100, color: 'bg-green-500', link: '/statutory' },
                                { name: 'Payroll Profiles', status: 'In Progress', progress: 45, color: 'bg-blue-500', link: '/payroll-profiles' },
                                { name: 'Salary Components', status: 'In Progress', progress: 70, color: 'bg-purple-500', link: '/salary-config' },
                                { name: 'Attendance Sync', status: 'Pending', progress: 15, color: 'bg-amber-500', link: '/attendance' },
                                { name: 'Tax Compliance', status: 'Pending', progress: 20, color: 'bg-orange-500', link: '/statutory' },
                                { name: 'Payout Status', status: 'Not Started', progress: 0, color: 'bg-gray-300', link: '/payroll' },
                                { name: 'Document Vault', status: 'Not Started', progress: 0, color: 'bg-gray-300', link: '/reports' }
                            ].map((module, idx) => (
                                <Link key={idx} to={module.link} className="group p-4 rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-sm transition-all bg-gray-50/30">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="font-bold text-gray-700">{module.name}</span>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${module.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                            module.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                                            }`}>
                                            {module.status}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-[10px] text-gray-400 font-bold">
                                        <span>{module.progress}% Complete</span>
                                        <span className="group-hover:text-indigo-600 transition-colors">Configure →</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Tax Declarations Section for HR Admin */}
            {user.role === 'HR Admin' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                    <div className="p-6 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Pending Tax Declarations</h2>
                            <p className="text-sm text-gray-500">Review employee investment proofs</p>
                        </div>
                        <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                            <FaFileInvoiceDollar className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="p-6">
                        {loading ? (
                            <div className="animate-pulse space-y-4">
                                <div className="h-4 bg-gray-200 rounded w-full"></div>
                                <div className="h-4 bg-gray-200 rounded w-full"></div>
                            </div>
                        ) : declarations.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead>
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-bold text-gray-400 uppercase">Emp ID</th>
                                            <th className="px-4 py-2 text-left text-xs font-bold text-gray-400 uppercase">Employee</th>
                                            <th className="px-4 py-2 text-left text-xs font-bold text-gray-400 uppercase">Status</th>
                                            <th className="px-4 py-2 text-right text-xs font-bold text-gray-400 uppercase">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {declarations.slice(0, 5).map((dec) => (
                                            <tr key={dec._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-3 text-sm font-bold text-indigo-600">{dec.employee?.employeeId}</td>
                                                <td className="px-4 py-3 text-sm text-gray-700">{dec.employee?.user?.name}</td>
                                                <td className="px-4 py-3 text-xs">
                                                    <span className={`px-2 py-1 rounded-full font-bold ${dec.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                        {dec.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <Link to={`/tax-declaration`} className="text-xs font-bold text-indigo-600 hover:underline">Review</Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 italic">No declarations found.</p>
                        )}
                    </div>
                </div>
            )}

            <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Management Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <QuickAction title="Add Employee" desc="Onboard new staff" link="/employees/new" icon={FaUsers} color="#EC4899" />
                    <QuickAction title="Run Payroll" desc="Process monthly salaries" link="/payroll" icon={FaMoneyBillWave} color="#10B981" />
                    <QuickAction title="Attendance Review" desc="Check marks & leaves" link="/attendance" icon={FaCalendarCheck} color="#3B82F6" />
                    <QuickAction title="Download Reports" desc="PF, ESI & Tax" link="/reports" icon={FaChartLine} color="#8B5CF6" />
                </div>
            </div>
        </div>
    );
};

// Internal EmployeeDashboard removed in favor of external EmployeeDashboardPage

const FinanceDashboard = ({ user }) => {
    return (
        <div className="space-y-8 animate-fade-in">
            <WelcomeBanner user={user} icon={FaHandHoldingUsd} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Payout" value="$45,000" icon={FaMoneyBillWave} color="#10B981" subtext="Last month processed" />
                <StatCard title="Tax Liability" value="$4,500" icon={FaFileInvoiceDollar} color="#EF4444" subtext="Pending remittance" />
                <StatCard title="Reports Generated" value="8" icon={FaChartLine} color="#3B82F6" link="/reports" subtext="This quarter" />
            </div>

            <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Finance Operations</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <QuickAction title="View Reports" desc="Download statutory reports" link="/reports" icon={FaChartLine} color="#8B5CF6" />
                    <QuickAction title="Payroll History" desc="Audit past transactions" link="/payroll" icon={FaMoneyBillWave} color="#10B981" />
                </div>
            </div>
        </div>
    );
};

const Dashboard = () => {
    const { user } = useContext(AuthContext);

    if (!user) return <div className="text-center p-10">Loading...</div>;

    // Role Routing
    if (['Super Admin', 'Payroll Admin', 'HR Admin'].includes(user.role)) {
        return <AdminDashboard user={user} />;
    } else if (user.role === 'Finance') {
        return <FinanceDashboard user={user} />;
    } else {
        return <EmployeeDashboardPage user={user} />;
    }
};

export default Dashboard;
