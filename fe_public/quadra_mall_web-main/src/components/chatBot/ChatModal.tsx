import React from 'react';
import { X } from 'lucide-react';
import ChatComponent from './ChatComponent';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Chat AI Assistant</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-md"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Chat Content */}
        <div className="h-[calc(100%-5rem)]">
          <ChatComponent
            className="h-full"
            enableStreaming={true}
            showProductCards={true}
            showConversationHistory={true}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatModal;