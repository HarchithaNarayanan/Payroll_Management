import { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import AuthContext from '../context/AuthContext';

const ComplianceConfig = () => {
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [config, setConfig] = useState({
        pf: { enabled: true, employerContribution: 12, employeeContribution: 12 },
        esi: { enabled: true, employerContribution: 3.25, employeeContribution: 0.75 },
        professionalTax: { enabled: false, slabs: [] }
    });
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const { data } = await api.get('/statutory');
            // Even if data is empty or generic, we merge it with defaults
            setConfig(prev => {
                if (data) {
                    return {
                        ...prev,
                        ...data,
                        pf: {
                            ...prev.pf,
                            ...(data.pf || {}),
                            enabled: data.pf?.enabled ?? prev.pf.enabled,
                            employerContribution: data.pf?.employerContribution ?? prev.pf.employerContribution,
                            employeeContribution: data.pf?.employeeContribution ?? prev.pf.employeeContribution,
                        },
                        esi: {
                            ...prev.esi,
                            ...(data.esi || {}),
                            enabled: data.esi?.enabled ?? prev.esi.enabled,
                            employerContribution: data.esi?.employerContribution ?? prev.esi.employerContribution,
                            employeeContribution: data.esi?.employeeContribution ?? prev.esi.employeeContribution,
                        },
                        professionalTax: {
                            ...prev.professionalTax,
                            ...(data.professionalTax || {}),
                            enabled: data.professionalTax?.enabled ?? prev.professionalTax.enabled,
                            slabs: data.professionalTax?.slabs || []
                        }
                    };
                }
                return prev;
            });
        } catch (error) {
            console.error('Error fetching config', error);
            // On error, we still show the default UI rather than "nothing"
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (section, field, value) => {
        setConfig(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.put('/statutory', config);
            setMessage('Configuration updated successfully');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage('Failed to update configuration');
        }
    };

    if (loading) return <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>;

    return (
        <div className="container px-4 py-6 mx-auto animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Statutory & Compliance</h1>
                    <p className="text-gray-500">Manage PF, ESI, Professional Tax and other rules</p>
                </div>
            </div>

            {message && (
                <div className={`p-4 mb-6 rounded-lg border-l-4 flex items-center gap-3 ${message.includes('success') ? 'bg-green-50 border-green-500 text-green-700' : 'bg-red-50 border-red-500 text-red-700'}`}>
                    <span>{message}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* PF Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gray-50">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-800">Provident Fund (PF)</h2>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={config.pf.enabled} onChange={(e) => handleChange('pf', 'enabled', e.target.checked)} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                <span className="ml-3 text-sm font-medium text-gray-900">{config.pf.enabled ? 'Enabled' : 'Disabled'}</span>
                            </label>
                        </div>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Employer Contribution (%)</label>
                            <input
                                type="number"
                                value={config.pf.employerContribution}
                                onChange={(e) => handleChange('pf', 'employerContribution', parseFloat(e.target.value))}
                                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2.5 bg-gray-50 border"
                                disabled={!config.pf.enabled}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Employee Contribution (%)</label>
                            <input
                                type="number"
                                value={config.pf.employeeContribution}
                                onChange={(e) => handleChange('pf', 'employeeContribution', parseFloat(e.target.value))}
                                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2.5 bg-gray-50 border"
                                disabled={!config.pf.enabled}
                            />
                        </div>
                    </div>
                </div>

                {/* ESI Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gray-50">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-800">Employee State Insurance (ESI)</h2>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={config.esi.enabled} onChange={(e) => handleChange('esi', 'enabled', e.target.checked)} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                <span className="ml-3 text-sm font-medium text-gray-900">{config.esi.enabled ? 'Enabled' : 'Disabled'}</span>
                            </label>
                        </div>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Employer Contribution (%)</label>
                            <input
                                type="number"
                                value={config.esi.employerContribution}
                                onChange={(e) => handleChange('esi', 'employerContribution', parseFloat(e.target.value))}
                                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2.5 bg-gray-50 border"
                                disabled={!config.esi.enabled}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Employee Contribution (%)</label>
                            <input
                                type="number"
                                value={config.esi.employeeContribution}
                                onChange={(e) => handleChange('esi', 'employeeContribution', parseFloat(e.target.value))}
                                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2.5 bg-gray-50 border"
                                disabled={!config.esi.enabled}
                            />
                        </div>
                    </div>
                </div>

                {/* Professional Tax Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gray-50">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-800">Professional Tax (PT)</h2>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={config.professionalTax.enabled} onChange={(e) => handleChange('professionalTax', 'enabled', e.target.checked)} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                <span className="ml-3 text-sm font-medium text-gray-900">{config.professionalTax.enabled ? 'Enabled' : 'Disabled'}</span>
                            </label>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-medium text-gray-700">Salary Slabs & Tax Amount</h3>
                            <button
                                type="button"
                                onClick={() => {
                                    const newSlabs = [...config.professionalTax.slabs, { minSalary: 0, maxSalary: 0, taxAmount: 0 }];
                                    handleChange('professionalTax', 'slabs', newSlabs);
                                }}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                                disabled={!config.professionalTax.enabled}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                                Add Slab
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 border rounded-lg overflow-hidden">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min Salary</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max Salary</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tax Amount</th>
                                        <th className="px-4 py-2"></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {config.professionalTax.slabs.map((slab, index) => (
                                        <tr key={index}>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="number"
                                                    value={slab.minSalary}
                                                    onChange={(e) => {
                                                        const newSlabs = [...config.professionalTax.slabs];
                                                        newSlabs[index].minSalary = parseFloat(e.target.value);
                                                        handleChange('professionalTax', 'slabs', newSlabs);
                                                    }}
                                                    className="w-full border-gray-300 rounded p-1 text-sm bg-gray-50"
                                                    disabled={!config.professionalTax.enabled}
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="number"
                                                    value={slab.maxSalary}
                                                    onChange={(e) => {
                                                        const newSlabs = [...config.professionalTax.slabs];
                                                        newSlabs[index].maxSalary = parseFloat(e.target.value);
                                                        handleChange('professionalTax', 'slabs', newSlabs);
                                                    }}
                                                    className="w-full border-gray-300 rounded p-1 text-sm bg-gray-50"
                                                    placeholder="999999 for infinity"
                                                    disabled={!config.professionalTax.enabled}
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="number"
                                                    value={slab.taxAmount}
                                                    onChange={(e) => {
                                                        const newSlabs = [...config.professionalTax.slabs];
                                                        newSlabs[index].taxAmount = parseFloat(e.target.value);
                                                        handleChange('professionalTax', 'slabs', newSlabs);
                                                    }}
                                                    className="w-full border-gray-300 rounded p-1 text-sm bg-gray-50"
                                                    disabled={!config.professionalTax.enabled}
                                                />
                                            </td>
                                            <td className="px-4 py-2 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newSlabs = config.professionalTax.slabs.filter((_, i) => i !== index);
                                                        handleChange('professionalTax', 'slabs', newSlabs);
                                                    }}
                                                    className="text-red-600 hover:text-red-900"
                                                    disabled={!config.professionalTax.enabled}
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {config.professionalTax.slabs.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="px-4 py-4 text-center text-sm text-gray-500 italic">
                                                No slabs defined. Click "Add Slab" to start.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-colors shadow-lg shadow-blue-500/30"
                    >
                        Save Configuration
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ComplianceConfig;
