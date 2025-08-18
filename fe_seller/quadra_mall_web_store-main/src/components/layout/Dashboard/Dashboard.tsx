import React from 'react';
import {
  FiArrowUpRight,
  FiArrowDownRight,
  FiDollarSign,
  FiUsers,
  FiBarChart2,
  FiShoppingBag,
  FiLogOut,
} from 'react-icons/fi';
import { LineChart, Line, XAxis, Tooltip, CartesianGrid, BarChart, Bar, YAxis, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';

const statCards = [
  { title: 'Total Revenue', value: '$10.54K', icon: <FiDollarSign />, percent: '+22.45%', up: true },
  { title: 'Orders', value: '1,056', icon: <FiShoppingBag />, percent: '+13.2%', up: true },
  { title: 'Unique Visits', value: '5,420', icon: <FiBarChart2 />, percent: '-10.2%', up: false },
  { title: 'New Users', value: '1,650', icon: <FiUsers />, percent: '+15.6%', up: true },
  { title: 'Existing User', value: '9,653', icon: <FiUsers />, percent: '+22.45%', up: true },
];

const lineData = [
  { hour: '4am', day21: 10, day22: 14 },
  { hour: '5am', day21: 12, day22: 18 },
  { hour: '6am', day21: 20, day22: 34 },
  { hour: '7am', day21: 25, day22: 32 },
  { hour: '8am', day21: 35, day22: 40 },
  { hour: '9am', day21: 40, day22: 30 },
  { hour: '10am', day21: 42, day22: 28 },
  { hour: '11am', day21: 30, day22: 20 },
  { hour: '12pm', day21: 25, day22: 26 },
  { hour: '1pm', day21: 22, day22: 22 },
  { hour: '2pm', day21: 28, day22: 30 },
  { hour: '3pm', day21: 20, day22: 26 },
];

const barData = [
  { day: '12', revenue: 1200 },
  { day: '13', revenue: 1600 },
  { day: '14', revenue: 1800 },
  { day: '15', revenue: 2000 },
  { day: '16', revenue: 1400 },
  { day: '17', revenue: 2296 },
  { day: '18', revenue: 1300 },
];

const recentTransactions = [
  { name: 'Jagranath S.', date: '24.05.2023', amount: '$124.97', status: 'Paid' },
  { name: 'Anand G.', date: '23.05.2023', amount: '$55.42', status: 'Pending' },
  { name: 'Kartik S.', date: '23.05.2023', amount: '$89.80', status: 'Paid' },
  { name: 'Rakesh S.', date: '22.05.2023', amount: '$144.94', status: 'Pending' },
  { name: 'Anup S.', date: '22.05.2023', amount: '$70.52', status: 'Paid' },
];

const topProducts = [
  { name: 'Men Grey Hoodie', price: '$49.90', units: 204 },
  { name: 'Women Striped T-Shirt', price: '$34.90', units: 155 },
  { name: 'Women White T-Shirt', price: '$34.90', units: 155 },
  { name: 'Men White T-Shirt', price: '$34.90', units: 150 },
  { name: 'Women Red T-Shirt', price: '$34.90', units: 135 },
];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('selectedStoreId');
    navigate('/login');
  };

  return (
      <div className="p-4 sm:p-6 space-y-6 bg-gray-50 min-h-screen flex flex-col">
        {/* Header */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {statCards.map((stat, index) => (
              <div key={index} className="bg-white p-4 rounded-xl shadow-sm flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500">
                  <span>{stat.title}</span>
                  <span className="text-base sm:text-lg text-gray-700">{stat.icon}</span>
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800">{stat.value}</h3>
                  <span className={`text-xs sm:text-sm flex items-center gap-1 ${stat.up ? 'text-green-500' : 'text-red-500'}`}>
                {stat.up ? <FiArrowUpRight /> : <FiArrowDownRight />}
                    {stat.percent}
              </span>
                </div>
              </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 bg-white p-4 rounded-xl shadow-sm">
            <div className="flex justify-between mb-2">
              <div>
                <p className="text-gray-600 text-xs sm:text-sm">Orders Over Time</p>
                <h4 className="font-semibold text-lg sm:text-xl">
                  645 <span className="text-xs sm:text-sm font-normal text-gray-500">on May 22</span>
                </h4>
                <p className="text-xs sm:text-sm text-gray-500">472 on May 21</p>
              </div>
              <span className="text-xs sm:text-sm text-gray-400">Last 12 Hours</span>
            </div>
            <ResponsiveContainer width="100%" height={200} minHeight={150}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="day21" stroke="#d1d5db" strokeWidth={2} />
                <Line type="monotone" dataKey="day22" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm">
            <p className="text-gray-600 text-xs sm:text-sm mb-2">Last 7 Days Sales</p>
            <h3 className="text-lg sm:text-xl font-semibold">
              1,259 <span className="text-xs sm:text-sm font-normal text-gray-500">Items Sold</span>
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 mb-2">$12,546 Revenue</p>
            <ResponsiveContainer width="100%" height={150} minHeight={100}>
              <BarChart data={barData}>
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="revenue" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <h4 className="text-sm sm:text-md font-semibold mb-3">Recent Transactions</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm text-left">
                <thead className="text-gray-500">
                <tr>
                  <th className="py-2 pr-2">Name</th>
                  <th className="py-2 pr-2">Date</th>
                  <th className="py-2 pr-2">Amount</th>
                  <th className="py-2">Status</th>
                </tr>
                </thead>
                <tbody className="text-gray-700">
                {recentTransactions.map((tx, i) => (
                    <tr key={i} className="border-t border-gray-200">
                      <td className="py-2 pr-2">{tx.name}</td>
                      <td className="py-2 pr-2">{tx.date}</td>
                      <td className="py-2 pr-2">{tx.amount}</td>
                      <td>
                      <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                              tx.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'
                          }`}
                      >
                        {tx.status}
                      </span>
                      </td>
                    </tr>
                ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm">
            <h4 className="text-sm sm:text-md font-semibold mb-3">Top Products by Units Sold</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm text-left">
                <thead className="text-gray-500">
                <tr>
                  <th className="py-2 pr-2">Name</th>
                  <th className="py-2 pr-2">Price</th>
                  <th className="py-2">Units Sold</th>
                </tr>
                </thead>
                <tbody className="text-gray-700">
                {topProducts.map((p, i) => (
                    <tr key={i} className="border-t border-gray-200">
                      <td className="py-2 pr-2">{p.name}</td>
                      <td className="py-2 pr-2">{p.price}</td>
                      <td className="py-2">{p.units}</td>
                    </tr>
                ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
  );
};

export default Dashboard;