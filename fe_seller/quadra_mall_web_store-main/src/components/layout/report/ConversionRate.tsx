import React from 'react';
import { PieChart, Pie, Cell } from 'recharts';

interface ConversionRateData {
    name: string;
    value: number;
}

interface ConversionRateProps {
    data: ConversionRateData[];
}

const COLORS = ['#8884d8', '#82ca9d'];

const ConversionRate: React.FC<ConversionRateProps> = ({ data }) => {
    return (
        <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-2">Conversion Rate</h2>
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
            <p className="text-sm text-gray-500 mt-2">Cart: 75% | Checkout: 25%</p>
        </div>
    );
};

export default ConversionRate;