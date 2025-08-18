import React from 'react';
import CustomerGrowth from '@/components/layout/reports/CustomerGrowth';
import SalesGoal from '@/components/layout/reports/SalesGoal';
import ConversionRate from '@/components/layout/reports/ConversionRate';
import AverageOrderValue from '@/components/layout/reports/AverageOrderValue';
import CustomerDemographics from '@/components/layout/reports/CustomerDemographics';
import VisitsByDevice from '@/components/layout/reports/VisitsByDevice';
import OnlineSessions from '@/components/layout/reports/OnlineSessions';
import TopCustomers from '@/components/layout/reports/TopCustomers';
import TopProducts from '@/components/layout/reports/TopProducts';
import StoreFunnel from '@/components/layout/reports/StoreFunnel';
import AgeDistribution from '@/components/layout/reports/AgeDistribution';

const Reports: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Export</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <CustomerGrowth />
                    <SalesGoal />
                    <ConversionRate />
                    <AverageOrderValue />
                    <CustomerDemographics />
                    <VisitsByDevice />
                    <OnlineSessions />
                    <TopCustomers />
                    <TopProducts />
                    <StoreFunnel />
                    <AgeDistribution />
                </div>
            </div>
        </div>
    );
};

export default Reports;