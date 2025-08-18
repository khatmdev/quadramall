import React from 'react';

interface TopProductData {
    name: string;
    clicks: number;
    units: number;
}

interface TopProductsProps {
    data: TopProductData[];
}

const TopProducts: React.FC<TopProductsProps> = ({ data }) => {
    return (
        <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-2">Top Products</h2>
            <table className="w-full text-left">
                <thead>
                <tr className="bg-gray-100">
                    <th className="p-2">Name</th>
                    <th className="p-2">Clicks</th>
                    <th className="p-2">Units Sold</th>
                </tr>
                </thead>
                <tbody>
                {data.map((product, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="p-2 flex items-center">
                            <img
                                src={`https://i.pravatar.cc/20?img=${index + 1}`}
                                alt={product.name}
                                className="w-5 h-5 rounded-full mr-2"
                            />
                            {product.name}
                        </td>
                        <td className="p-2">{product.clicks.toLocaleString()}</td>
                        <td className="p-2">{product.units}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default TopProducts;