import React from 'react';
import { PieChart, Pie, Cell } from 'recharts';

interface SalesGoalsData {
    current: number;
    goal: number;
}

interface SalesGoalsProps {
    data: SalesGoalsData;
}

const COLORS = ['#FFBB28', '#FF8042'];

const SalesGoals: React.FC<SalesGoalsProps> = ({ data }) => {
    const pieData = [
        { name: 'Achieved', value: data.current },
        { name: 'Remaining', value: data.goal - data.current },
    ];

    return (
        <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-2">Sales Goal</h2>
            <PieChart width={300} height={200}>
                <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                >
                    {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-xl font-bold">
                    {data.current.toLocaleString()}
                </text>
            </PieChart>
            <p className="text-sm text-gray-500 mt-2">Goal: $15,000</p>
        </div>
    );
};

export default SalesGoals;