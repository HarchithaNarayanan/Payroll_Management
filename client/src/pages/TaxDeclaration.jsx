// Module 8: Tax Management System - Tax Declaration Page
import { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import AuthContext from '../context/AuthContext';
import { FaShieldAlt, FaHome, FaHistory, FaSave, FaTrash } from 'react-icons/fa';

const TaxDeclaration = () => {
    const { user } = useContext(AuthContext);
    const canEdit = user?.role === 'Super Admin' || user?.role === 'Employee';
    const canSearch = user?.role === 'Super Admin' || user?.role === 'Payroll Admin';
    const [declaration, setDeclaration] = useState({
        financialYear: '2024-2025',
        section80C: [{ description: '', amount: 0 }],
        section80D: { amount: 0 },
        hra: { rentAmount: 0, landlordPan: '' },
        employeeId: ''
    });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDeclaration();
    }, []);

    const fetchDeclaration = async (searchEmpId) => {
        setLoading(true);
        try {
            const params = { financialYear: '2024-2025' };
            const effectiveEmpId = searchEmpId || '';
            if (effectiveEmpId) params.employeeId = effectiveEmpId;

            const { data } = await api.get('/tax/declaration', { params });

            if (data && data.section80C) {
                setDeclaration({
                    ...data,
                    section80C: Array.isArray(data.section80C) ? data.section80C : [{ description: '', amount: 0 }],
                    section80D: data.section80D || { amount: 0 },
                    hra: data.hra || { rentAmount: 0, landlordPan: '' },
                    employeeId: data.employee?.employeeId || data.employeeId || effectiveEmpId || ''
                });
            } else if (data && data.employeeId) {
                // Return fallback if no declaration exists yet
                setDeclaration(prev => ({
                    ...prev,
                    employeeId: data.employeeId,
                    section80C: [{ description: '', amount: 0 }],
                    section80D: { amount: 0 },
                    hra: { rentAmount: 0, landlordPan: '' }
                }));
            } else if (effectiveEmpId) {
                setMessage('Employee profile not found');
            }
        } catch (error) {
            console.error(error);
            if (searchEmpId) setMessage('Error fetching employee declaration');
        } finally {
            setLoading(false);
        }
    };

    const handle80CChange = (index, field, value) => {
        const new80C = [...declaration.section80C];
        new80C[index][field] = value;
        setDeclaration({ ...declaration, section80C: new80C });
    };

    const add80C = () => {
        setDeclaration({ ...declaration, section80C: [...declaration.section80C, { description: '', amount: 0 }] });
    };

    const remove80C = (index) => {
        const new80C = declaration.section80C.filter((_, i) => i !== index);
        setDeclaration({ ...declaration, section80C: new80C.length ? new80C : [{ description: '', amount: 0 }] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Include effective employeeId if searching
            const payload = { ...declaration };
            await api.post('/tax/declaration', payload);
            setMessage('Declaration updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage('Error saving declaration');
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-12">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-800">Tax Declaration</h1>
                    <div className="flex flex-col md:flex-row md:items-center gap-3 mt-2">
                        <p className="text-gray-500 font-medium tracking-tight">Financial Year {declaration.financialYear}</p>

                        {canSearch && (
                            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-indigo-100 shadow-sm ml-2">
                                <span className="text-[10px] font-bold text-indigo-400 uppercase">Search EMP:</span>
                                <input
                                    type="text"
                                    placeholder="ID"
                                    className="border-none focus:ring-0 p-0 text-sm font-bold text-indigo-600 w-20 bg-transparent"
                                    onBlur={(e) => e.target.value && fetchDeclaration(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && fetchDeclaration(e.target.value)}
                                />
                            </div>
                        )}

                        {declaration.employeeId && (
                            <>
                                <span className="hidden md:block text-gray-300">|</span>
                                <p className="text-xs font-bold bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full border border-indigo-100">
                                    EMP: {declaration.employeeId}
                                </p>
                            </>
                        )}
                    </div>
                </div>
                <div className="bg-white px-4 py-2 rounded-xl text-sm font-bold border border-gray-100 shadow-sm text-gray-600">
                    Status: <span className={declaration.status === 'Approved' ? 'text-green-600' : 'text-amber-500'}>{declaration.status || 'Draft'}</span>
                </div>
            </div>

            {message && (
                <div className={`p-4 rounded-xl border-l-4 flex items-center gap-3 transition-all ${message.includes('success') ? 'bg-green-50 border-green-500 text-green-700' : 'bg-red-50 border-red-500 text-red-700'}`}>
                    <span className="text-sm font-medium">{message}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Section 80C */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                                    <FaShieldAlt />
                                </div>
                                <h2 className="text-xl font-bold text-gray-800">Section 80C Investments</h2>
                            </div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase bg-gray-100 px-2 py-1 rounded">Limit: ₹1.5L</span>
                        </div>
                        <div className="p-6 space-y-4">
                            {declaration.section80C.map((item, index) => (
                                <div key={index} className="flex flex-col md:flex-row gap-4 items-end bg-gray-50/50 p-4 rounded-2xl border border-gray-50 group">
                                    <div className="flex-1 w-full text-left">
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Investment Type</label>
                                        <input
                                            type="text"
                                            value={item.description}
                                            onChange={(e) => handle80CChange(index, 'description', e.target.value)}
                                            className="w-full border-gray-200 focus:ring-indigo-500 focus:border-indigo-500 rounded-xl text-sm transition-all"
                                            placeholder="LIC, PPF, ELSS, etc."
                                            disabled={!canEdit}
                                        />
                                    </div>
                                    <div className="md:w-48 w-full text-left">
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Amount (₹)</label>
                                        <input
                                            type="number"
                                            value={item.amount}
                                            onChange={(e) => handle80CChange(index, 'amount', parseFloat(e.target.value) || 0)}
                                            className="w-full border-gray-200 focus:ring-indigo-500 focus:border-indigo-500 rounded-xl text-sm text-right font-mono"
                                            disabled={!canEdit}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => remove80C(index)}
                                        className="p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                        disabled={!canEdit}
                                    >
                                        <FaTrash size={14} />
                                    </button>
                                </div>
                            ))}
                            {canEdit && (
                                <button
                                    type="button"
                                    onClick={add80C}
                                    className="w-full py-4 border-2 border-dashed border-gray-100 rounded-2xl text-gray-400 hover:border-indigo-200 hover:text-indigo-600 hover:bg-indigo-50/30 transition-all flex items-center justify-center gap-2 text-sm font-bold"
                                >
                                    + Add Another Entry
                                </button>
                            )}
                        </div>
                    </div>

                    {/* HRA */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-50 bg-gray-50/30">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                                    <FaHome />
                                </div>
                                <h2 className="text-xl font-bold text-gray-800">House Rent Allowance (HRA)</h2>
                            </div>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="text-left">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Annual Rent Paid (₹)</label>
                                <input
                                    type="number"
                                    value={declaration.hra?.rentAmount || 0}
                                    onChange={(e) => setDeclaration({ ...declaration, hra: { ...declaration.hra, rentAmount: parseFloat(e.target.value) || 0 } })}
                                    className="w-full border-gray-200 focus:ring-amber-500 focus:border-amber-500 rounded-xl text-lg font-mono"
                                    disabled={!canEdit}
                                />
                            </div>
                            <div className="text-left">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Landlord's PAN</label>
                                <input
                                    type="text"
                                    value={declaration.hra?.landlordPan || ''}
                                    onChange={(e) => setDeclaration({ ...declaration, hra: { ...declaration.hra, landlordPan: e.target.value.toUpperCase() } })}
                                    className="w-full border-gray-200 focus:ring-amber-500 focus:border-amber-500 rounded-xl text-lg uppercase tracking-widest font-mono"
                                    placeholder="ABCDE1234F"
                                    maxLength={10}
                                    disabled={!canEdit}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Summary Card */}
                    <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-100 sticky top-6">
                        <h3 className="text-lg font-bold mb-8 flex items-center gap-2">
                            <FaHistory className="opacity-50" /> Live Summary
                        </h3>
                        <div className="space-y-6">
                            <div className="flex justify-between items-center text-sm border-b border-indigo-500/30 pb-4">
                                <span className="text-indigo-100">80C Investments</span>
                                <span className="font-mono font-bold">₹{(declaration.section80C || []).reduce((sum, i) => sum + (i.amount || 0), 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm border-b border-indigo-500/30 pb-4">
                                <span className="text-indigo-100">HRA Declared</span>
                                <span className="font-mono font-bold">₹{(declaration.hra?.rentAmount || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center pt-4">
                                <div className="text-left">
                                    <span className="text-indigo-100 text-xs block mb-1">Total Deductions</span>
                                    <span className="text-3xl font-black">₹{((declaration.section80C || []).reduce((sum, i) => sum + (i.amount || 0), 0) + (declaration.hra?.rentAmount || 0)).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                        {canEdit && (
                            <button
                                type="submit"
                                className="w-full mt-10 bg-white text-indigo-600 font-black py-4 rounded-2xl hover:bg-slate-50 transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95"
                            >
                                <FaSave /> SAVE & SUBMIT
                            </button>
                        )}
                    </div>

                    <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest">Helpful Tips</h4>
                        <ul className="space-y-4">
                            <li className="flex gap-3 text-xs text-slate-500 leading-relaxed text-left">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0"></div>
                                <span>Maximizing **80C** can save up to ₹45,000 in taxes annually.</span>
                            </li>
                            <li className="flex gap-3 text-xs text-slate-500 leading-relaxed text-left">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0"></div>
                                <span>PAN is only required if annual rent exceeds ₹1,00,000.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default TaxDeclaration;
