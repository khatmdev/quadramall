import React, { useState } from 'react';
import CustomerGrowthChart from './CustomerGrowthChart';
import CustomerGrowthStats from './CustomerGrowthStats';

interface CustomerGrowthData {
    name: string;
    new: number;
    returning: number;
}

interface CustomerGrowthProps {
    data: CustomerGrowthData[];
}

const CustomerGrowth: React.FC<CustomerGrowthProps> = ({ data }) => {
    const [timeRange, setTimeRange] = useState('Last 12 Months');

    const handleTimeRangeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setTimeRange(event.target.value);
    };

    return (
        <div className="bg-white p-4 rounded shadow">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Customer Growth</h2>
                <div className="relative">
                    <select
                        value={timeRange}
                        onChange={handleTimeRangeChange}
                        className="text-sm text-gray-500 appearance-none bg-transparent border-none focus:outline-none pr-6"
                    >
                        <option value="Last 12 Months">Last 12 Months</option>
                        <option value="Last 6 Months">Last 6 Months</option>
                        <option value="Last 3 Months">Last 3 Months</option>
                        <option value="Custom Range">Custom Range</option>
                    </select>
                    <span className="absolute right-0 top-1/2 transform -translate-y-1/2 pointer-events-none">▼</span>
                </div>
            </div>
            <CustomerGrowthChart data={data} timeRange={timeRange} />
            <CustomerGrowthStats />
        </div>
    );
};

export default CustomerGrowth;