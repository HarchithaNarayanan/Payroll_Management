import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import AuthContext from '../context/AuthContext';
import { FaUniversity, FaCreditCard, FaCalculator, FaFileInvoice, FaSave, FaArrowLeft } from 'react-icons/fa';

const PayrollProfileForm = () => {
    const { employeeId } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useContext(AuthContext);

    const [employee, setEmployee] = useState(null);
    const [structures, setStructures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        salaryStructureId: '',
        bankDetails: {
            bankName: '',
            accountNumber: '',
            ifscCode: '',
            paymentMode: 'Bank Transfer'
        },
        taxRegime: 'New',
        PAN: '',
        earnings: [],
        deductions: [],
        grossSalary: 0,
        netSalary: 0
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchData();
    }, [employeeId]);

    const fetchData = async () => {
        try {
            const [empRes, structRes, profileRes] = await Promise.all([
                api.get(`/employees/${employeeId}`),
                api.get('/salary/structures'),
                api.get(`/payroll-profile/${employeeId}`)
            ]);

            setEmployee(empRes.data);
            setStructures(structRes.data);

            if (profileRes.data) {
                setFormData({
                    ...profileRes.data,
                    salaryStructureId: profileRes.data.salaryStructureId?._id || profileRes.data.salaryStructureId
                });
            } else {
                // Pre-fill some defaults from employee if they exist (backward compatibility)
                setFormData(prev => ({
                    ...prev,
                    bankDetails: {
                        ...prev.bankDetails,
                        bankName: empRes.data.paymentDetails?.bankName || '',
                        accountNumber: empRes.data.paymentDetails?.accountNumber || '',
                        ifscCode: empRes.data.paymentDetails?.ifscCode || ''
                    },
                    PAN: empRes.data.paymentDetails?.panNumber || '',
                    taxRegime: empRes.data.taxRegime || 'New',
                    salaryStructureId: empRes.data.salaryStructure?._id || empRes.data.salaryStructure || ''
                }));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleStructureChange = (e) => {
        const structId = e.target.value;
        const struct = structures.find(s => s._id === structId);

        if (struct) {
            // Mock preview calculation
            // In a real app, this should involve more complex logic or a backend call
            const earnings = struct.components.filter(c => c.component.type === 'Earning').map(c => ({
                component: c.component._id,
                name: c.component.name,
                amount: c.value || 0
            }));
            const deductions = struct.components.filter(c => c.component.type === 'Deduction').map(c => ({
                component: c.component._id,
                name: c.component.name,
                amount: c.value || 0
            }));

            const gross = earnings.reduce((sum, item) => sum + item.amount, 0);
            const totalDed = deductions.reduce((sum, item) => sum + item.amount, 0);

            setFormData({
                ...formData,
                salaryStructureId: structId,
                earnings,
                deductions,
                grossSalary: gross,
                netSalary: gross - totalDed
            });
        } else {
            setFormData({ ...formData, salaryStructureId: '', earnings: [], deductions: [], grossSalary: 0, netSalary: 0 });
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.salaryStructureId) newErrors.salaryStructureId = 'Salary structure is required';
        if (!formData.bankDetails.bankName) newErrors.bankName = 'Bank name is required';
        if (formData.bankDetails.accountNumber.length < 9) newErrors.accountNumber = 'Account number too short';

        // Relaxed Validation: Just check length
        if (formData.bankDetails.ifscCode.length !== 11) newErrors.ifscCode = 'IFSC must be 11 characters';
        if (formData.PAN.length !== 10) newErrors.PAN = 'PAN must be 10 characters';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setSaving(true);
        try {
            const payload = { ...formData, employeeId: employeeId };
            try {
                await api.put(`/payroll-profile/${employeeId}`, payload);
            } catch (err) {
                await api.post('/payroll-profile', payload);
            }
            navigate('/payroll-profiles');
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Error saving profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center p-12"><div className="animate-spin h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full" /></div>;

    const isReadOnly = currentUser.role === 'Payroll Admin';

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-fade-in">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                    <FaArrowLeft />
                </button>
                <h1 className="text-3xl font-bold text-gray-800">Assign Payroll Profile</h1>
            </div>

            {/* Employee Info Header */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 items-center">
                <div className="w-20 h-20 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 font-bold text-2xl">
                    {employee?.user?.name?.charAt(0)}
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h2 className="text-xl font-bold text-gray-800">{employee?.user?.name}</h2>
                    <p className="text-gray-500">{employee?.designation} • {employee?.department}</p>
                    <p className="text-xs font-mono text-indigo-500 mt-1 font-bold">ID: {employee?.employeeId}</p>
                </div>
                <div className="px-4 py-2 bg-green-50 text-green-700 rounded-full text-xs font-bold uppercase border border-green-100 italic">
                    {employee?.status}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* 1. Salary Structure */}
                <div className="bg-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden">
                    <div className="p-4 bg-orange-50 border-b border-orange-100 flex items-center gap-3">
                        <FaCalculator className="text-orange-500" />
                        <h3 className="font-bold text-orange-900">Salary Structure Assignment</h3>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Select Template</label>
                            <select
                                value={formData.salaryStructureId}
                                onChange={handleStructureChange}
                                disabled={isReadOnly}
                                className={`w-full border-gray-200 rounded-xl focus:ring-orange-500 focus:border-orange-500 transition-all ${isReadOnly ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
                            >
                                <option value="">-- Choose Structure --</option>
                                {structures.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                            </select>
                            {errors.salaryStructureId && <p className="text-red-500 text-xs mt-1">{errors.salaryStructureId}</p>}
                        </div>

                        {formData.salaryStructureId && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-xl border border-gray-100 animate-slide-up">
                                <div>
                                    <h4 className="text-[10px] uppercase font-bold text-gray-400 mb-2">Earnings Breakdown</h4>
                                    <ul className="space-y-2">
                                        {formData.earnings.map((e, idx) => (
                                            <li key={idx} className="flex justify-between text-sm">
                                                <span className="text-gray-600">{e.name}</span>
                                                <span className="font-bold text-gray-800">₹ {e.amount.toLocaleString()}</span>
                                            </li>
                                        ))}
                                        <li className="pt-2 border-t border-gray-200 flex justify-between font-bold text-indigo-600">
                                            <span>Gross Salary</span>
                                            <span>₹ {formData.grossSalary.toLocaleString()}</span>
                                        </li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="text-[10px] uppercase font-bold text-gray-400 mb-2">Deductions (Estimates)</h4>
                                    <ul className="space-y-2">
                                        {formData.deductions.map((d, idx) => (
                                            <li key={idx} className="flex justify-between text-sm">
                                                <span className="text-gray-600">{d.name}</span>
                                                <span className="font-bold text-red-500">- ₹ {d.amount.toLocaleString()}</span>
                                            </li>
                                        ))}
                                        <li className="pt-2 border-t border-gray-200 flex justify-between font-black text-green-600">
                                            <span>Net Take Home</span>
                                            <span>₹ {formData.netSalary.toLocaleString()}</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. Bank Details */}
                <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 overflow-hidden">
                    <div className="p-4 bg-indigo-50 border-b border-indigo-100 flex items-center gap-3">
                        <FaUniversity className="text-indigo-500" />
                        <h3 className="font-bold text-indigo-900">Bank & Payment Details</h3>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1 text-[10px] uppercase">Bank Name</label>
                            <input
                                type="text"
                                value={formData.bankDetails.bankName}
                                onChange={e => setFormData({ ...formData, bankDetails: { ...formData.bankDetails, bankName: e.target.value } })}
                                disabled={isReadOnly}
                                className="w-full border-gray-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="HDFC Bank"
                            />
                            {errors.bankName && <p className="text-red-500 text-xs mt-1">{errors.bankName}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1 text-[10px] uppercase">Account Number</label>
                            <input
                                type="text"
                                value={formData.bankDetails.accountNumber}
                                onChange={e => setFormData({ ...formData, bankDetails: { ...formData.bankDetails, accountNumber: e.target.value } })}
                                disabled={isReadOnly}
                                className="w-full border-gray-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 font-mono"
                                placeholder="501XXXXXXXXXXXX"
                            />
                            {errors.accountNumber && <p className="text-red-500 text-xs mt-1">{errors.accountNumber}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1 text-[10px] uppercase">IFSC Code</label>
                            <input
                                type="text"
                                value={formData.bankDetails.ifscCode}
                                onChange={e => setFormData({ ...formData, bankDetails: { ...formData.bankDetails, ifscCode: e.target.value.toUpperCase() } })}
                                disabled={isReadOnly}
                                className="w-full border-gray-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 font-mono uppercase"
                                placeholder="HDFC0001234"
                            />
                            {errors.ifscCode && <p className="text-red-500 text-xs mt-1">{errors.ifscCode}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1 text-[10px] uppercase">Payment Mode</label>
                            <select className="w-full border-gray-200 rounded-xl bg-gray-50 cursor-not-allowed text-gray-500" disabled>
                                <option>Bank Transfer</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* 3. Tax Configuration */}
                <div className="bg-white rounded-2xl shadow-sm border border-red-100 overflow-hidden">
                    <div className="p-4 bg-red-50 border-b border-red-100 flex items-center gap-3">
                        <FaFileInvoice className="text-red-500" />
                        <h3 className="font-bold text-red-900">Tax & PAN Details</h3>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1 text-[10px] uppercase">PAN Number</label>
                            <input
                                type="text"
                                value={formData.PAN}
                                onChange={e => setFormData({ ...formData, PAN: e.target.value.toUpperCase() })}
                                disabled={isReadOnly}
                                className="w-full border-gray-200 rounded-xl focus:ring-red-500 focus:border-red-500 font-mono uppercase tracking-widest"
                                placeholder="ABCDE1234F"
                            />
                            {errors.PAN && <p className="text-red-500 text-xs mt-1">{errors.PAN}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1 text-[10px] uppercase">Tax Regime</label>
                            <div className="flex gap-4 mt-2">
                                {['New', 'Old'].map(reg => (
                                    <label key={reg} className="flex items-center gap-2 cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="regime"
                                            value={reg}
                                            checked={formData.taxRegime === reg}
                                            onChange={e => setFormData({ ...formData, taxRegime: e.target.value })}
                                            disabled={isReadOnly}
                                            className="text-red-600 focus:ring-red-500"
                                        />
                                        <span className={`text-sm font-bold ${formData.taxRegime === reg ? 'text-red-600' : 'text-gray-400'}`}>{reg} Regime</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {!isReadOnly && (
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-6 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-indigo-600 text-white px-10 py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 flex items-center gap-2"
                        >
                            {saving ? 'Saving...' : <><FaSave /> Save Profile</>}
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
};

export default PayrollProfileForm;
