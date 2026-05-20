import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useContext, useState, useEffect } from 'react';
import AuthContext from '../context/AuthContext';
import api from '../utils/api';
import { FaUserCircle, FaSignOutAlt, FaBell, FaCheckCircle, FaTrash } from 'react-icons/fa';

const Layout = () => {
    const { user, logout } = useContext(AuthContext);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        if (user) {
            fetchNotifications();
            // Optional: Set up polling or websocket here
        }
    }, [user]);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            <Sidebar />

            <div className="flex flex-col flex-1 overflow-hidden relative">
                {/* Header */}
                <header className="flex items-center justify-between px-8 py-5 bg-white shadow-sm border-b border-gray-200 z-20">
                    <h2 className="text-xl font-bold text-gray-800 tracking-tight">
                        <span className="text-blue-600">Payroll</span> Management System
                    </h2>

                    <div className="flex items-center space-x-6">
                        {/* Notification Bell */}
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className={`p-2.5 rounded-xl transition-all relative ${showNotifications ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-100'}`}
                            >
                                <FaBell size={18} />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-bounce-short">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* Dropdown */}
                            {showNotifications && (
                                <div className="absolute right-0 mt-4 w-80 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-fade-in-up">
                                    <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
                                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Notifications</h3>
                                        <span className="text-[10px] font-bold bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">{unreadCount} New</span>
                                    </div>
                                    <div className="max-h-96 overflow-y-auto">
                                        {notifications.length > 0 ? (
                                            notifications.map((notif) => (
                                                <div
                                                    key={notif._id}
                                                    className={`p-4 border-b border-gray-50 flex gap-3 transition-colors hover:bg-gray-50 ${!notif.read ? 'bg-blue-50/30' : ''}`}
                                                >
                                                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!notif.read ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
                                                    <div className="flex-1">
                                                        <p className={`text-sm leading-snug ${!notif.read ? 'font-bold text-gray-800' : 'text-gray-500'}`}>
                                                            {notif.message}
                                                        </p>
                                                        <div className="flex items-center justify-between mt-2">
                                                            <span className="text-[10px] text-gray-400 font-medium">{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                            {!notif.read && (
                                                                <button
                                                                    onClick={() => markAsRead(notif._id)}
                                                                    className="text-blue-600 hover:text-blue-800 transition"
                                                                    title="Mark as read"
                                                                >
                                                                    <FaCheckCircle size={14} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-12 text-center">
                                                <FaBell className="mx-auto text-gray-100 text-4xl mb-4" />
                                                <p className="text-sm text-gray-400 font-medium">All caught up!</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-3 bg-gray-50/50 text-center">
                                        <button className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-blue-600 transition">View All</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center space-x-3 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                            <FaUserCircle className="text-gray-400 text-xl" />
                            <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                        </div>

                        <button
                            onClick={logout}
                            className="flex items-center space-x-2 text-sm text-gray-500 hover:text-red-500 transition-colors"
                            title="Logout"
                        >
                            <FaSignOutAlt />
                            <span>Logout</span>
                        </button>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-8">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
