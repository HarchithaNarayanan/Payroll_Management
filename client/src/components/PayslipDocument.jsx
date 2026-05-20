import React from 'react';

const PayslipDocument = ({ payslip, id }) => {
    if (!payslip) return null;

    const { employee, organization, month, year, earnings, deductions, grossSalary, totalDeductions, netSalary } = payslip;

    return (
        <div id={id} style={{ backgroundColor: '#ffffff', color: '#111827' }} className="p-8 max-w-4xl mx-auto">
            {/* Header */}
            <div style={{ textAlign: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem', marginBottom: '1rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.25rem' }}>{organization.name}</h1>
                <p style={{ color: '#6b7280' }}>{organization.address || 'Company Address'}</p>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginTop: '0.5rem' }}>Payslip for {new Date(year, month - 1).toLocaleString('default', { month: 'long' })} {year}</h2>
            </div>

            {/* Employee Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                <div>
                    <p><span style={{ fontWeight: 'bold' }}>Employee Name:</span> {employee?.user?.name || 'N/A'}</p>
                    <p><span style={{ fontWeight: 'bold' }}>Employee ID:</span> {employee.employeeId}</p>
                    <p><span style={{ fontWeight: 'bold' }}>Designation:</span> {employee.designation}</p>
                    <p><span style={{ fontWeight: 'bold' }}>Department:</span> {employee.department}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <p><span style={{ fontWeight: 'bold' }}>Date of Joining:</span> {new Date(employee.dateOfJoining).toLocaleDateString()}</p>
                    <p><span style={{ fontWeight: 'bold' }}>PAN:</span> {employee.paymentDetails?.panNumber || 'N/A'}</p>
                    <p><span style={{ fontWeight: 'bold' }}>Bank Account:</span> {employee.paymentDetails?.accountNumber || 'N/A'}</p>
                    <p><span style={{ fontWeight: 'bold' }}>Days Worked:</span> {payslip.presentDays} / {payslip.workingDays}</p>
                    <p><span style={{ fontWeight: 'bold' }}>OT Hours:</span> {payslip.overtimeHours || 0}</p>
                </div>
            </div>

            {/* Salary Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', overflow: 'hidden', marginBottom: '1.5rem' }}>
                {/* Earnings */}
                <div>
                    <div style={{ backgroundColor: '#f3f4f6', padding: '0.5rem', fontWeight: 'bold', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>Earnings</div>
                    <div style={{ padding: '1rem' }}>
                        {earnings.map((e, index) => (
                            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0' }}>
                                <span>{e.name}</span>
                                <span>₹{e.amount.toLocaleString()}</span>
                            </div>
                        ))}
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', marginTop: '0.5rem', borderTop: '1px solid #e5e7eb', fontWeight: 'bold' }}>
                            <span>Total Earnings</span>
                            <span>₹{grossSalary.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Deductions */}
                <div style={{ borderLeft: '1px solid #e5e7eb' }}>
                    <div style={{ backgroundColor: '#f3f4f6', padding: '0.5rem', fontWeight: 'bold', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>Deductions</div>
                    <div style={{ padding: '1rem' }}>
                        {deductions.map((d, index) => (
                            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0' }}>
                                <span>{d.name}</span>
                                <span>₹{d.amount.toLocaleString()}</span>
                            </div>
                        ))}
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', marginTop: '0.5rem', borderTop: '1px solid #e5e7eb', fontWeight: 'bold' }}>
                            <span>Total Deductions</span>
                            <span>₹{totalDeductions.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Net Pay */}
            <div style={{ backgroundColor: '#eef2ff', padding: '1rem', borderRadius: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#312e81' }}>Net Payable</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4338ca' }}>₹{netSalary.toLocaleString()}</span>
            </div>
            <div style={{ textAlign: 'center', fontSize: '0.875rem', color: '#6b7280' }}>
                <p>Amount in words: One Lakh ... only</p>
                <p style={{ marginTop: '1rem' }}>This is a system generated payslip and does not require signature.</p>
            </div>
        </div>
    );
};

export default PayslipDocument;
