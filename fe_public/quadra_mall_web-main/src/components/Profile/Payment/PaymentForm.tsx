import React, { useState } from "react";
import PaymentCreate from "./PaymentCreate";
import PaymentBankLink from "./PaymentBankLink";
import { FaUniversity, FaCreditCard } from "react-icons/fa";
import { RiMoneyDollarCircleLine } from "react-icons/ri";

const PaymentForm: React.FC = () => {
  const [showCardForm, setShowCardForm] = useState(false);
  const [showBankForm, setShowBankForm] = useState(false);

  // Dữ liệu mẫu thẻ tín dụng/ghi nợ
  const cardMethods = [
    {
      id: 1,
      type: "Visa",
      detail: "**** 1234 • Nguyễn Văn A",
      logo: <FaCreditCard className="text-blue-600 text-xl" />,
    },
    {
      id: 2,
      type: "Mastercard",
      detail: "**** 5678 • Trần Thị B",
      logo: <FaCreditCard className="text-red-600 text-xl" />,
    },
  ];

  // Dữ liệu mẫu phương thức thanh toán
  const paymentMethods = [
    {
      id: 1,
      type: "Ngân hàng Vietcombank",
      detail: "**** 4567 • Nguyễn Văn C",
      logo: <FaUniversity className="text-green-600 text-xl" />,
    },
    {
      id: 2,
      type: "Ví MoMo",
      detail: "SĐT: 0901***456",
      logo: <RiMoneyDollarCircleLine className="text-pink-500 text-2xl" />,
    },
  ];

  return (
    <div className="bg-white shadow-md rounded-xl p-6 max-w-4xl mx-auto relative">
      {/* Thẻ tín dụng/ghi nợ */}
      <div className="mb-20">
        <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-4">
          <h2 className="text-base font-semibold text-gray-800">
            Thẻ Tín Dụng/Ghi Nợ
          </h2>
          <button
            className="bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-md"
            onClick={() => setShowCardForm(true)}
          >
            + Thêm Thẻ Mới
          </button>
        </div>

        {cardMethods.length > 0 ? (
          <div className="space-y-3">
            {cardMethods.map((card) => (
              <div
                key={card.id}
                className="flex items-center justify-between bg-gray-50 hover:bg-gray-100 p-4 rounded-xl shadow-sm transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow">
                    {card.logo}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-800">
                      {card.type}
                    </div>
                    <div className="text-xs text-gray-500">{card.detail}</div>
                  </div>
                </div>
                <button className="text-sm text-red-500 hover:underline">Xóa</button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500">
            Bạn chưa liên kết thẻ tín dụng hoặc ghi nợ.
          </div>
        )}
      </div>

      {/* Phương thức thanh toán */}
      <div>
        <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-4">
          <h2 className="text-base font-semibold text-gray-800">
            Phương Thức Thanh Toán
          </h2>
          <button
            className="bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-md"
            onClick={() => setShowBankForm(true)}
          >
            + Thêm Phương Thức
          </button>
        </div>

        {paymentMethods.length > 0 ? (
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className="flex items-center justify-between bg-gray-50 hover:bg-gray-100 p-4 rounded-xl shadow-sm transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow">
                    {method.logo}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-800">
                      {method.type}
                    </div>
                    <div className="text-xs text-gray-500">{method.detail}</div>
                  </div>
                </div>
                <button className="text-sm text-red-500 hover:underline">Xóa</button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500">
            Bạn chưa có phương thức thanh toán nào.
          </div>
        )}
      </div>

      {/* Modal Thêm Thẻ Mới */}
      {showCardForm && (
        <>
          <div className="fixed inset-0 bg-[rgba(0,0,0,0.05)] z-40" />
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6">
              <PaymentCreate onClose={() => setShowCardForm(false)} />
            </div>
          </div>
        </>
      )}

      {/* Modal Thêm Phương Thức */}
      {showBankForm && (
        <>
          <div className="fixed inset-0 bg-[rgba(0,0,0,0.05)] z-40" />
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6">
              <PaymentBankLink onClose={() => setShowBankForm(false)} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PaymentForm;
