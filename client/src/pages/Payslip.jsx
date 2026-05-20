import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import PayslipDocument from '../components/PayslipDocument';
import { generatePDF } from '../utils/pdfGenerator';

const Payslip = () => {
    const { id } = useParams();
    const [payslip, setPayslip] = useState(null);

    useEffect(() => {
        const fetchPayslip = async () => {
            try {
                const { data } = await api.get(`/payroll/payslip/${id}`);
                setPayslip(data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchPayslip();
    }, [id]);

    if (!payslip) return <div>Loading...</div>;

    const { employee, organization, month, year, earnings, deductions, grossSalary, totalDeductions, netSalary } = payslip;

    return (
        <div className="container mx-auto p-8 bg-gray-50 min-h-screen">
            <div id="payslip-container">
                <PayslipDocument payslip={payslip} id="payslip-content" />
            </div>

            <div className="text-center mt-6 flex justify-center gap-4">
                <button onClick={() => window.print()} className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700">
                    Print
                </button>
                <button onClick={() => generatePDF('payslip-content', `Payslip_${payslip.employee.employeeId}_${payslip.month}_${payslip.year}.pdf`)} className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700">
                    Download PDF
                </button>
            </div>
        </div>
    );
};

export default Payslip;
