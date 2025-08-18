// mockApi.ts
const mockData = {
    customerDemographics: [
        { code: "01", value: 8053 }, // Hà Nội
        { code: "79", value: 9166 }, // TP.HCM
        { code: "48", value: 1134 }, // Đà Nẵng
        { code: "31", value: 2085 }, // Hải Phòng
        { code: "92", value: 1238 }, // Cần Thơ
        { code: "00", value: 3920 }, // Other
    ],
    customerGrowth: [
        { name: "Jan", new: 500, returning: 300 },
        { name: "Feb", new: 600, returning: 400 },
        { name: "Mar", new: 700, returning: 500 },
        { name: "Apr", new: 800, returning: 600 },
        { name: "May", new: 900, returning: 700 },
        { name: "Jun", new: 1000, returning: 800 },
        { name: "Jul", new: 1100, returning: 900 },
        { name: "Aug", new: 1200, returning: 1000 },
        { name: "Sep", new: 1300, returning: 1100 },
        { name: "Oct", new: 1400, returning: 1200 },
        { name: "Nov", new: 1500, returning: 1300 },
        { name: "Dec", new: 1600, returning: 1400 },
    ],
    salesGoals: { current: 12000, goal: 15000 },
    conversionRate: [
        { name: "Cart", value: 75 },
        { name: "Checkout", value: 25 },
    ],
};

export const fetchMockData = async (endpoint: string): Promise<any> => {
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Mô phỏng độ trễ
    switch (endpoint) {
        case "/api/customer-demographics":
            return mockData.customerDemographics;
        case "/api/customer-growth":
            return mockData.customerGrowth;
        case "/api/sales-goals":
            return mockData.salesGoals;
        case "/api/conversion-rate":
            return mockData.conversionRate;
        default:
            throw new Error("Endpoint not found");
    }
};