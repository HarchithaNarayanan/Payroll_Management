import { useState, useEffect, useContext } from 'react';
import { FaFilePdf, FaFileExcel, FaDownload, FaChartBar, FaTable, FaUser, FaBuilding, FaMoneyBillWave, FaHistory } from 'react-icons/fa';
import api from '../utils/api';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { convertToCSV, downloadFile } from '../utils/downloadHelper';

const reportsByTab = {
    Payroll: [
        { name: 'Monthly Payroll Register', format: 'CSV' },
        { name: 'Bank Transfer Statement', format: 'CSV' },
        { name: 'Variance Report', format: 'PDF (Coming Soon)' }
    ],
    Statutory: [
        { name: 'PF Electronic Challan (ECR)', format: 'CSV' },
        { name: 'ESI Contribution Report', format: 'CSV' },
        { name: 'Professional Tax Report', format: 'PDF (Coming Soon)' }
    ]
};

const Reports = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(user?.role === 'HR Admin' ? 'CTC' : 'Analytics');
    const [summary, setSummary] = useState(null);
    const [ctcData, setCtcData] = useState([]);
    const [deptData, setDeptData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());

    const currentMonthLabel = new Date(0, month - 1).toLocaleString('default', { month: 'long' });

    useEffect(() => {
        if (activeTab === 'Analytics' || activeTab === 'CTC' || activeTab === 'Department') {
            fetchData();
        }
    }, [activeTab, month, year]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const query = `?month=${month}&year=${year}`;

            if (activeTab === 'Analytics' && user?.role !== 'HR Admin') {
                const res = await api.get(`/reports/summary${query}`);
                setSummary(res.data);
            } else if (activeTab === 'CTC') {
                const res = await api.get(`/reports/ctc`);
                setCtcData(res.data);
            } else if (activeTab === 'Department') {
                const res = await api.get(`/reports/department${query}`);
                setDeptData(res.data);
            }
        } catch (error) {
            console.error('Error fetching report data:', error);
        }
        setLoading(false);
    };

    const handleDownload = async (reportName, format) => {
        setDownloading(true);
        try {
            let data;
            let filename = `${reportName.replace(/\s+/g, '_')}_${month}_${year}`;

            if (reportName === 'Monthly Payroll Register') {
                const response = await api.get(`/payroll?month=${month}&year=${year}`);
                data = response.data.map(p => ({
                    EmployeeID: p.employee.employeeId,
                    Name: p.employee.user?.name,
                    Department: p.employee.department,
                    Designation: p.employee.designation,
                    DaysPresent: p.presentDays,
                    GrossSalary: p.grossSalary,
                    TotalDeductions: p.totalDeductions,
                    NetSalary: p.netSalary,
                    Status: p.status
                }));
                const csv = convertToCSV(data);
                downloadFile(csv, `${filename}.csv`);

            } else if (reportName === 'Bank Transfer Statement') {
                const response = await api.get(`/payroll?month=${month}&year=${year}`);
                data = response.data.map(p => ({
                    BeneficiaryName: p.employee.user?.name,
                    AccountNumber: p.employee.paymentDetails?.accountNumber || 'N/A',
                    IFSC: p.employee.paymentDetails?.ifscCode || 'N/A',
                    Amount: p.netSalary,
                    Narrative: `Salary ${month}/${year}`
                }));
                const csv = convertToCSV(data);
                downloadFile(csv, `${filename}.csv`);

            } else if (reportName === 'PF Electronic Challan (ECR)') {
                const response = await api.get(`/reports/pf?month=${month}&year=${year}`);
                data = response.data;
                const csv = convertToCSV(data);
                downloadFile(csv, `${filename}.csv`);
            } else if (reportName === 'ESI Contribution Report') {
                const response = await api.get(`/reports/esi?month=${month}&year=${year}`);
                data = response.data;
                const csv = convertToCSV(data);
                downloadFile(csv, `${filename}.csv`);
            } else {
                alert(`Download for ${reportName} is under development.`);
            }

        } catch (error) {
            console.error("Download failed", error);
            alert("Failed to download report. Please try again.");
        } finally {
            setDownloading(false);
        }
    };

    const handleExport = async (type) => {
        try {
            const res = await api.get(`/reports/export?type=${type}&month=${month}&year=${year}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `payroll_${type}_${month}_${year}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            alert('Export failed or no data available.');
        }
    };

    const renderAnalytics = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="text-blue-500 mb-2"><FaMoneyBillWave /></div>
                    <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Total Gross</p>
                    <h3 className="text-xl font-bold text-gray-800">₹{(summary?.totalGross || 0).toLocaleString()}</h3>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="text-red-500 mb-2"><FaTable /></div>
                    <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Total Deductions</p>
                    <h3 className="text-xl font-bold text-gray-800">₹{(summary?.totalDeductions || 0).toLocaleString()}</h3>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="text-green-500 mb-2"><FaDownload /></div>
                    <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Total Net Pay</p>
                    <h3 className="text-xl font-bold text-gray-800">₹{(summary?.totalNet || 0).toLocaleString()}</h3>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="text-purple-500 mb-2"><FaChartBar /></div>
                    <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Total Bonuses</p>
                    <h3 className="text-xl font-bold text-gray-800">₹{(summary?.totalBonuses || 0).toLocaleString()}</h3>
                </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 font-sans">
                <h3 className="font-bold text-md text-gray-800 mb-10 flex items-center gap-2">
                    <FaChartBar className="text-blue-600" /> Spending Overview ({currentMonthLabel} {year})
                </h3>
                <div className="flex items-end justify-around gap-4 h-96 border-b border-l border-gray-100 px-10 pb-4 relative">
                    <div className="absolute left-[-45px] top-0 h-full flex flex-col justify-between text-[10px] text-gray-400 font-black pr-2 border-r border-gray-50">
                        <span>100%</span>
                        <span>75%</span>
                        <span>50%</span>
                        <span>25%</span>
                        <span>0%</span>
                    </div>

                    {summary && (summary.totalGross > 0) ? (
                        <>
                            <div className="flex flex-col items-center justify-end h-full w-24 group relative">
                                <div className="absolute bottom-[105%] left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] px-2 py-1 rounded font-bold shadow-lg whitespace-nowrap z-20 mb-1">
                                    ₹{summary.totalGross.toLocaleString()}
                                </div>
                                <div
                                    className="bg-gradient-to-t from-blue-700 to-blue-500 w-full rounded-t-lg transition-all duration-1000 shadow-[0_4px_15px_rgba(37,99,235,0.3)] hover:brightness-110"
                                    style={{ height: '100%' }}
                                />
                                <div className="absolute top-[100%] mt-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest">Gross</div>
                            </div>

                            <div className="flex flex-col items-center justify-end h-full w-24 group relative">
                                <div className="absolute bottom-[105%] left-1/2 -translate-x-1/2 bg-green-600 text-white text-[10px] px-2 py-1 rounded font-bold shadow-lg whitespace-nowrap z-20 mb-1" style={{ bottom: `calc(${(summary.totalNet / summary.totalGross) * 100}% + 5px)` }}>
                                    ₹{summary.totalNet.toLocaleString()}
                                </div>
                                <div
                                    className="bg-gradient-to-t from-green-600 to-green-400 w-full rounded-t-lg transition-all duration-1000 shadow-[0_4px_15px_rgba(34,197,94,0.3)] hover:brightness-110"
                                    style={{ height: `${(summary.totalNet / summary.totalGross) * 100}%` }}
                                />
                                <div className="absolute top-[100%] mt-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest">Net</div>
                            </div>

                            <div className="flex flex-col items-center justify-end h-full w-24 group relative">
                                <div className="absolute bottom-[105%] left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] px-2 py-1 rounded font-bold shadow-lg whitespace-nowrap z-20 mb-1" style={{ bottom: `calc(${(summary.totalDeductions / summary.totalGross) * 100}% + 5px)` }}>
                                    ₹{summary.totalDeductions.toLocaleString()}
                                </div>
                                <div
                                    className="bg-gradient-to-t from-red-600 to-red-400 w-full rounded-t-lg transition-all duration-1000 shadow-[0_4px_15px_rgba(239,68,68,0.3)] hover:brightness-110"
                                    style={{ height: `${(summary.totalDeductions / summary.totalGross) * 100}%` }}
                                />
                                <div className="absolute top-[100%] mt-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest">Deductions</div>
                            </div>
                        </>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 rounded-2xl border-4 border-dashed border-gray-100">
                            <FaChartBar className="text-5xl text-gray-200 mb-4" />
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs italic">No Approved Financial Data</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const renderCTC = () => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-bold text-gray-700 italic text-lg tracking-tight">Executive CTC Portfolio</h3>
                <button
                    onClick={() => handleExport('ctc')}
                    className="flex items-center gap-2 text-xs bg-white border-2 border-gray-100 text-gray-700 px-4 py-2 rounded-xl hover:bg-black hover:text-white transition-all font-black uppercase tracking-widest shadow-sm"
                >
                    <FaDownload /> Export Intelligence
                </button>
            </div>
            <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-600 text-[10px] uppercase font-black tracking-[0.2em] border-b border-gray-100">
                    <tr>
                        <th className="px-6 py-5">Employee Identifier</th>
                        <th className="px-6 py-5">Designation</th>
                        <th className="px-6 py-5 text-right">Yield (Monthly)</th>
                        <th className="px-6 py-5 text-right">Annual Valuation</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {ctcData.length > 0 ? ctcData.map((emp, i) => (
                        <tr key={i} className="hover:bg-blue-50/30 transition-all group">
                            <td className="px-6 py-5">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-xl shadow-indigo-100 transform group-hover:rotate-12 transition-transform">
                                        {emp.name?.charAt(0) || '?'}
                                    </div>
                                    <div>
                                        <p className="font-black text-gray-900 leading-tight text-sm tracking-tight">{emp.name}</p>
                                        <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mt-1">{emp.employeeId}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-5 text-xs text-gray-500 font-bold uppercase tracking-wide">{emp.designation}</td>
                            <td className="px-6 py-5 text-sm font-bold text-gray-700 text-right">₹{(emp.monthlyGross || 0).toLocaleString()}</td>
                            <td className="px-6 py-5 text-sm font-black text-blue-600 text-right tracking-tight">₹{(emp.annualCTC || 0).toLocaleString()}</td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan="4" className="px-6 py-24 text-center text-gray-400 italic font-black uppercase tracking-widest text-xs">Awaiting Employee Profiles</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );

    const renderDepartment = () => (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="font-black text-gray-900 mb-10 flex items-center gap-3 text-lg italic tracking-tight uppercase">
                    <FaBuilding className="text-blue-600" /> Capital Allocation by Dept
                </h3>
                <div className="space-y-10">
                    {deptData.length > 0 ? deptData.map((dept, i) => {
                        const total = deptData.reduce((acc, d) => acc + d.totalSalary, 0);
                        const percent = total > 0 ? (dept.totalSalary / total) * 100 : 0;
                        return (
                            <div key={i} className="space-y-4">
                                <div className="flex justify-between text-[11px] font-black items-center tracking-[0.1em] uppercase">
                                    <span className="text-gray-900 flex items-center gap-3">
                                        <span className="w-3 h-3 rounded-md bg-blue-600 shadow-lg shadow-blue-200"></span>
                                        {dept.department}
                                    </span>
                                    <span className="text-white bg-blue-600 px-3 py-1 rounded-full text-[9px] shadow-lg shadow-blue-100">{percent.toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-gray-50 rounded-2xl h-4 overflow-hidden border border-gray-100 shadow-inner">
                                    <div
                                        className="bg-gradient-to-r from-blue-700 to-blue-400 h-full rounded-2xl transition-all duration-1000 shadow-lg"
                                        style={{ width: `${percent}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] pt-1">
                                    <span className="bg-gray-50 px-2 py-0.5 rounded italic">{dept.employeeCount} Assets</span>
                                    <span className="text-gray-900 bg-gray-50 px-2 py-0.5 rounded">₹{dept.totalSalary.toLocaleString()}</span>
                                </div>
                            </div>
                        );
                    }) : <div className="py-24 text-center text-gray-300 font-black uppercase tracking-widest text-xs italic">Awaiting Department Streams</div>}
                </div>
            </div>
            <div className="bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950 p-10 rounded-3xl shadow-2xl flex flex-col justify-center items-center text-center relative overflow-hidden group border border-white/5">
                <div className="w-24 h-24 bg-white/5 backdrop-blur-2xl border-2 border-white/10 text-white rounded-[2rem] flex items-center justify-center mb-10 shadow-3xl transition-all group-hover:scale-110 group-hover:rotate-6 duration-1000">
                    <FaTable size={40} className="text-blue-500" />
                </div>
                <h3 className="font-black text-white text-2xl tracking-tighter italic uppercase">Vault Export</h3>
                <p className="text-[12px] text-gray-400 max-w-xs mt-6 leading-loose font-medium italic opacity-70">
                    Extract deep-level financial analytics and departmental burn rates. Encrypted CSV format compatible with enterprise grading tools.
                </p>
                <button
                    onClick={() => handleExport('summary')}
                    className="mt-12 flex items-center gap-3 bg-blue-600 text-white px-12 py-5 rounded-[1.5rem] font-black text-xs hover:bg-blue-50 transition-all shadow-3xl active:scale-95 uppercase tracking-[0.3em] ring-8 ring-blue-600/10"
                >
                    <FaDownload /> Global Extract
                </button>
            </div>
        </div>
    );

    const renderReportsList = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportsByTab[activeTab]?.map((report, idx) => (
                <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition group">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition">
                            <FaTable className="text-gray-400 group-hover:text-blue-500" />
                        </div>
                        <span className="text-[10px] items-center px-2 py-1 rounded bg-gray-100 text-gray-600 font-bold uppercase tracking-wider">
                            {report.format}
                        </span>
                    </div>
                    <h3 className="font-bold text-gray-800 mb-1">{report.name}</h3>
                    <p className="text-xs text-gray-500 mb-6 font-mono bg-gray-50 inline-block px-2 py-1 rounded">Period: {currentMonthLabel} {year}</p>

                    <div className="flex gap-2">
                        <button
                            onClick={() => handleDownload(report.name, 'CSV')}
                            disabled={downloading}
                            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white text-sm py-2 rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
                        >
                            <FaDownload className="text-xs" /> {downloading ? 'Please wait...' : 'Download'}
                        </button>
                        <button className="px-3 bg-gray-50 text-gray-400 border border-gray-200 rounded-lg hover:bg-gray-100 hover:text-gray-600 transition">
                            <FaFilePdf />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );

    const tabs = [
        { id: 'Analytics', label: 'Financial Summary', roles: ['Super Admin', 'Payroll Admin', 'Finance'] },
        { id: 'CTC', label: 'CTC Analysis', roles: ['Super Admin', 'Payroll Admin', 'HR Admin'] },
        { id: 'Department', label: 'Market Breakdown', roles: ['Super Admin', 'Payroll Admin', 'Finance', 'HR Admin'] },
        { id: 'Payroll', label: 'Payroll Reports', roles: ['Super Admin', 'Payroll Admin'] },
        { id: 'Statutory', label: 'Statutory Reports', roles: ['Super Admin', 'Payroll Admin'] }
    ].filter(t => t.roles.includes(user?.role));

    return (
        <div className="space-y-10 pb-32 animate-fade-in font-sans selection:bg-blue-100 selection:text-blue-900">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-5xl font-black text-gray-900 tracking-tighter italic uppercase drop-shadow-sm">Analytics Hub</h1>
                    <div className="flex items-center gap-3 mt-4">
                        <span className="flex h-3 w-3 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                        </span>
                        <p className="text-gray-400 font-black text-xs uppercase tracking-[0.4em] italic">Real-Time Fiscal Streaming</p>
                    </div>
                    <div className="flex gap-4 mt-6">
                        <select value={month} onChange={e => setMonth(parseInt(e.target.value))} className="border rounded-xl p-2.5 bg-gray-50 text-sm font-bold text-gray-700 focus:bg-white transition-all shadow-sm">
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                            ))}
                        </select>
                        <select value={year} onChange={e => setYear(parseInt(e.target.value))} className="border rounded-xl p-2.5 bg-gray-50 text-sm font-bold text-gray-700 focus:bg-white transition-all shadow-sm">
                            {['2024', '2025', '2026'].map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-[2rem] w-max border-2 border-gray-100 shadow-inner overflow-hidden">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-10 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] transition-all duration-500 ${activeTab === tab.id ? 'bg-white text-blue-600 shadow-2xl ring-2 ring-gray-100' : 'text-gray-400 hover:text-gray-600 hover:translate-y-[-2px]'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-52 gap-8">
                    <div className="relative">
                        <div className="w-24 h-24 border-[8px] border-blue-600/5 border-t-blue-600 rounded-full animate-spin shadow-2xl"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-12 h-12 border-[8px] border-indigo-600/10 border-t-indigo-500 rounded-full animate-spin shadow-inner"></div>
                        </div>
                    </div>
                    <div className="text-center">
                        <p className="text-gray-900 font-black text-2xl tracking-tighter italic uppercase">Aggregating Global Data</p>
                        <p className="text-gray-400 text-[11px] uppercase font-black mt-4 tracking-[0.5em] animate-pulse italic">Quantum Sync Verified</p>
                    </div>
                </div>
            ) : (
                <div className="mt-10">
                    {activeTab === 'Analytics' && renderAnalytics()}
                    {activeTab === 'CTC' && renderCTC()}
                    {activeTab === 'Department' && renderDepartment()}
                    {(activeTab === 'Payroll' || activeTab === 'Statutory') && renderReportsList()}
                </div>
            )}

            {(user?.role === 'Super Admin' || user?.role === 'Payroll Admin') && (
                <div className="bg-gradient-to-br from-indigo-950 via-gray-900 to-black rounded-[3rem] p-16 text-white shadow-3xl relative overflow-hidden mt-24 group border border-white/5 font-sans">
                    <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-16">
                        <div className="max-w-3xl">
                            <h2 className="text-4xl font-black mb-6 tracking-tighter italic uppercase drop-shadow-2xl">System Oversight Vault</h2>
                            <p className="text-blue-100/60 text-lg font-medium leading-relaxed italic max-w-2xl">
                                Access the immutable system ledger. Monitor every transaction, privilege escalation, and fiscal adjustment with forensic accuracy. The vault maintained for compliance and operational integrity.
                            </p>
                            <div className="flex flex-wrap items-center gap-10 mt-12">
                                <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl backdrop-blur-md">
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80">Full Chain Auditing</span>
                                </div>
                                <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl backdrop-blur-md">
                                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80">Role Restricted</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/audit-logs')}
                            className="bg-white text-gray-900 px-16 py-6 rounded-3xl font-black text-xs hover:bg-blue-50 transition-all shadow-[0_20px_50px_rgba(255,255,255,0.1)] active:scale-95 uppercase tracking-[0.4em] w-full lg:w-auto hover:tracking-[0.5em] duration-500"
                        >
                            Open Audit Vault
                        </button>
                    </div>
                    <div className="absolute right-[-100px] bottom-[-100px] opacity-[0.03] transform rotate-12 select-none pointer-events-none transition-transform group-hover:rotate-0 group-hover:scale-110 duration-1000">
                        <FaHistory size={600} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reports;
