import React, { useState, useRef } from 'react';
import { FiChevronDown, FiChevronUp, FiMail, FiPhone, FiMessageSquare, FiPaperclip } from 'react-icons/fi';

const SupportCenter: React.FC = () => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    file: null as File | null,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const faqs = [
    {
      question: 'Làm thế nào để theo dõi đơn hàng của tôi?',
      answer: 'Bạn có thể theo dõi đơn hàng trong mục "Đơn hàng" trên trang cá nhân. Chọn đơn hàng cần xem và nhấn vào nút chi tiết để kiểm tra trạng thái vận chuyển.',
    },
    {
      question: 'Tôi có thể đổi hoặc trả hàng không?',
      answer: 'Có, bạn có thể yêu cầu đổi hoặc trả hàng trong vòng 7 ngày kể từ khi nhận được sản phẩm. Vui lòng kiểm tra chính sách đổi trả trong mục "Trả hàng/Hoàn tiền".',
    },
    {
      question: 'Làm sao để liên hệ với bộ phận hỗ trợ?',
      answer: 'Bạn có thể liên hệ qua email (support@example.com), số điện thoại (0123-456-789), hoặc sử dụng biểu mẫu liên hệ ngay trên trang này.',
    },
    {
      question: 'Tôi quên mật khẩu, làm thế nào để khôi phục?',
      answer: 'Truy cập trang đăng nhập, nhấn "Quên mật khẩu" và làm theo hướng dẫn để nhận liên kết đặt lại mật khẩu qua email.',
    },
  ];

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, file }));
    }
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Support ticket submitted:', formData);
    // Replace with API call if available, e.g.:
    // const formDataToSend = new FormData();
    // formDataToSend.append('subject', formData.subject);
    // formDataToSend.append('message', formData.message);
    // if (formData.file) formDataToSend.append('file', formData.file);
    // fetch('/api/support', { method: 'POST', body: formDataToSend });
    alert('Yêu cầu hỗ trợ đã được gửi!');
    setFormData({ subject: '', message: '', file: null });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="bg-gray-50 rounded-xl min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Trung tâm hỗ trợ</h1>
          <p className="mt-2 text-gray-600 text-lg">
            Chúng tôi ở đây để giúp bạn! Tìm câu trả lời cho câu hỏi của bạn hoặc liên hệ với đội ngũ hỗ trợ.
          </p>
        </div>

        {/* FAQs Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Câu hỏi thường gặp</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-200">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex justify-between items-center py-4 text-left text-gray-700 font-medium"
                >
                  <span>{faq.question}</span>
                  {activeFaq === index ? (
                    <FiChevronUp className="text-gray-500" size={20} />
                  ) : (
                    <FiChevronDown className="text-gray-500" size={20} />
                  )}
                </button>
                {activeFaq === index && (
                  <div className="text-gray-600 pb-4">{faq.answer}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Liên hệ với chúng tôi</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <FiMail className="text-green-600" size={24} />
              <div>
                <h3 className="font-medium text-gray-700">Email</h3>
                <p className="text-gray-500">support@example.com</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FiPhone className="text-green-600" size={24} />
              <div>
                <h3 className="font-medium text-gray-700">Số điện thoại</h3>
                <p className="text-gray-500">0123-456-789</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FiMessageSquare className="text-green-600" size={24} />
              <div>
                <h3 className="font-medium text-gray-700">Chat trực tuyến</h3>
                <button
                  className="text-green-600 hover:underline"
                  onClick={() => alert('Mở chat trực tuyến')}
                >
                  Bắt đầu chat
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Gửi yêu cầu hỗ trợ</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Chủ đề</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                placeholder="Nhập chủ đề yêu cầu..."
                className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 bg-white focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nội dung</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Mô tả vấn đề của bạn..."
                className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 bg-white focus:ring-green-500 focus:border-green-500 h-32"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Đính kèm tệp (tùy chọn)</label>
              <div className="mt-1 flex items-center gap-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <button
                  type="button"
                  onClick={handleFileClick}
                  className="flex items-center gap-2 text-sm text-gray-600 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
                >
                  <FiPaperclip size={16} />
                  Tải lên tệp
                </button>
                {formData.file && (
                  <span className="text-sm text-gray-500">{formData.file.name}</span>
                )}
              </div>
            </div>
            <div className="text-right">
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
              >
                Gửi yêu cầu
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SupportCenter;