import React from 'react';
import ChatComponent from './ChatComponent';
import { useChat } from '@/hooks/useChatWebSocket';

const ChatPage: React.FC = () => {
  return (
    <div className="h-screen bg-gray-50">
      <ChatComponent
        className="h-full"
        enableStreaming={false}
        showProductCards={true}
        showConversationHistory={true}
      />
    </div>
  );
};