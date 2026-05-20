import { useState, useEffect } from 'react';
import api from '../utils/api';
import { FaCalculator, FaShieldAlt, FaPercent, FaCalendarAlt } from 'react-icons/fa';

const TaxDetails = () => {
    const [taxData, setTaxData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTaxDetails = async () => {
            try {
                const res = await api.get('/employee/tax-details');
                setTaxData(res.data);
            } catch (error) {
                console.error('Error fetching tax details:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchTaxDetails();
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500 font-bold animate-pulse">Calculating tax projections...</div>;

    if (!taxData) return <div className="p-8 text-center text-gray-500">No tax data found. Please complete your tax declaration.</div>;

    const { taxRegime, declaration } = taxData;
    const total80C = declaration?.section80C?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
    const hraAmount = declaration?.hra?.rentAmount || 0;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
            <div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">Tax Overview</h1>
                <p className="text-gray-500 font-medium mt-2">Financial Year: <span className="text-blue-600 font-bold">2024-2025</span></p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <div className="bg-blue-50 text-blue-600 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
                        <FaShieldAlt />
                    </div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Selected Regime</p>
                    <h3 className="text-2xl font-black text-blue-600">{taxRegime} Regime</h3>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <div className="bg-green-50 text-green-600 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
                        <FaPercent />
                    </div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Declarations</p>
                    <h3 className="text-2xl font-black text-green-600">₹{(total80C + hraAmount).toLocaleString()}</h3>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <div className="bg-amber-50 text-amber-600 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
                        <FaCalendarAlt />
                    </div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
                    <h3 className="text-2xl font-black text-amber-600">{declaration?.status || 'Not Submitted'}</h3>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                    <h2 className="text-xl font-bold text-gray-800">Declaration Breakdown</h2>
                    <FaCalculator className="text-gray-300" />
                </div>
                <div className="p-8 space-y-6">
                    <div className="flex justify-between items-center py-4 border-b border-gray-50 group">
                        <div>
                            <p className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">Section 80C</p>
                            <p className="text-xs text-gray-400 mt-1">Investments like LIC, PPF, ELSS</p>
                        </div>
                        <p className="text-xl font-black text-gray-800">₹{total80C.toLocaleString()}</p>
                    </div>

                    <div className="flex justify-between items-center py-4 border-b border-gray-50 group">
                        <div>
                            <p className="font-bold text-gray-800 group-hover:text-amber-600 transition-colors">HRA Exemption</p>
                            <p className="text-xs text-gray-400 mt-1">Based on rent paid and city type</p>
                        </div>
                        <p className="text-xl font-black text-gray-800">₹{hraAmount.toLocaleString()}</p>
                    </div>

                    <div className="flex justify-between items-center py-4 group">
                        <div>
                            <p className="font-bold text-gray-800 group-hover:text-red-500 transition-colors">Other Deductions</p>
                            <p className="text-xs text-gray-400 mt-1">Section 80D, Education Loans, etc.</p>
                        </div>
                        <p className="text-xl font-black text-gray-800">₹{(declaration?.section80D?.amount || 0).toLocaleString()}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaxDetails;
