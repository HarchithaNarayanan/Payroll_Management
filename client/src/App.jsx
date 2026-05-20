import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ComplianceConfig from './pages/ComplianceConfig';
import EmployeeList from './pages/EmployeeList';
import EmployeeForm from './pages/EmployeeForm';
import SalaryStructureConfig from './pages/SalaryStructureConfig';
import Attendance from './pages/Attendance';
import PayrollProcess from './pages/PayrollProcess';
import Payslip from './pages/Payslip';
import MyPayslips from './pages/MyPayslips';
import TaxDeclaration from './pages/TaxDeclaration';
import Reports from './pages/Reports';
import AuditLogs from './pages/AuditLogs';
import SalaryStructure from './pages/SalaryStructure';
import PayrollProfileList from './pages/PayrollProfileList';
import PayrollProfileForm from './pages/PayrollProfileForm';
import Unauthorized from './pages/Unauthorized';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/statutory" element={
                <ProtectedRoute allowedRoles={['Super Admin']}>
                  <ComplianceConfig />
                </ProtectedRoute>
              } />
              <Route path="/employees" element={<EmployeeList />} />
              <Route path="/employees/new" element={<EmployeeForm />} />
              <Route path="/employees/:id" element={<EmployeeForm />} />
              <Route path="/salary-config" element={
                <ProtectedRoute allowedRoles={['Super Admin', 'Payroll Admin', 'HR Admin']}>
                  <SalaryStructureConfig />
                </ProtectedRoute>
              } />
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/payroll" element={
                <ProtectedRoute allowedRoles={['Super Admin', 'Payroll Admin', 'HR Admin']}>
                  <PayrollProcess />
                </ProtectedRoute>
              } />
              <Route path="/payslip/:id" element={<Payslip />} />
              <Route path="/my-payslips" element={<MyPayslips />} />
              <Route path="/employee/salary-structure" element={
                <ProtectedRoute allowedRoles={['Employee']}>
                  <SalaryStructure />
                </ProtectedRoute>
              } />
              <Route path="/tax-declaration" element={<TaxDeclaration />} />
              <Route path="/payroll-profiles" element={
                <ProtectedRoute allowedRoles={['Super Admin', 'Payroll Admin', 'HR Admin']}>
                  <PayrollProfileList />
                </ProtectedRoute>
              } />
              <Route path="/payroll-profile/:employeeId" element={
                <ProtectedRoute allowedRoles={['Super Admin', 'HR Admin']}>
                  <PayrollProfileForm />
                </ProtectedRoute>
              } />
              <Route path="/reports" element={
                <ProtectedRoute allowedRoles={['Super Admin', 'Payroll Admin', 'Finance', 'HR Admin']}>
                  <Reports />
                </ProtectedRoute>
              } />
              <Route path="/audit-logs" element={
                <ProtectedRoute allowedRoles={['Super Admin', 'Payroll Admin']}>
                  <AuditLogs />
                </ProtectedRoute>
              } />
            </Route>
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
