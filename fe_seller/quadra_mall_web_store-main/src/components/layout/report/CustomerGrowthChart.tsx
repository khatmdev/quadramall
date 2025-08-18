import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface CustomerGrowthData {
    name: string;
    new: number;
    returning: number;
}

interface CustomerGrowthChartProps {
    data: CustomerGrowthData[];
    timeRange: string;
}

const CustomerGrowthChart: React.FC<CustomerGrowthChartProps> = ({ data, timeRange }) => {
    // Lọc dữ liệu dựa trên timeRange
    const filteredData = data.filter((item) => {
        const monthIndex = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(item.name);
        if (timeRange === 'Last 6 Months') return monthIndex >= 6;
        if (timeRange === 'Last 3 Months') return monthIndex >= 9;
        if (timeRange === 'Custom Range') return monthIndex >= 0; // Có thể tùy chỉnh logic cho Custom Range
        return true; // Last 12 Months
    });

    return (
        <div className="w-full">
            <BarChart width={1000} height={300} data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend
                    wrapperStyle={{ paddingTop: '10px' }}
                    formatter={(value) => <span style={{ color: '#6b7280' }}>{value}</span>}
                />
                <Bar dataKey="returning" fill="#d1d5db" name="Returning customers" barSize={20} />
                <Bar dataKey="new" fill="#3b82f6" name="New customers" barSize={20} />
            </BarChart>
        </div>
    );
};

export default CustomerGrowthChart;