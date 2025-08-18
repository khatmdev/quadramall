import React, { useState } from "react";
import { FaRegCreditCard, FaUser, FaCalendarAlt, FaLock, FaWifi } from "react-icons/fa";
import { SiVisa } from "react-icons/si";

interface PaymentCreateProps {
  onClose: () => void;
}

const PaymentCreate: React.FC<PaymentCreateProps> = ({ onClose }) => {
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  // Format số thẻ thành nhóm 4 số
  const formatDisplayCardNumber = (number: string) => {
    const cleaned = number.replace(/\s+/g, "");
    const parts = cleaned.match(/.{1,4}/g) || [];
    return parts.join(" ").padEnd(19, "•");
  };

  return (
    <form className="max-w-md mx-auto p-6">
      {/* Cart Preview */}
      <div className="mb-8 relative">
        <div className="w-full h-48 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-400 p-6 text-white shadow-xl">
          <div className="flex justify-between items-start">
            <span className="text-xl font-medium">slothui</span>
            <div className="flex gap-2 items-center">
              <FaWifi className="text-white/90 rotate-90" size={20} />
              <SiVisa className="text-white/90" size={32} />
            </div>
          </div>

          <div className="mt-8">
            <div className="font-mono text-2xl tracking-wider">
              {formatDisplayCardNumber(cardNumber || "0087 1157 0587 6187")}
            </div>
            <div className="flex justify-between items-center mt-4">
              <div>
                <p className="text-xs opacity-75">Card Holder</p>
                <p className="font-medium tracking-wide">
                  {cardName || "AZUNYAN U WU"}
                </p>
              </div>
              <div>
                <p className="text-xs opacity-75">Expires</p>
                <p className="font-mono">{expiry || "08/11"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <FaRegCreditCard className="text-green-600" />
            Số thẻ
          </label>
          <input
            type="text"
            className="rounded-md px-3 py-2 focus:outline-green-500 w-full border border-gray-200 bg-white focus:border-green-500 transition-colors"
            placeholder="0087 1157 0587 6187"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            maxLength={19}
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <FaUser className="text-green-600" />
            Tên chủ thẻ
          </label>
          <input
            type="text"
            className="rounded-md px-3 py-2 focus:outline-green-500 w-full border border-gray-200 bg-white focus:border-green-500 transition-colors uppercase"
            placeholder="AZUNYAN U WU"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <FaCalendarAlt className="text-green-600" />
              Ngày hết hạn
            </label>
            <input
              type="text"
              className="rounded-md px-3 py-2 focus:outline-green-500 w-full border border-gray-200 bg-white focus:border-green-500 transition-colors"
              placeholder="08/11"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              maxLength={5}
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <FaLock className="text-green-600" />
              CVV
            </label>
            <input
              type="password"
              className="rounded-md px-3 py-2 focus:outline-green-500 w-full border border-gray-200 bg-white focus:border-green-500 transition-colors"
              placeholder="123"
              value={cvv}
              onChange={(e) => setCvv(e.target.value)}
              maxLength={4}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button
          type="button"
          className="px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition border border-gray-200"
          onClick={onClose}
        >
          Hủy
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-md bg-green-500 text-white font-semibold shadow-lg shadow-green-200 hover:bg-green-600 transition"
        >
          Lưu Thẻ
        </button>
      </div>
    </form>
  );
};

export default PaymentCreate;
