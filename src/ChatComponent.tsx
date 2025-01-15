import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Box } from '@mui/material';
import Sidebar from './SideBar';
import ChatWindow from './ChatWindow';
import './Chat.css';
import { IChatMessage, IServerMessage } from './ClientData';
import { io, Socket } from 'socket.io-client';
import { ChatClient } from './typeClient';
import { ioServer } from './apiConfig';

// Создаём подключение только один раз
const socket: Socket = io(ioServer, {
  transports: ['websocket'],
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

interface ChatProps {
  email: string;
  clients: ChatClient[];
  id: number;
  source: string;
}

const Chat = ({ id, email, clients, source }: ChatProps) => {
  const [selectedClient, setSelectedClient] = useState<number | null>(clients[0]?.id || null);
  const [clientsMessages, setClientsMessages] = useState<Record<number, IChatMessage[]>>(() =>
    clients.reduce((acc, client) => {
      acc[client.id] = [];
      return acc;
    }, {} as Record<number, IChatMessage[]>)
  );
  const [unreadMessages, setUnreadMessages] = useState<Record<number, number>>(() =>
    clients.reduce((acc, client) => {
      acc[client.id] = 0;
      return acc;
    }, {} as Record<number, number>)
  );

  // Фильтрация сообщений для текущего клиента
  const filteredMessages = useMemo(() => {
    return selectedClient !== null ? clientsMessages[selectedClient] || [] : [];
  }, [clientsMessages, selectedClient]);

  // Обработка выбора клиента
  const onSelectClient = useCallback((clientId: number) => {
    setSelectedClient(clientId);
    setUnreadMessages((prev) => ({
      ...prev,
      [clientId]: 0,
    }));

    if (socket.connected) {
      socket.emit('selectClient', { customerId: clientId, email, teacherId: id, source });
    } else {
      console.error('Socket is not connected');
    }
  }, [email, id, source]);




  useEffect(() => {
    const handleConnect = () => {
      console.log('Connected to server');
      socket.emit('addNewConnection', { email, id, teacherId: id });
    };
  
    const handleDisconnect = () => {
      console.warn('Disconnected from server');
    };
  
    const handleReconnect = () => {
      console.log('Reconnected to server');
      socket.emit('addNewConnection', { email, id, teacherId: id });
    };
  
    const handleClientMessages = (data: any) => {
      const { clientId, messages: serverMessages } = data;
      const sortedMessages = serverMessages.sort((a: IServerMessage, b: IServerMessage) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
  
      const newMessages = sortedMessages.map((msg: IServerMessage) => ({
        clientId,
        text: msg.messageText,
        timestamp: new Date(msg.createdAt).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        source: msg.messageType === 'tg' ? 'telegram' : 'whatsapp',
        sender: msg.sender === 'client' ? 'client' : 'teacher',
        id: msg.id,
      }));
  
      setClientsMessages((prevMessages) => ({
        ...prevMessages,
        [clientId]: [...(prevMessages[clientId] || []), ...newMessages],
      }));
    };
  
    const handleNewMessage = (data: any) => {
      const newMessage: IChatMessage = {
        clientId: data.message.clientId,
        text: data.message.text,
        timestamp: new Date(data.message.timestamp || Date.now()).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        source: data.message.source || 'chat',
        sender: 'client',
        id: data.message.id || Date.now(),
      };
  
      setClientsMessages((prevMessages) => {
        const clientMessages = prevMessages[newMessage.clientId] || [];
        return {
          ...prevMessages,
          [newMessage.clientId]: [...clientMessages, newMessage],
        };
      });
  
      if (newMessage.clientId !== selectedClient) {
        setUnreadMessages((prev) => ({
          ...prev,
          [newMessage.clientId]: (prev[newMessage.clientId] || 0) + 1,
        }));
      }
    };
  
    // Устанавливаем обработчики событий
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('reconnect', handleReconnect);
    socket.on('clientMessages', handleClientMessages);
    socket.on('newMessage', handleNewMessage);
  
    // Очистка обработчиков
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('reconnect', handleReconnect);
      socket.off('clientMessages', handleClientMessages);
      socket.off('newMessage', handleNewMessage);
    };
  }, [email, id]); // Убрали selectedClient из зависимостей
  



  const handleSendMessage = (message: string, isEmail: boolean = false) => {
    if (!selectedClient) {
      console.error('No client selected');
      return;
    }

    const newMessage: IChatMessage = {
      id: Date.now(),
      clientId: selectedClient,
      text: message,
      timestamp: new Date().toLocaleTimeString(),
      source: 'chat',
      sender: 'teacher',
    };

    socket.emit('message_from_teacher', {
      message: newMessage,
      teacherId: id,
      customerId: selectedClient,
      isEmail,
    });

    setClientsMessages((prevMessages) => ({
      ...prevMessages,
      [selectedClient]: [...(prevMessages[selectedClient] || []), newMessage],
    }));
  };

  const title = source === 'ua' ? 'Мова-Промова' : source === 'main' ? 'Говорика' : 'Poland';

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
        source={'ua'}
        selectedClient={selectedClient}
        clients={clients}
        messages={filteredMessages}
        onSendMessage={handleSendMessage}
      />
    </Box>
  );
};

export default Chat;
