import { Link, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import {
    FaHome, FaBuilding, FaUsers, FaMoneyBillWave,
    FaCalendarCheck, FaFileInvoiceDollar, FaFileContract,
    FaChartBar, FaCalculator, FaUserCog
} from 'react-icons/fa';

const Sidebar = () => {
    const { user } = useContext(AuthContext);
    const location = useLocation();

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: FaHome, roles: ['Super Admin', 'Payroll Admin', 'HR Admin', 'Employee', 'Finance'] },
        { name: 'Statutory', href: '/statutory', icon: FaBuilding, roles: ['Super Admin'] },
        { name: 'Employees', href: '/employees', icon: FaUsers, roles: ['Super Admin', 'Payroll Admin', 'HR Admin'] },
        { name: 'Payroll Profile', href: '/payroll-profiles', icon: FaUserCog, roles: ['Super Admin', 'HR Admin', 'Payroll Admin'] },
        { name: 'Salary Config', href: '/salary-config', icon: FaMoneyBillWave, roles: ['Super Admin', 'HR Admin', 'Payroll Admin'] },
        { name: 'Attendance', href: '/attendance', icon: FaCalendarCheck, roles: ['Super Admin', 'Payroll Admin', 'HR Admin', 'Employee'] },
        { name: 'Run Payroll', href: '/payroll', icon: FaFileInvoiceDollar, roles: ['Super Admin', 'Payroll Admin', 'HR Admin', 'Finance'] },
        { name: 'My Payslips', href: '/my-payslips', icon: FaFileInvoiceDollar, roles: ['Employee'] },
        { name: 'Salary Structure', href: '/employee/salary-structure', icon: FaMoneyBillWave, roles: ['Employee'] },
        { name: 'Tax Declaration', href: '/tax-declaration', icon: FaFileContract, roles: ['Super Admin', 'Payroll Admin', 'Employee'] },
        { name: 'Reports', href: '/reports', icon: FaChartBar, roles: ['Super Admin', 'Payroll Admin', 'Finance'] },
    ];

    return (
        <div className="flex flex-col w-64 min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white transition-all duration-300 shadow-xl">
            {/* Logo Section */}
            <div className="flex items-center justify-center h-20 border-b border-gray-700 bg-gray-900/50">
                <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold tracking-wider text-blue-400">Payroll</span>
                    <span className="text-2xl font-light text-white">Pro</span>
                </div>
            </div>

            {/* Navigation Section */}
            <div className="flex flex-col flex-1 overflow-y-auto py-6 space-y-2">
                <nav className="flex-1 px-4 space-y-2">
                    {navigation.map((item) => (
                        item.roles.includes(user?.role) && (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 
                                    ${location.pathname === item.href
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                        : 'text-gray-400 hover:bg-gray-800 hover:text-white hover:translate-x-1'
                                    }`}
                            >
                                <item.icon className={`mr-3 h-5 w-5 transition-colors ${location.pathname === item.href ? 'text-white' : 'text-gray-500 group-hover:text-blue-400'}`} />
                                {item.name}
                            </Link>
                        )
                    ))}
                </nav>
            </div>

            {/* User Profile Mini Section (Optional Footer) */}
            <div className="p-4 border-t border-gray-700 bg-gray-900/30">
                <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold text-xs">
                        {user?.name?.charAt(0)}
                    </div>
                    <div className="ml-3">
                        <p className="text-xs font-medium text-white">{user?.name}</p>
                        <p className="text-xs text-gray-500 truncate w-32">{user?.role}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
