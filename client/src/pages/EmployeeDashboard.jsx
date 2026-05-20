import { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import AuthContext from '../context/AuthContext';
import { FaMoneyCheckAlt, FaFileInvoiceDollar, FaCalculator, FaBell } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const EmployeeDashboard = () => {
    const { user } = useContext(AuthContext);
    const [summary, setSummary] = useState({
        lastSalary: 0,
        currentTax: 0,
        notifications: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [payslipsRes, notificationsRes] = await Promise.all([
                    api.get('/employee/payslips'),
                    api.get('/notifications')
                ]);

                const latestSlip = payslipsRes.data[0];
                const unreadNotifications = notificationsRes.data.filter(n => !n.read).length;

                setSummary({
                    lastSalary: latestSlip?.netSalary || 0,
                    currentTax: latestSlip?.deductions?.find(d => d.name.includes('Tax'))?.amount || 0,
                    notifications: unreadNotifications
                });
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500 font-medium">Crunching your numbers...</div>;

    const cards = [
        {
            title: 'My Payslips',
            icon: FaFileInvoiceDollar,
            link: '/my-payslips',
            color: 'bg-blue-500',
            description: 'View and download monthly statements'
        },
        {
            title: 'Salary Structure',
            icon: FaMoneyCheckAlt,
            link: '/employee/salary-structure',
            color: 'bg-purple-500',
            description: 'Detailed breakdown of earnings'
        },
        {
            title: 'Tax Details',
            icon: FaCalculator,
            link: '/tax-declaration',
            color: 'bg-amber-500',
            description: 'Tax regime and declarations'
        },
        {
            title: 'Attendance',
            icon: FaBell,
            link: '/attendance',
            color: 'bg-green-500',
            description: 'Check your logs and leave'
        }
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-3xl font-black text-gray-800 tracking-tight">Welcome back, {user?.name}!</h1>
                    <p className="text-gray-500 font-medium mt-1">Here's your payroll overview at a glance.</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-blue-50 px-6 py-4 rounded-2xl border border-blue-100">
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Last Payout</p>
                        <p className="text-2xl font-black text-blue-700">₹{summary.lastSalary.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, idx) => (
                    <Link
                        key={idx}
                        to={card.link}
                        className="group bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 transform hover:-translate-y-1"
                    >
                        <div className={`${card.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                            <card.icon size={20} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">{card.title}</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">{card.description}</p>
                    </Link>
                ))}
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-500/20">
                <div className="relative z-10">
                    <h2 className="text-2xl font-bold mb-2">Annual Tax Summary</h2>
                    <p className="text-blue-100 max-w-md mb-6 font-medium opacity-90 text-sm">You have saved approximately ₹45,000 this year by optimizing your tax declarations. Good job!</p>
                    <Link
                        to="/tax-declaration"
                        className="inline-block bg-white text-blue-700 px-8 py-3 rounded-2xl font-black text-sm hover:bg-blue-50 transition-all shadow-xl active:scale-95"
                    >
                        OPTIMIZE MORE
                    </Link>
                </div>
                <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-12 translate-y-12">
                    <FaCalculator size={300} />
                </div>
            </div>
        </div>
    );
};

export default EmployeeDashboard;
