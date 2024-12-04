import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import Sidebar from './SideBar';
import ChatWindow from './ChatWindow';
import './Chat.css';
import { IChatMessage, IServerMessage } from './ClientData';

import { io } from 'socket.io-client';
import { ChatClient } from './typeClient';

// Создаем подключение сокета только один раз для всего приложения
const socket = io('http://159.203.124.0:4030', {
  transports: ['websocket'],
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

//props for chat component
interface ChatProps {
  email: string;
  clients: ChatClient[];
  id: number;
  source: string;
}

const Chat = ({ id, email, clients, source }: ChatProps) => {
  const [selectedClient, setSelectedClient] = useState<number | null>(clients[0]?.id);

  const [clientsMessages, setClientsMessages]  = useState<IChatMessage[]>([]);

  const onSelectClient = (clientId: number) => {
    try {
      console.log('Selected client:', clientId);
      setSelectedClient(clientId);

      // Эмитируем событие для запроса сообщений для выбранного клиента
      if (socket.connected) {
        socket.emit('selectClient', { customerId: clientId, email: email, teacherId: id, source: source });
      } else {
        console.error('Socket is not connected');
      }
    } catch (error) {
      console.log('Error selecting client:', error);
    }
  };

  useEffect(() => {
    // Обработчик подключения
    const handleConnect = () => {
      console.log('Connected to server');
      socket.emit('addNewConnection', { email: email, id: id });
    };

    // Обработчик отключения
    const handleDisconnect = () => {
      console.warn('Disconnected from server');
    };

    // Устанавливаем обработчики событий сокета
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    // Обработка события получения сообщений для выбранного клиента
    socket.on('clientMessages', (data) => {
      console.log('Received client messages:', data);
      let clientId = data.clientId;
      let serverMessages = data.messages;
      //update use clientId clientMessages
      
      let newMessages = serverMessages.map((msg: IServerMessage) => {
        return {
          clientId: clientId,
          text: msg.messageText,
          timestamp: new Date(msg.createdAt).toLocaleTimeString(),

          source: msg.messageType == 'tg' ? 'telegram' : 'whatsapp',
          sender: msg.inBound ? 'client' : 'therapist',
          id: msg.id
        };
      });

      setClientsMessages((prevMessages) => {
        const existingMessageIds = new Set(prevMessages.map((msg) => msg.id));
        const uniqueNewMessages = newMessages.filter((msg) => !existingMessageIds.has(msg.id));
        return [...prevMessages, ...uniqueNewMessages];
      });
    });
  

    // Обработка новых сообщений от сервера
    socket.on('new_message', (data) => {
    });

    // Очистка подключения при размонтировании компонента
    return () => {
      console.log('Cleaning up socket listeners');
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('clientMessages');
      socket.off('new_message');
    };
  }, [id, email]);

  const handleSendMessage = (message: string) => {
    const newMessage: IChatMessage = {
      id: 0,
      clientId: selectedClient,
      text: message,
      timestamp: new Date().toLocaleTimeString(),
      source: 'chat',
      sender: 'therapist',
    };

    //add to clientMessages with max id
    let maxId = Math.max(...clientsMessages.map((msg) => msg.id));
    newMessage.id = maxId + 1;
    //update clientMessages


    // Отправляем сообщение на сервер
    if (socket.connected) {
      console.log('NEW MESSAGE:', newMessage);
      socket.emit('send_message', {
        message: newMessage,
        teacherId: id,
        customerId: selectedClient,
      });
      setClientsMessages((prevMessages) => [...prevMessages, newMessage]);

    } else {
      console.error('Socket is not connected');
    }
  };

  const title = source == 'ua' ? 'Мова-Промова' : (source == 'main' ? 'Говоорика' : 'Польша');

  return (
    <Box display="flex" height="100vh" width="100vw" overflow="hidden">
      <Sidebar
       email={email} 
       clients={clients} 
       onSelectClient={onSelectClient} 
       title={title}
       />
      <ChatWindow
        selectedClient={selectedClient}
        clients={clients}
        messages={clientsMessages}
        onSendMessage={handleSendMessage}
      />
    </Box>
  );
};

export default Chat;
