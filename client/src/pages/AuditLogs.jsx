import { useState, useEffect } from 'react';
import api from '../utils/api';
import { FaHistory, FaUser, FaInfoCircle, FaCalendarAlt, FaDownload, FaFilter } from 'react-icons/fa';

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        role: '',
        action: ''
    });

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams(filters).toString();
            const res = await api.get(`/audit-logs?${queryParams}`);
            setLogs(res.data);
        } catch (error) {
            console.error('Error fetching audit logs:', error);
        }
        setLoading(false);
    };

    const handleExport = () => {
        const headers = ['Action', 'User', 'Role', 'Description', 'IP', 'Timestamp'];
        const rows = logs.map(log => [
            log.action,
            log.user?.name || 'System',
            log.role || 'N/A',
            log.description || '-',
            log.ip || 'Local',
            new Date(log.createdAt).toLocaleString()
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `payroll_audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-500/20">
                        <FaHistory size={20} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-gray-800 tracking-tight">System Audit Logs</h1>
                        <p className="text-sm text-gray-500 font-medium">Track all critical payroll actions</p>
                    </div>
                </div>
                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-2xl font-black text-sm hover:bg-black transition-all shadow-xl active:scale-95"
                >
                    <FaDownload /> EXPORT CSV
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Action</label>
                    <input
                        type="text"
                        placeholder="Filter by action..."
                        className="w-full border-gray-100 focus:ring-blue-500 focus:border-blue-500 rounded-xl bg-gray-50 px-4 py-2.5 text-sm"
                        onBlur={(e) => setFilters({ ...filters, action: e.target.value })}
                    />
                </div>
                <div className="w-48">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Start Date</label>
                    <input
                        type="date"
                        className="w-full border-gray-100 focus:ring-blue-500 focus:border-blue-500 rounded-xl bg-gray-50 px-4 py-2.5 text-sm"
                        onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                    />
                </div>
                <div className="w-48">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">End Date</label>
                    <input
                        type="date"
                        className="w-full border-gray-100 focus:ring-blue-500 focus:border-blue-500 rounded-xl bg-gray-50 px-4 py-2.5 text-sm"
                        onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                    />
                </div>
                <button
                    onClick={fetchLogs}
                    className="bg-blue-600 text-white px-8 py-3 rounded-xl font-black text-sm hover:bg-blue-700 transition"
                >
                    APPLY
                </button>
            </div>

            <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-black tracking-widest border-b border-gray-100">
                            <tr>
                                <th className="px-8 py-5">Action</th>
                                <th className="px-8 py-5">User</th>
                                <th className="px-8 py-5">Role</th>
                                <th className="px-8 py-5">Description</th>
                                <th className="px-8 py-5">IP Address</th>
                                <th className="px-8 py-5 text-right">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-8 py-12 text-center text-gray-500 font-medium animate-pulse">Loading logs...</td>
                                </tr>
                            ) : logs.length > 0 ? logs.map((log) => (
                                <tr key={log._id} className="hover:bg-blue-50/10 transition-colors group">
                                    <td className="px-8 py-5 font-bold text-blue-600 group-hover:scale-105 transition-transform origin-left">{log.action}</td>
                                    <td className="px-8 py-5 text-gray-900 font-bold">{log.user?.name || 'System'}</td>
                                    <td className="px-8 py-5">
                                        <span className="px-3 py-1 bg-gray-100 text-[10px] font-black uppercase rounded-lg text-gray-500">{log.role || 'N/A'}</span>
                                    </td>
                                    <td className="px-8 py-5 text-gray-500 text-sm max-w-xs truncate" title={log.description}>
                                        {log.description || '-'}
                                    </td>
                                    <td className="px-8 py-5 text-gray-400 font-mono text-[10px]">{log.ip || 'Local'}</td>
                                    <td className="px-8 py-5 text-right text-gray-500 text-sm font-medium">
                                        {new Date(log.createdAt).toLocaleString()}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="px-8 py-20 text-center text-gray-400">
                                        <FaInfoCircle className="mx-auto mb-4 text-3xl opacity-20" />
                                        <p className="font-bold">No audit logs found.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AuditLogs;
