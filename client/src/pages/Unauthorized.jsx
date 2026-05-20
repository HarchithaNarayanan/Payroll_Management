import { Link } from 'react-router-dom';

const Unauthorized = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-4xl font-bold text-red-600">403 - Unauthorized</h1>
            <p className="mt-4 text-lg text-gray-700">You do not have permission to view this page.</p>
            <Link to="/dashboard" className="mt-6 text-indigo-600 hover:text-indigo-500">
                Go back to Dashboard
            </Link>
        </div>
    );
};

export default Unauthorized;
