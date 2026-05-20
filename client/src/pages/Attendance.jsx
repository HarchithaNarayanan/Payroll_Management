import { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import AuthContext from '../context/AuthContext';
import { FaCalendarCheck, FaCheckCircle, FaTimesCircle, FaClock, FaFilter, FaLock, FaLockOpen, FaUserSlash, FaMoneyBillWave, FaUmbrellaBeach } from 'react-icons/fa';

const Attendance = () => {
    const { user } = useContext(AuthContext);
    const [attendance, setAttendance] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [viewDate, setViewDate] = useState(new Date().toISOString().split('T')[0]);
    const [isClosed, setIsClosed] = useState(false);
    const [loading, setLoading] = useState(false);

    // Filter states for Employee View
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());

    useEffect(() => {
        if (user.role !== 'Employee') {
            fetchDailyReport();
            fetchClosureStatus(viewDate);
        } else {
            fetchMyAttendance();
            fetchClosureStatus(new Date());
        }
    }, [viewDate, month, year]);

    const fetchDailyReport = async () => {
        try {
            setLoading(true);
            // 1. Fetch All Active Employees
            const { data: allEmployees } = await api.get('/employees');

            // 2. Fetch Attendance for the specific date
            const dateObj = new Date(viewDate);
            const { data: records } = await api.get('/attendance', {
                params: {
                    month: dateObj.getMonth() + 1,
                    year: dateObj.getFullYear()
                }
            });

            // Filter for the specific day
            const daysRecords = records.filter(r =>
                new Date(r.date).toDateString() === dateObj.toDateString()
            );

            // 3. Merge Data
            const report = allEmployees.map(emp => {
                const record = daysRecords.find(r => r.employee._id === emp._id);
                return {
                    employee: emp,
                    attendance: record || null
                };
            });

            setEmployees(report);
        } catch (error) {
            console.error('Error fetching daily report', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMyAttendance = async () => {
        try {
            const params = { month, year };
            const { data } = await api.get('/attendance', { params });
            setAttendance(data);
        } catch (error) {
            console.error('Error fetching attendance', error);
        }
    };

    const fetchClosureStatus = async (dateInput) => {
        try {
            const { data } = await api.get('/attendance/closure-status', { params: { date: dateInput } });
            setIsClosed(data.isClosed);
        } catch (error) {
            console.error('Error fetching closure status', error);
        }
    };

    const handleMarkStatus = async (employeeId, status, isLOP = false) => {
        if (isClosed) return alert('Attendance is closed for this date.');

        try {
            await api.post('/attendance', {
                employeeId,
                date: viewDate,
                status,
                checkIn: status === 'Present' ? new Date(viewDate).setHours(9, 0, 0) : null,
                checkOut: status === 'Present' ? new Date(viewDate).setHours(18, 0, 0) : null,
                isLOP
            });
            fetchDailyReport();
        } catch (error) {
            console.error('Error updating status', error);
            alert('Failed to update status');
        }
    };

    const handleUpdateOT = async (recordId, otHours) => {
        try {
            // Find employee ID from current state
            const target = employees.find(e => e.attendance && e.attendance._id === recordId);
            if (!target) return;

            await api.post('/attendance', {
                employeeId: target.employee._id,
                date: viewDate,
                overtimeHours: parseFloat(otHours) || 0
            });
            // Optimistic update or refetch
            fetchDailyReport();
        } catch (error) {
            console.error('Error updating OT', error);
        }
    };

    const handleToggleClosure = async (close) => {
        try {
            setLoading(true);
            const endpoint = close ? '/attendance/close' : '/attendance/reopen';
            await api.post(endpoint, { date: viewDate });
            setIsClosed(close);
            alert(`Attendance ${close ? 'closed' : 'reopened'} successfully.`);
        } catch (error) {
            console.error('Closure action failed', error);
            alert('Action failed');
        } finally {
            setLoading(false);
        }
    };

    // --- RENDER FOR EMPLOYEE ---
    if (user.role === 'Employee') {
        const handleSelfMark = async (status) => {
            if (isClosed) return alert('Attendance closed.');
            try {
                await api.post('/attendance', {
                    date: new Date(),
                    status,
                    checkIn: status === 'Present' ? new Date() : null
                });
                fetchMyAttendance();
            } catch (e) { alert(e.response?.data?.message || 'Error'); }
        };

        return (
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h1 className="text-2xl font-bold mb-4">My Attendance</h1>
                    <div className="flex gap-4 mb-6">
                        <button onClick={() => handleSelfMark('Present')} disabled={isClosed} className="bg-green-600 text-white px-6 py-2 rounded disabled:opacity-50">Check In</button>
                        <button onClick={() => handleSelfMark('Leave')} disabled={isClosed} className="bg-red-500 text-white px-6 py-2 rounded disabled:opacity-50">Mark Leave</button>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow border overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Check In</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">OT Hours</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {attendance.map(r => (
                                <tr key={r._id}>
                                    <td className="px-6 py-4">{new Date(r.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs text-white ${r.status === 'Present' ? 'bg-green-500' :
                                                r.status === 'Holiday' ? 'bg-purple-500' :
                                                    'bg-red-500'
                                            }`}>{r.status}</span>
                                    </td>
                                    <td className="px-6 py-4">{r.checkIn ? new Date(r.checkIn).toLocaleTimeString() : '-'}</td>
                                    <td className="px-6 py-4">{r.overtimeHours}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    // --- RENDER FOR ADMIN ---
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Attendance Manager</h1>
                    <p className="text-gray-500">Manage daily attendance for all employees</p>
                </div>
                <div className="flex gap-3">
                    {isClosed ? (
                        <button onClick={() => handleToggleClosure(false)} className="flex items-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">
                            <FaLockOpen /> Reopen Day
                        </button>
                    ) : (
                        <button onClick={() => handleToggleClosure(true)} className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                            <FaLock /> Close Day
                        </button>
                    )}
                </div>
            </div>

            {/* Date Selection Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
                <label className="font-semibold text-gray-700">Select Date:</label>
                <input
                    type="date"
                    value={viewDate}
                    onChange={(e) => setViewDate(e.target.value)}
                    className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <span className="ml-auto text-sm text-gray-500">
                    Status: {isClosed ? <span className="text-red-600 font-bold">CLOSED</span> : <span className="text-green-600 font-bold">OPEN</span>}
                </span>
            </div>

            {/* Attendance Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Employee</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Check In</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">OT Hours</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {employees.map(({ employee, attendance: record }) => (
                                <tr key={employee._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{employee.user?.name}</div>
                                        <div className="text-xs text-gray-500">{employee.employeeId}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {record ? (
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${record.status === 'Present' ? 'bg-green-100 text-green-800' :
                                                    record.status === 'Absent' ? 'bg-red-100 text-red-800' :
                                                        record.status === 'Holiday' ? 'bg-purple-100 text-purple-800' :
                                                            'bg-yellow-100 text-yellow-800'}`}>
                                                {record.status} {record.isLOP ? '(LOP)' : ''}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400 italic">Not Marked</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {record?.checkIn ? new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        {record ? (
                                            <input
                                                type="number"
                                                defaultValue={record.overtimeHours || 0}
                                                onBlur={(e) => handleUpdateOT(record._id, e.target.value)}
                                                className="w-16 border rounded px-2 py-1 text-sm"
                                                disabled={isClosed}
                                            />
                                        ) : '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleMarkStatus(employee._id, 'Present')}
                                                disabled={isClosed}
                                                className="p-2 text-green-600 hover:bg-green-50 rounded"
                                                title="Mark Present"
                                            >
                                                <FaCheckCircle />
                                            </button>
                                            <button
                                                onClick={() => handleMarkStatus(employee._id, 'Absent', true)} // Absent is always LOP
                                                disabled={isClosed}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded"
                                                title="Mark Absent"
                                            >
                                                <FaTimesCircle />
                                            </button>
                                            <button
                                                onClick={() => handleMarkStatus(employee._id, 'Leave', false)}
                                                disabled={isClosed}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                                title="Paid Leave"
                                            >
                                                <FaCalendarCheck />
                                            </button>
                                            <button
                                                onClick={() => handleMarkStatus(employee._id, 'Leave', true)}
                                                disabled={isClosed}
                                                className="p-2 text-orange-600 hover:bg-orange-50 rounded"
                                                title="Unpaid Leave (LOP)"
                                            >
                                                <FaMoneyBillWave />
                                            </button>
                                            <button
                                                onClick={() => handleMarkStatus(employee._id, 'Holiday', false)}
                                                disabled={isClosed}
                                                className="p-2 text-purple-600 hover:bg-purple-50 rounded"
                                                title="Mark Holiday"
                                            >
                                                <FaUmbrellaBeach />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Attendance;
