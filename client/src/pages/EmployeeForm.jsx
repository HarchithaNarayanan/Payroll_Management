import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';

const EmployeeForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [formData, setFormData] = useState({
        name: '', email: '', password: 'Welcome@123',
        employeeId: '', designation: '', department: '', dateOfJoining: '',
        personalDetails: { dob: '', gender: 'Male', address: '', phone: '' },
        paymentDetails: { bankName: '', accountNumber: '', ifscCode: '', panNumber: '', uanNumber: '', esiNumber: '' },
        taxRegime: 'New', salaryStructure: ''
    });
    const [structures, setStructures] = useState([]);
    const [message, setMessage] = useState('');
    const [isEdit, setIsEdit] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch structures
                const structRes = await api.get('/salary/structures');
                setStructures(structRes.data);

                // Fetch employee if edit mode
                if (id) {
                    setIsEdit(true);
                    const empRes = await api.get(`/employees/${id}`);
                    const empData = empRes.data;
                    setFormData({
                        name: empData.user?.name || '',
                        email: empData.user?.email || '',
                        password: '', // Don't show password
                        employeeId: empData.employeeId || '',
                        designation: empData.designation || '',
                        department: empData.department || '',
                        dateOfJoining: empData.dateOfJoining ? empData.dateOfJoining.split('T')[0] : '',
                        personalDetails: empData.personalDetails || { dob: '', gender: 'Male', address: '', phone: '' },
                        paymentDetails: empData.paymentDetails || { bankName: '', accountNumber: '', ifscCode: '', panNumber: '', uanNumber: '', esiNumber: '' },
                        taxRegime: empData.taxRegime || 'New',
                        salaryStructure: empData.salaryStructure?._id || empData.salaryStructure || ''
                    });
                }
            } catch (error) {
                console.error('Failed to fetch data', error);
            }
        };
        fetchData();
    }, [id]);

    const handleChange = (e, section) => {
        const { name, value } = e.target;
        if (section) {
            setFormData(prev => ({
                ...prev,
                [section]: { ...prev[section], [name]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEdit) {
                await api.put(`/employees/${id}`, formData);
            } else {
                await api.post('/employees', formData);
            }
            navigate('/employees');
        } catch (error) {
            setMessage(error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} employee`);
        }
    };

    return (
        <div className="container px-4 py-6 mx-auto">
            <h1 className="mb-6 text-2xl font-bold text-gray-800">{isEdit ? 'Edit Employee' : 'Add New Employee'}</h1>
            {message && <div className="p-4 mb-4 text-red-700 bg-red-100 rounded">{message}</div>}

            <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 rounded-lg shadow">
                {/* Account Section */}
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                        </div>
                        Account Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">Full Name</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border-gray-300 rounded-lg shadow-sm border p-2.5 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. Employee Name" required />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">Email Address</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full border-gray-300 rounded-lg shadow-sm border p-2.5 bg-gray-100 cursor-not-allowed" disabled={isEdit} required />
                        </div>
                        {!isEdit && (
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-600 mb-1">Password</label>
                                <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full border-gray-300 rounded-lg shadow-sm border p-2.5 focus:ring-blue-500 focus:border-blue-500" required />
                            </div>
                        )}
                    </div>
                </div>

                {/* Professional Section */}
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                        </div>
                        Professional Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">Employee ID</label>
                            <input type="text" name="employeeId" value={formData.employeeId} onChange={handleChange} className="w-full border-gray-300 rounded-lg shadow-sm border p-2.5" placeholder="EMP-001" required />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">Designation</label>
                            <input type="text" name="designation" value={formData.designation} onChange={handleChange} className="w-full border-gray-300 rounded-lg shadow-sm border p-2.5" placeholder="Software Engineer" required />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">Department</label>
                            <input type="text" name="department" value={formData.department} onChange={handleChange} className="w-full border-gray-300 rounded-lg shadow-sm border p-2.5" placeholder="Engineering" required />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">Date of Joining</label>
                            <input type="date" name="dateOfJoining" value={formData.dateOfJoining} onChange={handleChange} className="w-full border-gray-300 rounded-lg shadow-sm border p-2.5" required />
                        </div>
                    </div>
                </div>

                {/* Payroll Profile Section */}
                <div className="bg-white p-6 rounded-xl border-2 border-blue-50 shadow-sm">
                    <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center shadow-md">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                        </div>
                        Payroll Profile
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">Tax Regime</label>
                            <select name="taxRegime" value={formData.taxRegime} onChange={handleChange} className="w-full border-gray-300 rounded-lg shadow-sm border p-2.5 focus:ring-blue-500 focus:border-blue-500">
                                <option value="New">New Tax Regime</option>
                                <option value="Old">Old Tax Regime</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">Salary Structure</label>
                            <select name="salaryStructure" value={formData.salaryStructure} onChange={handleChange} className="w-full border-gray-300 rounded-lg shadow-sm border p-2.5 focus:ring-blue-500 focus:border-blue-500">
                                <option value="">Select Structure</option>
                                {structures.map(s => (
                                    <option key={s._id} value={s._id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="lg:col-span-3 h-px bg-gray-100 my-2"></div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">Bank Name</label>
                            <input type="text" name="bankName" value={formData.paymentDetails.bankName} onChange={e => handleChange(e, 'paymentDetails')} className="w-full border-gray-300 rounded-lg shadow-sm border p-2.5" placeholder="HDFC Bank" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">Account Number</label>
                            <input type="text" name="accountNumber" value={formData.paymentDetails.accountNumber} onChange={e => handleChange(e, 'paymentDetails')} className="w-full border-gray-300 rounded-lg shadow-sm border p-2.5" placeholder="XXXX XXXX XXXX" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">IFSC Code</label>
                            <input type="text" name="ifscCode" value={formData.paymentDetails.ifscCode} onChange={e => handleChange(e, 'paymentDetails')} className="w-full border-gray-300 rounded-lg shadow-sm border p-2.5" placeholder="HDFC0001234" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">PAN Number</label>
                            <input type="text" name="panNumber" value={formData.paymentDetails.panNumber} onChange={e => handleChange(e, 'paymentDetails')} className="w-full border-gray-300 rounded-lg shadow-sm border p-2.5" placeholder="ABCDE1234F" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">UAN (PF Number)</label>
                            <input type="text" name="uanNumber" value={formData.paymentDetails.uanNumber} onChange={e => handleChange(e, 'paymentDetails')} className="w-full border-gray-300 rounded-lg shadow-sm border p-2.5" placeholder="100XXXXXXXXX" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">ESI Number</label>
                            <input type="text" name="esiNumber" value={formData.paymentDetails.esiNumber} onChange={e => handleChange(e, 'paymentDetails')} className="w-full border-gray-300 rounded-lg shadow-sm border p-2.5" placeholder="31XXXXXXXXX" />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                    <button type="button" onClick={() => navigate('/employees')} className="px-6 py-2.5 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                        Cancel
                    </button>
                    <button type="submit" className="px-8 py-2.5 text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all font-medium">
                        {isEdit ? 'Save Changes' : 'Onboard Employee'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EmployeeForm;
