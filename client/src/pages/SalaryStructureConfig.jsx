import { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import AuthContext from '../context/AuthContext';

const SalaryStructureConfig = () => {
    const [components, setComponents] = useState([]);
    const [structures, setStructures] = useState([]);
    const [activeTab, setActiveTab] = useState('components');
    const { user } = useContext(AuthContext);
    const canEdit = user?.role === 'Super Admin' || user?.role === 'HR Admin';

    // Form States
    const [newComponent, setNewComponent] = useState({ name: '', type: 'Earning', calculationType: 'Flat Amount', value: 0, isTaxable: true });
    const [newStructure, setNewStructure] = useState({ name: '', description: '', selectedComponents: [] });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const comps = await api.get('/salary/components');
            const structs = await api.get('/salary/structures');
            setComponents(comps.data);
            setStructures(structs.data);
        } catch (error) {
            console.error('Error fetching data', error);
        }
    };

    const handleCreateComponent = async (e) => {
        e.preventDefault();
        try {
            await api.post('/salary/components', newComponent);
            fetchData();
            setNewComponent({ name: '', type: 'Earning', calculationType: 'Flat Amount', value: 0, isTaxable: true });
        } catch (error) {
            console.error('Error creating component', error);
        }
    };

    const handleCreateStructure = async (e) => {
        e.preventDefault();
        try {
            // Transform selectedComponents for API
            const payload = {
                name: newStructure.name,
                description: newStructure.description,
                components: newStructure.selectedComponents
            };
            await api.post('/salary/structures', payload);
            fetchData();
            setNewStructure({ name: '', description: '', selectedComponents: [] });
        } catch (error) {
            console.error('Error creating structure', error);
        }
    };

    const toggleComponentSelection = (id) => {
        const comp = components.find(c => c._id === id);
        setNewStructure(prev => {
            const exists = prev.selectedComponents.find(c => c.component === id);
            if (exists) {
                return { ...prev, selectedComponents: prev.selectedComponents.filter(c => c.component !== id) };
            } else {
                return {
                    ...prev,
                    selectedComponents: [...prev.selectedComponents, {
                        component: id,
                        calculationType: comp.calculationType || 'Flat Amount',
                        value: comp.value || 0
                    }]
                };
            }
        });
    };

    const updateComponentValue = (id, field, value) => {
        let finalValue = value;
        if (field === 'value') {
            finalValue = isNaN(value) ? 0 : value;
        }
        setNewStructure(prev => ({
            ...prev,
            selectedComponents: prev.selectedComponents.map(c =>
                c.component === id ? { ...c, [field]: finalValue } : c
            )
        }));
    };

    return (
        <div className="container px-4 py-8 mx-auto animate-fade-in">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-indigo-100 rounded-lg text-indigo-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Salary Management</h1>
                    <p className="text-gray-500">Configure components and salary templates</p>
                </div>
            </div>

            <div className="mb-6 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('components')}
                        className={`${activeTab === 'components' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                    >
                        Salary Components
                    </button>
                    <button
                        onClick={() => setActiveTab('structures')}
                        className={`${activeTab === 'structures' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                    >
                        Salary Templates
                    </button>
                </nav>
            </div>

            {activeTab === 'components' && (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Create Component */}
                    {canEdit && (
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                                Add New Component
                            </h3>
                            <form onSubmit={handleCreateComponent} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <input type="text" value={newComponent.name} onChange={e => setNewComponent({ ...newComponent, name: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g. Basic Salary" required />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                        <select value={newComponent.type} onChange={e => setNewComponent({ ...newComponent, type: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 focus:ring-indigo-500 focus:border-indigo-500">
                                            <option>Earning</option>
                                            <option>Deduction</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Calculation</label>
                                        <select value={newComponent.calculationType} onChange={e => setNewComponent({ ...newComponent, calculationType: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 focus:ring-indigo-500 focus:border-indigo-500">
                                            <option>Flat Amount</option>
                                            <option>Percentage of Basic</option>
                                        </select>
                                    </div>
                                </div>
                                <button type="submit" className="w-full inline-flex justify-center py-2.5 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                                    Add Component
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Component List */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Existing Components</h3>
                        {components.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                <p className="text-gray-500">No components found. Create one to get started.</p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-100">
                                {components.map(comp => (
                                    <li key={comp._id} className="py-4 flex justify-between items-center hover:bg-gray-50 px-2 rounded-lg transition-colors">
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{comp.name}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{comp.type} • {comp.calculationType}</p>
                                        </div>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${comp.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                            {comp.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'structures' && (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {canEdit && (
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                                Create Template
                            </h3>
                            <form onSubmit={handleCreateStructure} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Structure Name</label>
                                    <input type="text" value={newStructure.name} onChange={e => setNewStructure({ ...newStructure, name: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g. Senior Engineer Grade A" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <input type="text" value={newStructure.description} onChange={e => setNewStructure({ ...newStructure, description: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Standard package for senior roles" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Configure Components</label>
                                    <div className="space-y-4 max-h-96 overflow-y-auto border border-gray-200 p-4 rounded-lg bg-gray-50">
                                        {components.length === 0 ? <p className="text-sm text-gray-500 text-center py-2">No components available.</p> :
                                            components.map(comp => {
                                                const isSelected = newStructure.selectedComponents.some(c => c.component === comp._id);
                                                const selectedComp = newStructure.selectedComponents.find(c => c.component === comp._id);

                                                return (
                                                    <div key={comp._id} className={`p-4 rounded-lg border transition-all ${isSelected ? 'bg-white border-indigo-200 shadow-sm' : 'border-transparent hover:bg-gray-100'}`}>
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <input
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                onChange={() => toggleComponentSelection(comp._id)}
                                                                className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                                            />
                                                            <div className="flex-1">
                                                                <div className="flex justify-between">
                                                                    <span className="font-bold text-gray-900">{comp.name}</span>
                                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${comp.type === 'Earning' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                                        {comp.type}
                                                                    </span>
                                                                </div>
                                                                <p className="text-xs text-gray-500">Default: {comp.calculationType} ({comp.value})</p>
                                                            </div>
                                                        </div>

                                                        {isSelected && (
                                                            <div className="grid grid-cols-2 gap-3 mt-3 ml-8 animate-fade-in">
                                                                <div>
                                                                    <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Calc Type</label>
                                                                    <select
                                                                        value={selectedComp.calculationType}
                                                                        onChange={(e) => updateComponentValue(comp._id, 'calculationType', e.target.value)}
                                                                        className="w-full text-xs border-gray-300 rounded p-1.5 bg-gray-50 focus:bg-white"
                                                                    >
                                                                        <option value="Flat Amount">Flat Amount</option>
                                                                        <option value="Percentage of Basic">% of Basic</option>
                                                                    </select>
                                                                </div>
                                                                <div>
                                                                    <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Value</label>
                                                                    <input
                                                                        type="number"
                                                                        value={selectedComp.value}
                                                                        onChange={(e) => updateComponentValue(comp._id, 'value', parseFloat(e.target.value))}
                                                                        className="w-full text-xs border-gray-300 rounded p-1.5 bg-gray-50 focus:bg-white"
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </div>

                                {/* Salary Preview */}
                                {newStructure.selectedComponents.length > 0 && (
                                    <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 mt-4">
                                        <h4 className="text-sm font-bold text-indigo-900 mb-3 flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                                            Structure Preview (Mock)
                                        </h4>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs text-indigo-700">
                                                <span>Approx Gross:</span>
                                                <span className="font-bold">₹ {
                                                    newStructure.selectedComponents.reduce((acc, curr) => {
                                                        const comp = components.find(c => c._id === curr.component);
                                                        if (comp?.type === 'Earning') return acc + (curr.value || 0);
                                                        return acc;
                                                    }, 0).toLocaleString()
                                                }</span>
                                            </div>
                                            <div className="flex justify-between text-xs text-indigo-700">
                                                <span>Approx Deductions:</span>
                                                <span className="font-bold text-red-600">₹ {
                                                    newStructure.selectedComponents.reduce((acc, curr) => {
                                                        const comp = components.find(c => c._id === curr.component);
                                                        if (comp?.type === 'Deduction') return acc + (curr.value || 0);
                                                        return acc;
                                                    }, 0).toLocaleString()
                                                }</span>
                                            </div>
                                            <div className="pt-2 border-t border-indigo-200 flex justify-between text-sm text-indigo-900">
                                                <span className="font-bold">Net Salary:</span>
                                                <span className="font-bold">₹ {
                                                    (newStructure.selectedComponents.reduce((acc, curr) => {
                                                        const comp = components.find(c => c._id === curr.component);
                                                        return acc + (comp?.type === 'Earning' ? (curr.value || 0) : -(curr.value || 0));
                                                    }, 0)).toLocaleString()
                                                }</span>
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-indigo-400 mt-3 italic">* Estimates based on flat values only. Statutory taxes not included.</p>
                                    </div>
                                )}

                                <button type="submit" className="w-full inline-flex justify-center py-2.5 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                                    Create Template
                                </button>
                            </form>
                        </div>
                    )}

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Saved Templates</h3>
                        {structures.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                <p className="text-gray-500">No templates found.</p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-100">
                                {structures.map(struct => (
                                    <li key={struct._id} className="py-4 hover:bg-gray-50 px-3 rounded-lg transition-colors border border-transparent hover:border-gray-200">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-sm font-bold text-indigo-600">{struct.name}</p>
                                                <p className="text-sm text-gray-500 mt-1">{struct.description}</p>
                                            </div>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                {struct.components.length} Components
                                            </span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SalaryStructureConfig;
