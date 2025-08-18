import React from 'react';
import { PieChart, Pie, Cell } from 'recharts';

interface ShippingPerformanceData {
    name: string;
    value: number;
}

interface ShippingPerformanceProps {
    data: ShippingPerformanceData[];
}

const COLORS = ['#8884d8', '#FFBB28'];

const ShippingPerformance: React.FC<ShippingPerformanceProps> = ({ data }) => {
    return (
        <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-2">Shipping Performance</h2>
            <PieChart width={300} height={200}>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={0}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
            </PieChart>
        </div>
    );
};

export default ShippingPerformance;