import { useEffect } from 'react';
import { useChat } from './useChatWebSocket';

export const useChatShortcuts = () => {
  const { startNewConversation, clearCurrentSession } = useChat();

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + Alt + N: New conversation
      if ((event.ctrlKey || event.metaKey) && event.altKey && event.key === 'n') {
        event.preventDefault();
        startNewConversation();
      }

      // Ctrl/Cmd + Alt + C: Clear conversation
      if ((event.ctrlKey || event.metaKey) && event.altKey && event.key === 'c') {
        event.preventDefault();
        clearCurrentSession();
      }

      // Escape: Close mini chat (custom logic)
      if (event.key === 'Escape') {
        // Implement close chat logic
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [startNewConversation, clearCurrentSession]);
};