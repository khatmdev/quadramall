import React from 'react';

const GlobalSettings = () => {
  const plans = [
    {
      price: "$12/month",
      title: "Basic",
      tag: null,
      description: "Start your business",
      features: [
        "✅ Free Domain",
        "✅ Google Ads Credit",
        "✅ Up to 3 Users",
        "✅ Up to 100 Products",
        "✅ Chat Inbox",
        "✅ Unlimited Storage",
        "❌ No Transaction Fee",
      ],
    },
    {
      price: "$20/month",
      title: "Professional",
      tag: "Recommended",
      description: "Start your business",
      features: [
        "✅ Free Domain",
        "✅ Google Ads Credit",
        "✅ Up to 3 Users",
        "✅ Up to 100 Products",
        "✅ Chat Inbox",
        "✅ Unlimited Storage",
        "❌ No Transaction Fee",
      ],
      highlighted: true,
    },
    {
      price: "$45/month",
      title: "Business",
      tag: null,
      description: "Start your business",
      features: [
        "✅ Free Domain",
        "✅ Google Ads Credit",
        "✅ Up to 3 Users",
        "✅ Up to 100 Products",
        "✅ Chat Inbox",
        "✅ Unlimited Storage",
        "❌ No Transaction Fee",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Pricing Section */}
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md mt-6 text-center">
        <h1 className="text-xl font-semibold mb-2">Choose a Plan</h1>
        <p className="text-gray-600 mb-2">Familiarize yourself with the payment plans below.</p>
        <p className="text-gray-600 mb-6">Pick best pricing to fit your needs.</p>

        {/* Toggle buttons */}
        <div className="flex justify-center space-x-2 mb-10">
          <button className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition">Bill Monthly</button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">Bill Annually</button>
        </div>

        {/* Pricing Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`p-6 rounded-lg shadow-md text-center border ${
                plan.highlighted ? "border-blue-600" : "border-gray-200"
              } transition-transform hover:scale-105`}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{plan.price}</h2>
              <p className="text-lg font-semibold text-gray-700 mb-1">{plan.title}</p>
              {plan.tag && (
                <p className="text-sm text-blue-600 font-medium mb-2">{plan.tag}</p>
              )}
              <p className="text-gray-600 mb-4">{plan.description}</p>
              <ul className="text-gray-600 mb-6 space-y-1 text-left">
                {plan.features.map((feature, i) => (
                  <li key={i}>{feature}</li>
                ))}
              </ul>
              <button className={`w-full py-2 rounded-md text-white font-medium ${
                plan.highlighted ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-800 hover:bg-gray-900"
              } transition`}>
                Select Plan
              </button>
            </div>
          ))}
        </div>

        <div className="max-w-4xl mx-auto p-6 text-center text-gray-600 mt-6">
          <p>Cancel or upgrade your plan anytime</p>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md mt-6">
        <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            {
              question: "Ở đâu tôi nhận được thông báo?",
              answer: "Thông báo sẽ được gửi qua email hoặc thông báo trong tài khoản của bạn.",
            },
            {
              question: "Tôi có thể thay đổi gói tài khoản?",
              answer: "Có, bạn có thể thay đổi gói tài khoản bất cứ lúc nào.",
            },
            {
              question: "Làm sao để đổi gói tài khoản?",
              answer: "Bạn chỉ cần vào mục cài đặt và chọn gói mới để nâng cấp.",
            },
            {
              question: "How to purchase a domain?",
              answer: "You can purchase a domain through our settings panel under the domain section.",
            },
          ].map((faq, idx) => (
            <div key={idx} className="border-b border-gray-400 pb-2">
              <details className="text-gray-600">
                <summary className="cursor-pointer font-medium">{faq.question}</summary>
                <p className="mt-2">{faq.answer}</p>
              </details>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GlobalSettings;
