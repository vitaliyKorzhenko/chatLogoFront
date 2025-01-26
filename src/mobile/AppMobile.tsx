import React, { useState, useEffect, useMemo } from 'react';
import { Box, Tabs, Tab, Badge, Typography, IconButton } from '@mui/material';
import './AppMobile.css';
import { auth } from '../firebaseConfig';
import { teacherInfo } from '../axios/api';
import { IChatMessage, IServerMessage } from '../ClientData';
import Login from '../Login';
import MobileSidebar from './sideBar';
import MobileChatWindow from './chatWindow';
import socketService from '../socketService';
import { ChatClient } from '../typeClient';
import { FiLogOut } from 'react-icons/fi';

function MobileApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [chatClients, setChatClients] = useState<ChatClient[]>([]);
  const [email, setEmail] = useState('');
  const [teacherId, setTeacherId] = useState<number>(0);
  const [source, setSource] = useState<string>('');
  const [socketInitialized, setSocketInitialized] = useState(false);
  const [selectedClient, setSelectedClient] = useState<number | null>(null);
  const [clientsMessages, setClientsMessages] = useState<Record<number, IChatMessage[]>>({});
  const [unreadMessages, setUnreadMessages] = useState<Record<number, number>>({});
  const [totalUnreadMessages, setTotalUnreadMessages] = useState(0);
  const [activeTab, setActiveTab] = useState(0);

  const socket = socketService.socket;


  const showBrowserNotification = (title, options) => {
    console.error('Showing browser notification:', title, options);
    console.error('Notification.permission:', Notification.permission);
    if (Notification.permission === 'granted') {
      const notification = new Notification(title, options);
  
      notification.onclick = () => {
        window.focus();
        // setIsTabActive(true);
      };
    } else {
      console.warn('Уведомление не отправлено: вкладка активна или уведомления не разрешены.');
    }
  };


  useEffect(() => {
    const checkNotificationPermission = async () => {
      try {
        // Проверяем текущий статус разрешения
        console.log('Current Notification.permission:', Notification.permission);
  
        if (Notification.permission === 'default') {
          const permission = await Notification.requestPermission();
          console.log('User response to notification permission:', permission);
  
          if (permission === 'granted') {
            console.log('Notifications are allowed by the user.');
          } else if (permission === 'denied') {
            console.warn('Notifications are denied by the user.');
          }
        } else if (Notification.permission === 'granted') {
          console.log('Notifications are already allowed.');
        } else if (Notification.permission === 'denied') {
          console.warn('Notifications are already denied.');
        }
      } catch (err) {
        console.error('Error requesting notification permission:', err);
      }
    };
  
    checkNotificationPermission();
  }, []);
  


  // Инициализация сокета
  useEffect(() => {
    const handleConnect = () => {
      console.error('Connected to socket server');
      setSocketInitialized(true);
      //soacket.emit('addNewConnection', { email, teacherId, source });
    };

    const handleConfirmConnect = () => {
      console.error('Confirm connection received');
      socket.emit('addNewConnection', { email, teacherId, source });
    };

    const handleDisconnect = () => {
      console.log('Disconnected from socket server');
      setSocketInitialized(false);
    };

    const handleClientMessages = (data: any) => {
      const { clientId, messages: serverMessages } = data;

      console.log('Server Messages', serverMessages.length, 'First message', serverMessages[0]);




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
        format: msg.format,
      }));

      setClientsMessages((prev) => ({
        ...prev,
        [clientId]: [...(prev[clientId] || []), ...newMessages],
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
        format: data.message.format || 'text',
      };

      
        try {
          console.error('START SHOWING NOTIFICATION');
          showBrowserNotification('Новое Повідомлення!', {
            body: `Повідомлення від кліента: ${newMessage.text}`,
          });
          
        } catch (error) {
          console.error('Error showing notification:', error);     
        }
      

      setClientsMessages((prev) => {
        const clientMessages = prev[newMessage.clientId] || [];
        return {
          ...prev,
          [newMessage.clientId]: [...clientMessages, newMessage],
        };
      });

      if (newMessage.clientId !== selectedClient ) {
        setUnreadMessages((prev) => ({
          ...prev,
          [newMessage.clientId]: (prev[newMessage.clientId] || 0) + 1,
        }));
      }
      //update total unread messages
      setTotalUnreadMessages((prev) => prev + 1);
    };

    socket.on('connect', handleConnect);
    socket.on('confirmConnection', handleConfirmConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('clientMessages', handleClientMessages);
    socket.on('newMessage', handleNewMessage);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('confirmConnection', handleConfirmConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('clientMessages', handleClientMessages);
      socket.off('newMessage', handleNewMessage);
    };
  }, [socket, email, teacherId, source, selectedClient]);


  // Инициализация Firebase и загрузка данных
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user && user.email) {
        setEmail(user.email);
       
        teacherInfo(user.email)
          .then((data: any) => {
            let clients: any;
            if (data && data.customers) {
              console.log("CUSTOMERS", data.customers);
              clients = data.customers.map((customer: any) => ({
                id: customer.customerId,
                name: customer.customerName,
                unread: customer.unreadMessages,
                chatEnabled: customer.chatEnabled
              }));
              console.log('======= FETCHED CLIENTS =======', clients);
              setChatClients(clients);
            
              setClientsMessages(clients.reduce((acc, client) => {
                acc[client.id] = [];
                return acc;
              }, {} as Record<number, IChatMessage[]>));

              setUnreadMessages(clients.reduce((acc, client) => {
                acc[client.id] = client.unread || 0; // Используем client.unread из данных сервера
                return acc;
              }, {} as Record<number, number>))

              const totalUnread = clients.reduce((sum, client) => sum + (client.unread || 0), 0);
              setTotalUnreadMessages(totalUnread);
            }
            setTeacherId(data.teacherId);
            setSource(data.source);
            setIsLoggedIn(true);
            setActiveTab(0);
          })
          .catch((err) => {
            console.error('Error fetching teacher info:', err);
            setIsLoggedIn(false);
          });
      } else {
        setIsLoggedIn(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Переотправка addNewConnection после загрузки данных
  useEffect(() => {
    if (isLoggedIn && teacherId && email && source && socketInitialized) {
      console.log('Re-emitting addNewConnection after login and data load');
      if (socket.connected && teacherId !== 0) {
      socket.emit('addNewConnection', { email, teacherId, source });
      }
    }
  }, [isLoggedIn, teacherId, email, source, socketInitialized]);



  // useEffect(() => {
  //   const totalUnread = Object.values(unreadMessages).reduce((sum, count) => sum + count, 0);
  
  //   if (!isTabActive && totalUnread > 0) {
  //     startTitleBlinking(totalUnread); // Запускаем мигание
  //   } else {
  //     stopTitleBlinking(); // Останавливаем мигание, если вкладка активна
  //   }
  // }, [unreadMessages, isTabActive]);




  const onSelectClient = (clientId: number) => {
    console.log("SELECTED CLIENT", clientId);
    setSelectedClient(clientId);
    setActiveTab(1);

    setUnreadMessages((prev) => ({
      ...prev,
      [clientId]: 0,
    }));

    setTotalUnreadMessages((prev) => prev - (unreadMessages[clientId] || 0));

    socket.emit('selectClient', { customerId: clientId, email, teacherId, source });
  };

  const handleSendMessage = (message: string, isEmail: boolean) => {
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
      isEmail: isEmail,
      format: 'text',
    };

    socket.emit('message_from_teacher', {
      message: newMessage,
      teacherId,
      customerId: selectedClient,
      isEmail: isEmail,
    });

    setClientsMessages((prev) => ({
      ...prev,
      [selectedClient]: [...(prev[selectedClient] || []), newMessage],
    }));
  };

  if (!isLoggedIn || !socketInitialized) {
    return <Login />;
  }

  return (
    <Box display="flex" flexDirection="column" height="100vh">
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        px={2}
        py={1.5}
        bgcolor="#ffffff"
        boxShadow="0px 1px 3px rgba(0,0,0,0.1)"
      >
        <Box>
          <Typography
            variant="body1"
            sx={{ fontWeight: 'bold', color: '#333', fontSize: '1rem' }}
          >
            {email}
          </Typography>
          <Typography variant="body2" sx={{ color: '#777', fontSize: '0.85rem' }}>
            {source === 'ua' ? 'Мова-Промова' : source === 'main' ? 'Говорика' : 'Poland'}
          </Typography>
        </Box>
        <IconButton
          color="primary"
          size="medium"
          onClick={async () => {
            await auth.signOut();
          }}
        >
          <FiLogOut />
        </IconButton>
      </Box>

      <Tabs
        value={activeTab}
        onChange={(event, newValue) => setActiveTab(newValue)}
        centered
        indicatorColor="primary"
        textColor="primary"
      >
        <Tab
          label={
            <Badge color="error" badgeContent={totalUnreadMessages}>
              Учні
            </Badge>
          }
        />
        <Tab
          label="Чат"
          disabled={selectedClient === null}
        />
      </Tabs>

      <Box flexGrow={1} overflow="hidden">
        {activeTab === 0 && (
          <MobileSidebar
            clients={chatClients}
            onSelectClient={onSelectClient}
            unreadMessages={unreadMessages}
            selectedClient={selectedClient}
          />
        )}

        {activeTab === 1 && selectedClient !== null && (
          <MobileChatWindow
            backToSidebar={() => setActiveTab(0)}
            selectedClient={selectedClient}
            clients={chatClients}
            messages={clientsMessages[selectedClient] || []}
            onSendMessage={handleSendMessage}
          />
        )}
      </Box>
    </Box>
  );
}

export default MobileApp;
