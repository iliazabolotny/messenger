import { useEffect, useMemo } from 'react';
import { Box } from '@mui/material';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import { useAppDispatch, useAppSelector } from '../helpers';
import {
  addOutgoingOptimistic,
  clearMessages,
  pollNotification,
  restoreMessages,
  sendChatMessage,
  setConnected,
} from '../slices/chat/chatSlice';
import { logout } from '../slices/session/sessionSlice';
import type { Message, Session } from '../types';

function storageKey(chatId: string) {
  return `max_chat_messages_${chatId}`;
}

export default function ChatApp({ session }: { session: Session }) {
  const dispatch = useAppDispatch();
  const { messages, isConnected, lastSeen } = useAppSelector((state) => state.chat);
  const chatId = useMemo(() => `${session.phone}@c.us`, [session.phone]);

  useEffect(() => {
    const key = storageKey(chatId);
    try {
      const saved = localStorage.getItem(key);
      if (saved) dispatch(restoreMessages(JSON.parse(saved) as Message[]));
    } catch (error) {
      console.error('Ошибка чтения истории', error);
    }
  }, [chatId, dispatch]);

  useEffect(() => {
    localStorage.setItem(storageKey(chatId), JSON.stringify(messages));
  }, [chatId, messages]);

  useEffect(() => {
    let active = true;

    dispatch(setConnected(true));

    const poll = () => {
      if (active) dispatch(pollNotification(session));
    };

    poll();
    const intervalId = window.setInterval(poll, 2000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
      dispatch(setConnected(false));
    };
  }, [dispatch, session]);

  const handleSend = (text: string) => {
    const tempId = `out_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    dispatch(
      addOutgoingOptimistic({
        id: tempId,
        text,
        timestamp: Date.now(),
      }),
    );
    dispatch(sendChatMessage({ session, chatId, text, tempId }));
  };

  const handleClearChat = () => {
    if (window.confirm('Очистить историю чата?')) {
      dispatch(clearMessages());
      localStorage.removeItem(storageKey(chatId));
    }
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <Box sx={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden', bgcolor: '#f0f2f5' }}>
      <Sidebar
        phone={session.phone}
        isConnected={isConnected}
        lastSeen={lastSeen}
        onLogout={handleLogout}
        onClearChat={handleClearChat}
      />
      <ChatWindow
        phone={session.phone}
        messages={messages}
        onSendMessage={handleSend}
        isConnected={isConnected}
      />
    </Box>
  );
}
