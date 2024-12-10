import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import Sidebar from './SideBar';
import ChatWindow from './ChatWindow';
import './Chat.css';
import { IChatMessage, IServerMessage } from './ClientData';
import { io } from 'socket.io-client';
import { ChatClient } from './typeClient';
import { ioServer } from './apiConfig';

// Создаем подключение сокета только один раз для всего приложения
const socket = io(ioServer, {
  transports: ['websocket'],
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// Props for chat component
interface ChatProps {
  email: string;
  clients: ChatClient[];
  id: number;
  source: string;
}

const Chat = ({ id, email, clients, source }: ChatProps) => {
  const [selectedClient, setSelectedClient] = useState<number | null>(clients[0]?.id || null);
  const [clientsMessages, setClientsMessages] = useState<IChatMessage[]>([]);
  const [unreadMessages, setUnreadMessages] = useState<Record<number, number>>(() =>
    clients.reduce((acc, client) => {
      acc[client.id] = 0;
      return acc;
    }, {} as Record<number, number>)
  );

  // Обработка выбора клиента
  const onSelectClient = (clientId: number) => {
    console.log('Selected client:', clientId);
    setSelectedClient(clientId);

    // Сбросить непрочитанные сообщения для выбранного клиента
    setUnreadMessages((prev) => ({
      ...prev,
      [clientId]: 0,
    }));

    if (socket.connected) {
      socket.emit('selectClient', { customerId: clientId, email, teacherId: id, source });
    } else {
      console.error('Socket is not connected');
    }
  };

  // useEffect для управления подключением и событиями сокета
  useEffect(() => {
    const handleConnect = () => {
      console.log('Connected to server');
      socket.emit('addNewConnection', { email: email, id: id, teacherId: id });
    };

    const handleDisconnect = () => {
      console.warn('Disconnected from server');
    };

    const handleReconnect = () => {
      console.log('Reconnected to server');
      socket.emit('addNewConnection', { email: email, id: id, teacherId: id });
    };

    // Обработка получения сообщений от сервера
    const handleClientMessages = (data: any) => {
      console.log('Received client messages:', data);
      const { clientId, messages: serverMessages } = data;

      const newMessages = serverMessages.map((msg: IServerMessage) => ({
        clientId,
        text: msg.messageText,
        timestamp: new Date(msg.createdAt).toLocaleTimeString(),
        source: msg.messageType === 'tg' ? 'telegram' : 'whatsapp',
        sender: msg.sender == 'client' ? 'client' : 'teacher',
        id: msg.id,
      }));

      setClientsMessages((prevMessages) => {
        const existingMessageIds = new Set(prevMessages.map((msg) => msg.id));
        const uniqueNewMessages = newMessages.filter((msg) => !existingMessageIds.has(msg.id));
        return [...prevMessages, ...uniqueNewMessages];
      });
    };

    const handleNewMessage = (data: IChatMessage) => {
      console.log('New message received:', data);

      if (data.clientId === selectedClient) {
        // Если сообщение для текущего выбранного клиента
        setClientsMessages((prevMessages) => [...prevMessages, data]);
      } else {
        // Увеличиваем счётчик непрочитанных сообщений для другого клиента
        setUnreadMessages((prev) => ({
          ...prev,
          [data.clientId]: (prev[data.clientId] || 0) + 1,
        }));
      }
    };

    // Устанавливаем обработчики событий
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('reconnect', handleReconnect);
    socket.on('clientMessages', handleClientMessages);
    socket.on('newMessage', handleNewMessage);

    // Эмитим `addNewConnection` при монтировании, если сокет уже подключён
    if (socket.connected) {
      handleConnect();
    }

    // Очистка обработчиков событий
    return () => {
      console.log('Cleaning up socket listeners');
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('reconnect', handleReconnect);
      socket.off('clientMessages', handleClientMessages);
      socket.off('newMessage', handleNewMessage);
    };
  }, [id, email, selectedClient]);

  const handleSendMessage = (message: string) => {
    if (!selectedClient) {
      console.error('No client selected');
      return;
    }

    const newMessage: IChatMessage = {
      id: Math.max(...clientsMessages.map((msg) => msg.id), 0) + 1,
      clientId: selectedClient,
      text: message,
      timestamp: new Date().toLocaleTimeString(),
      source: 'chat',
      sender: 'teacher',
    };

    if (socket.connected) {
      console.log('Sending new message:', newMessage);
      socket.emit('message_from_teacher', {
        message: newMessage,
        teacherId: id,
        customerId: selectedClient,
      });
      setClientsMessages((prevMessages) => [...prevMessages, newMessage]);
    } else {
      console.error('Socket is not connected');
    }
  };

  const title = source === 'ua' ? 'Мова-Промова' : source === 'main' ? 'Говоорика' : 'Польша';

  return (
    <Box display="flex" height="100vh" width="100vw" overflow="hidden">
      <Sidebar
        email={email}
        clients={clients}
        onSelectClient={onSelectClient}
        unreadMessages={unreadMessages}
        title={title}
      />
      <ChatWindow
        selectedClient={selectedClient}
        clients={clients}
        messages={clientsMessages.filter((msg) => msg.clientId === selectedClient)}
        onSendMessage={handleSendMessage}
      />
    </Box>
  );
};

export default Chat;


