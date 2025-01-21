import React, { useState, useEffect, useMemo } from 'react';
import { Box } from '@mui/material';
import './AppMobile.css';
import { auth } from '../firebaseConfig';
import { teacherInfo } from '../axios/api';
import { IChatMessage, IServerMessage } from '../ClientData';
import Login from '../Login';
import MobileSidebar from './sideBar';
import MobileChatWindow from './chatWindow';
import socketService from '../socketService';
import { ChatClient } from '../typeClient';

function MobileApp() {
console.error("============= IN MOBILE APP ================")
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [chatClients, setChatClients] = useState<ChatClient[]>([]);
  const [email, setEmail] = useState('');
  const [teacherId, setTeacherId] = useState<number>(0);
  const [source, setSource] = useState<string>('');
  const [socketInitialized, setSocketInitialized] = useState(false);
  const [selectedClient, setSelectedClient] = useState<number | null>(null);
  const [clientsMessages, setClientsMessages] = useState<Record<number, IChatMessage[]>>({});
  const [unreadMessages, setUnreadMessages] = useState<Record<number, number>>({});

  const socket = socketService.socket;
  const defaultTitle = 'LogoChat';


  const onSelectClient = (clientId: number) => {
    setSelectedClient(clientId);
    setUnreadMessages((prev) => ({
      ...prev,
      [clientId]: 0,
    }));

    if (socket.connected) {
      socket.emit('selectClient', { customerId: clientId, email, teacherId, source });
    } else {
      console.error('Socket is not connected');
    }
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


  //back to sidebar
  const backToSidebar = () => {
    setSelectedClient(null);
  }


  const [titleBlinker, setTitleBlinker] = useState<ReturnType<typeof setInterval> | null>(null);

  const [isTabActive, setIsTabActive] = useState(true); // Вкладка активна

  

  const changeFavicon = (iconUrl: string) => {
    const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement | null;
    if (link) {
      link.href = iconUrl; // Обновляем href
    } else {
      const newLink = document.createElement('link');
      newLink.rel = 'icon'; // Устанавливаем rel
      newLink.href = iconUrl; // Устанавливаем href
      document.head.appendChild(newLink); // Добавляем в <head>
    }
  };
  
  const startTitleBlinking = (unreadCount: number) => {
    if (titleBlinker !== null) return; // Если уже мигает, ничего не делаем
  
    const originalTitle = defaultTitle;
    const originalFavicon = document.querySelector("link[rel*='icon']")?.getAttribute('href') || ''; // Сохраняем текущую иконку
    const alertFavicon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAIAAAACUFjqAAAABnRSTlMAAAAAAABupgeRAAAAEElEQVR4AWPYdwIBAAADAAEKbgM1AAAAAElFTkSuQmCC'; // Пример пустой иконки
  
    const blinker = setInterval(() => {
      const isOriginal = document.title === originalTitle;
      document.title = isOriginal
        ? `${unreadCount} новое повідомлення!`
        : originalTitle;
      changeFavicon(isOriginal ? alertFavicon : originalFavicon);
    }, 1000); // Меняем заголовок каждую секунду
  
    setTitleBlinker(blinker);
  };

  const stopTitleBlinking = () => {
    if (titleBlinker !== null) {
      clearInterval(titleBlinker);
      setTitleBlinker(null);
      document.title = defaultTitle; // Сбрасываем заголовок
    }
  };

  const showBrowserNotification = (title, options) => {
    console.error('Showing browser notification:', title, options);
    console.error('Notification.permission:', Notification.permission);
    if (Notification.permission === 'granted') {
      const notification = new Notification(title, options);
  
      notification.onclick = () => {
        console.log('Уведомление кликнуто, возвращаем фокус на приложение.');
        window.focus();
        setIsTabActive(true);
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

  
  useEffect(() => {
    const handleVisibilityChange = () => {
      console.log('Visibility change triggered. document.hidden:', document.hidden);
      const newTabState = !document.hidden;
      console.log('Updating isTabActive to:', newTabState);
      setIsTabActive(newTabState);
    };
  
    document.addEventListener('visibilitychange', handleVisibilityChange);
  
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [])
  
  // Инициализация Firebase и загрузка данных
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user && user.email) {
        setEmail(user.email);

        teacherInfo(user.email)
          .then((data: any) => {
            let clients: any;
            if (data && data.customers) {
              clients = data.customers.map((customer: any) => ({
                id: customer.customerId,
                name: customer.customerName,
                unread: 0,
                chatEnabled: customer.chatEnabled
              }));
              setChatClients(clients);
            
              setClientsMessages(clients.reduce((acc, client) => {
                acc[client.id] = [];
                return acc;
              }, {} as Record<number, IChatMessage[]>));
              setUnreadMessages(clients.reduce((acc, client) => {
                acc[client.id] = 0;
                return acc;
              }, {} as Record<number, number>));
            }

            if (clients && clients.length > 0) {
              setSelectedClient(null);
            }
            setTeacherId(data.teacherId);
            setSource(data.source);
            setIsLoggedIn(true);
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



  useEffect(() => {
    const totalUnread = Object.values(unreadMessages).reduce((sum, count) => sum + count, 0);
  
    if (!isTabActive && totalUnread > 0) {
      startTitleBlinking(totalUnread); // Запускаем мигание
    } else {
      stopTitleBlinking(); // Останавливаем мигание, если вкладка активна
    }
  }, [unreadMessages, isTabActive]);

  
  const filteredMessages = useMemo(() => {
    return selectedClient !== null ? clientsMessages[selectedClient] || [] : [];
  }, [clientsMessages, selectedClient]);





  

  if (!isLoggedIn || !socketInitialized) {
    return <Login />;
  }

  return (
    <Box
      display="flex"
      height="100vh"
      width="100vw"
      //sx={{ overflow: 'hidden' }}
    >
      {selectedClient === null ? (
        <MobileSidebar
          email={email}
          clients={chatClients}
          onSelectClient={onSelectClient}
          unreadMessages={unreadMessages}
          title={
            source === 'ua' ? 'Мова-Промова' : source === 'main' ? 'Говорика' : 'Poland'
          }
          selectedClient={selectedClient}
        />
      ) : (
        <MobileChatWindow
        backToSidebar={backToSidebar}
        //   source="ua"
          selectedClient={selectedClient}
          clients={chatClients}
          messages={filteredMessages}
          onSendMessage={handleSendMessage}
        />
      )}
    </Box>
  );
}

export default MobileApp;
