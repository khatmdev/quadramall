import React from 'react';

interface TopCustomerData {
    name: string;
    orders: number;
    spent: number;
}

interface TopCustomersProps {
    data: TopCustomerData[];
}

const TopCustomers: React.FC<TopCustomersProps> = ({ data }) => {
    return (
        <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-2">Top Customers</h2>
            <table className="w-full text-left">
                <thead>
                <tr className="bg-gray-100">
                    <th className="p-2">Name</th>
                    <th className="p-2">Orders</th>
                    <th className="p-2">Spent</th>
                </tr>
                </thead>
                <tbody>
                {data.map((customer, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="p-2 flex items-center">
                            <img
                                src={`https://i.pravatar.cc/20?img=${index + 1}`}
                                alt={customer.name}
                                className="w-5 h-5 rounded-full mr-2"
                            />
                            {customer.name}
                        </td>
                        <td className="p-2">{customer.orders}</td>
                        <td className="p-2">${customer.spent.toLocaleString()}</td>
                    </tr>
                ))}
                </tbody>
            </table>
            <p className="text-sm text-green-500 mt-2">Store Funnel <span className="text-black">Conversion Rate: 28% Increase</span></p>
        </div>
    );
};

export default TopCustomers;