import { useState, useEffect } from 'react';
import api from '../utils/api';
import { FaMoneyBillWave, FaShieldAlt, FaInfoCircle } from 'react-icons/fa';

const SalaryStructure = () => {
    const [structure, setStructure] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStructure = async () => {
            try {
                const res = await api.get('/employee/salary-structure');
                setStructure(res.data);
            } catch (error) {
                console.error('Error fetching structure:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStructure();
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500 font-medium tracking-tight animate-pulse">Fetching your salary configuration...</div>;

    if (!structure) return (
        <div className="p-12 text-center bg-white rounded-3xl border border-gray-100 shadow-sm">
            <FaInfoCircle className="mx-auto text-gray-300 text-4xl mb-4" />
            <h2 className="text-xl font-bold text-gray-800">No structure assigned yet</h2>
            <p className="text-gray-500 mt-2 max-w-xs mx-auto">Please contact HR to have your salary structure configured in the system.</p>
        </div>
    );

    const earnings = structure.components?.filter(c => c.component?.type === 'Earning') || [];
    const deductions = structure.components?.filter(c => c.component?.type === 'Deduction') || [];

    const calculateAnnual = (monthly) => monthly * 12;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
            <div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">Salary Structure</h1>
                <div className="flex items-center gap-3 mt-3">
                    <span className="bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">{structure.name}</span>
                    <p className="text-gray-400 font-medium text-sm">Monthly & Annual Breakdown</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Earnings */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 bg-green-50/50 border-b border-green-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-green-500 p-2 rounded-xl text-white shadow-lg shadow-green-500/20">
                                <FaMoneyBillWave size={16} />
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">Earnings</h2>
                        </div>
                        <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">Monthly</span>
                    </div>
                    <div className="p-6 divide-y divide-gray-50">
                        {earnings.map((item, idx) => (
                            <div key={idx} className="py-4 flex justify-between items-center group">
                                <span className="font-bold text-gray-600 group-hover:text-blue-600 transition-colors">{item.component?.name}</span>
                                <div className="text-right">
                                    <p className="font-black text-gray-800">₹{item.value?.toLocaleString()}</p>
                                    <p className="text-[10px] text-gray-400 font-medium">₹{calculateAnnual(item.value).toLocaleString()}/yr</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Deductions */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 bg-red-50/50 border-b border-red-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-red-500 p-2 rounded-xl text-white shadow-lg shadow-red-500/20">
                                <FaShieldAlt size={16} />
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">Deductions</h2>
                        </div>
                        <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Monthly</span>
                    </div>
                    <div className="p-6 divide-y divide-gray-50">
                        {deductions.map((item, idx) => (
                            <div key={idx} className="py-4 flex justify-between items-center group">
                                <span className="font-bold text-gray-600 group-hover:text-red-600 transition-colors">{item.component?.name}</span>
                                <div className="text-right">
                                    <p className="font-black text-red-600">₹{item.value?.toLocaleString()}</p>
                                    <p className="text-[10px] text-gray-400 font-medium">₹{calculateAnnual(item.value).toLocaleString()}/yr</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-gray-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 relative z-10">
                    <div>
                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Total Compensation (CTC)</p>
                        <div className="space-y-1">
                            <h3 className="text-5xl font-black text-white">₹{structure.totalCTC?.toLocaleString()} <span className="text-xl font-medium text-gray-500">per annum</span></h3>
                            <p className="text-gray-400 font-medium">Estimated take-home: <span className="text-green-400 font-black italic">₹{Math.round((structure.totalCTC - deductions.reduce((s, d) => s + calculateAnnual(d.value), 0)) / 12).toLocaleString()} / month</span></p>
                        </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 text-right">
                        <p className="text-[10px] font-black text-blue-300 uppercase mb-1">Monthly Gross</p>
                        <p className="text-2xl font-black">₹{Math.round(structure.totalCTC / 12).toLocaleString()}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalaryStructure;
