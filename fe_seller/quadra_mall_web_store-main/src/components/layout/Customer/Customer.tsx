import React, { useState } from 'react';
import {
  FiSearch,
  FiPlus,
  FiDownload,
  FiChevronLeft,
  FiChevronRight,
  FiEdit,
  FiTrash2,
} from 'react-icons/fi';

const customersData = [
  { id: 'C001', name: 'Rakesh Mitra', location: 'Swayamview', orders: 5, spent: '$96.14' },
  { id: 'C002', name: 'Lakshman Singh', location: 'Kaylaville', orders: 12, spent: '$94.98' },
  { id: 'C003', name: 'Dinesh Sah', location: 'East Frediston', orders: 6, spent: '$96.04' },
  { id: 'C004', name: 'Anmol Yadav', location: 'South Martellus', orders: 3, spent: '$52.97' },
  { id: 'C005', name: 'Raushan Rajput', location: 'South Olstead', orders: 15, spent: '$45.98' },
  { id: 'C006', name: 'Lokesh Rahul', location: 'Denscloerg', orders: 12, spent: '$87.93' },
  { id: 'C007', name: 'Ramesh Kumar', location: 'Francineview', orders: 5, spent: '$128.06' },
  { id: 'C008', name: 'Khusbu Kumari', location: 'Port Kathryne', orders: 7, spent: '$113.99' },
  { id: 'C009', name: 'Neha Kumari', location: 'McGlynnview', orders: 14, spent: '$90.30' },
  { id: 'C010', name: 'Raju Mantri', location: 'Kristalview', orders: 5, spent: '$42.03' },
];

const Customers: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const itemsPerPage = 10;

  const filteredCustomers = customersData.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleCheckboxChange = (id: string) => {
    setSelectedCustomers((prev) =>
      prev.includes(id) ? prev.filter((customerId) => customerId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedCustomers(paginatedCustomers.map((customer) => customer.id));
    } else {
      setSelectedCustomers([]);
    }
  };

  const handleEdit = () => {
  };

  const handleDelete = () => {
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Customers</h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <select className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
            <option>Filter</option>
            <option>All Customers</option>
            <option>New Customers</option>
            <option>From Europe</option>
            <option>Returning Customers</option>
          </select>

          <div className="relative w-full sm:w-64">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">
              <FiDownload className="text-gray-500" /> Export
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
              <FiPlus /> Add Customer
            </button>
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
            >
              <FiEdit /> Edit
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
            >
              <FiTrash2 /> Delete
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
        <table className="w-full text-sm text-gray-700">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-medium">
            <tr>
              <th className="py-3 px-4 text-left">
                <input
                  type="checkbox"
                  checked={paginatedCustomers.length > 0 && selectedCustomers.length === paginatedCustomers.length}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </th>
              <th className="py-3 px-4 text-left">Name</th>
              <th className="py-3 px-4 text-left">Location</th>
              <th className="py-3 px-4 text-left">Orders</th>
              <th className="py-3 px-4 text-left">Spent</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCustomers.map((customer, index) => (
              <tr key={index} className="border-t border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-4">
                  <input
                    type="checkbox"
                    checked={selectedCustomers.includes(customer.id)}
                    onChange={() => handleCheckboxChange(customer.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </td>
                <td className="py-3 px-4 text-blue-600 font-medium">{customer.name}</td>
                <td className="py-3 px-4">{customer.location}</td>
                <td className="py-3 px-4">{customer.orders}</td>
                <td className="py-3 px-4">{customer.spent}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
        <div>Showing 1 to 10 of {customersData.length} entries</div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-1 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50"
          >
            <FiChevronLeft />
          </button>
          <button className="px-3 py-1 rounded-md bg-blue-600 text-white">{currentPage}</button>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-1 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50"
          >
            <FiChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Customers;