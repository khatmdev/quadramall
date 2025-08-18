import React from 'react';

const PaymentMethodPerformance: React.FC = () => {
    return (
        <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Payment Method Performance</h1>

            {/* Overview Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Payment Methods Card */}
                <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Payment Methods Overview</h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                            <span className="text-gray-600 font-medium">COD</span>
                            <span className="text-blue-600 font-bold">0 Transactions</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                            <span className="text-gray-600 font-medium">Online</span>
                            <span className="text-green-600 font-bold">0 Transactions</span>
                        </div>
                    </div>
                </div>

                {/* Status Breakdown Card */}
                <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Payment Status Breakdown</h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 bg-yellow-50 rounded-lg">
                            <span className="text-gray-600 font-medium">Pending</span>
                            <span className="text-yellow-600 font-bold">0</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                            <span className="text-gray-600 font-medium">Completed</span>
                            <span className="text-green-600 font-bold">0</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
                            <span className="text-gray-600 font-medium">Failed</span>
                            <span className="text-red-600 font-bold">0</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Table */}
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Transaction Details</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                        <tr className="bg-gray-100">
                            <th className="p-3 text-gray-600 font-medium">Method</th>
                            <th className="p-3 text-gray-600 font-medium">Status</th>
                            <th className="p-3 text-gray-600 font-medium">Count</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr className="border-b">
                            <td className="p-3">COD</td>
                            <td className="p-3">Pending</td>
                            <td className="p-3">0</td>
                        </tr>
                        <tr className="border-b">
                            <td className="p-3">COD</td>
                            <td className="p-3">Completed</td>
                            <td className="p-3">0</td>
                        </tr>
                        <tr className="border-b">
                            <td className="p-3">Online</td>
                            <td className="p-3">Failed</td>
                            <td className="p-3">0</td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PaymentMethodPerformance;