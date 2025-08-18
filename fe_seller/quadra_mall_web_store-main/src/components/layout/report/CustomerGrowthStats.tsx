import React from 'react';

const CustomerGrowthStats: React.FC = () => {
    return (
        <div className="grid grid-cols-4 gap-4 mt-4 text-sm text-gray-700">
            <div>
                <p>Existing Users</p>
                <p className="font-bold">5,653</p>
                <p className="text-green-600">+22.45% ↑</p>
            </div>
            <div>
                <p>New Users</p>
                <p className="font-bold">1,650</p>
                <p className="text-green-600">+15.34% ↑</p>
            </div>
            <div>
                <p>Total Visits</p>
                <p className="font-bold">9,504</p>
                <p className="text-red-600">-18.25% ↓</p>
            </div>
            <div>
                <p>Unique Visits</p>
                <p className="font-bold">5,423</p>
                <p className="text-red-600">-10.24% ↓</p>
            </div>
        </div>
    );
};

export default CustomerGrowthStats;