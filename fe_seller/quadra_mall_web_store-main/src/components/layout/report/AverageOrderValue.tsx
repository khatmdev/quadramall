import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface AverageOrderValueData {
    name: string;
    value: number;
}

interface AverageOrderValueProps {
    data: AverageOrderValueData[];
}

const AverageOrderValue: React.FC<AverageOrderValueProps> = ({ data }) => {
    return (
        <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-2">Average Order Value</h2>
            <p className="text-sm text-gray-500 mb-4">This Month: $60.00 | Previous Month: $48.00</p>
            <LineChart width={300} height={200} data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
        </div>
    );
};

export default AverageOrderValue;