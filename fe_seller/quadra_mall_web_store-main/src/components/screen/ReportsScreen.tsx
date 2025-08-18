import React from 'react';
import CustomerGrowth from '@/components/layout/report/CustomerGrowth';
import SalesGoals from '@/components/layout/report/SalesGoals';
import ConversionRate from '@/components/layout/report/ConversionRate';
import AverageOrderValue from '@/components/layout/report/AverageOrderValue';
// import CustomerDemographics from '@/components/layout/report/CustomerDemographics';
import TopCustomers from '@/components/layout/report/TopCustomers';
import TopProducts from '@/components/layout/report/TopProducts';
import OrderStatusOverview from '@/components/layout/report/OrderStatusOverview';
import ShippingPerformance from '@/components/layout/report/ShippingPerformance';
import PaymentMethodPerformance from '@/components/layout/report/PaymentMethodPerformance';

// Định nghĩa kiểu dữ liệu
interface CustomerGrowthData {
    name: string;
    new: number;
    returning: number;
}
interface SalesGoalsData {
    current: number;
    goal: number;
}
interface ConversionRateData {
    name: string;
    value: number;
}
interface AverageOrderValueData {
    name: string;
    value: number;
}
interface CustomerDemographicsData {
    name: string;
    value: number;

}
interface TopCustomerData {
    name: string;
    orders: number;
    spent: number;
}
interface TopProductData {
    name: string;
    clicks: number;
    units: number;
}

interface OrderStatusOverviewData {
    name: string;
    value: number;
}
interface ShippingPerformanceData {
    name: string;
    value: number;
}

const ReportsScreen: React.FC = () => {
    const customerGrowthData: CustomerGrowthData[] = [
        { name: 'Jan', new: 800, returning: 400 },
        { name: 'Feb', new: 900, returning: 450 },
        { name: 'Mar', new: 1000, returning: 500 },
        { name: 'Apr', new: 1100, returning: 550 },
        { name: 'May', new: 1200, returning: 600 },
        { name: 'Jun', new: 1300, returning: 650 },
        { name: 'Jul', new: 1400, returning: 700 },
        { name: 'Aug', new: 1500, returning: 750 },
        { name: 'Sep', new: 1600, returning: 800 },
        { name: 'Oct', new: 1700, returning: 850 },
        { name: 'Nov', new: 1800, returning: 900 },
        { name: 'Dec', new: 1900, returning: 950 },
    ];
    const salesGoalsData: SalesGoalsData = { current: 12000, goal: 15000 };
    const conversionRateData: ConversionRateData[] = [
        { name: 'Cart', value: 75 },
        { name: 'Checkout', value: 25 },
    ];
    const averageOrderValueData: AverageOrderValueData[] = [
        { name: 'Jan', value: 45.80 },
        { name: 'Feb', value: 46.50 },
        { name: 'Mar', value: 48.80 },
        { name: 'Apr', value: 50.20 },
        { name: 'May', value: 51.90 },
        { name: 'Jun', value: 53.40 },
        { name: 'Jul', value: 54.70 },
        { name: 'Aug', value: 55.30 },
        { name: 'Sep', value: 56.10 },
        { name: 'Oct', value: 57.80 },
        { name: 'Nov', value: 58.90 },
        { name: 'Dec', value: 60.00 },
    ];
    const customerDemographicsData: CustomerDemographicsData[] = [
        { name: "Hà Nội", value: 29051 },
        { name: "TP. Hồ Chí Minh", value: 18041 },
        { name: "Đà Nẵng", value: 10430 },
        { name: "Cần Thơ", value: 7500 },
        { name: "Nha Trang", value: 6200 },
        { name: "Buôn Ma Thuột", value: 4800 },
        { name: "Quy Nhơn", value: 3500 },
        { name: "Other", value: 5420 },
    ];
    const topCustomersData: TopCustomerData[] = [
        { name: 'Lee Henry', orders: 42, spent: 9537 },
        { name: 'Mya McBride', orders: 41, spent: 7092 },
        { name: 'Jimmy Walker', orders: 38, spent: 6729 },
        { name: 'Lena Cook', orders: 35, spent: 5421 },
    ];
    const topProductsData: TopProductData[] = [
        { name: 'Men White T-Shirt', clicks: 12426, units: 198 },
        { name: 'Women Grey T-Shirt', clicks: 10044, units: 122 },
        { name: 'Men Grey Hoodie', clicks: 8243, units: 95 },
        { name: 'Women T-Shirt', clicks: 7129, units: 87 },
    ];
    const orderStatusOverviewData: OrderStatusOverviewData[] = [
        { name: 'Pending', value: 20 },
        { name: 'Delivered', value: 70 },
        { name: 'Cancelled', value: 10 },
    ];
    const shippingPerformanceData: ShippingPerformanceData[] = [
        { name: 'On Time', value: 85 },
        { name: 'Delayed', value: 15 },
    ];

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Reports</h1>
                    <button className="bg-blue-500 text-white px-4 py-2 rounded">Export</button>
                </div>
                <div className="mb-6">
                    <CustomerGrowth data={customerGrowthData} />
                </div>
                {/* 3-card Section: Sales Goals, Conversion Rate, Average Order Value */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <SalesGoals data={salesGoalsData} />
                    <ConversionRate data={conversionRateData} />
                    <AverageOrderValue data={averageOrderValueData} />
                </div>

                <div className="mb-6">
                    <CustomerDemographics data={customerDemographicsData} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <PaymentMethodPerformance />
                </div>

                {/* 2-card Section: Top Customers, Top Products */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <TopCustomers data={topCustomersData} />
                    <TopProducts data={topProductsData} />
                </div>
                {/* Additional Sections in 2-card layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <OrderStatusOverview data={orderStatusOverviewData} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <ShippingPerformance data={shippingPerformanceData} />
                </div>
            </div>
        </div>
    );
};

export default ReportsScreen;