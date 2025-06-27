import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  CssBaseline,
  ThemeProvider,
  createTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography
} from '@mui/material';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { io, Socket } from 'socket.io-client';
import './App.css';
import Login from './Login';
import Sidebar from './SideBar';
import ChatWindow from './ChatWindow';
import { auth } from './firebaseConfig';
import { teacherInfo } from './axios/api';
import { ChatClient } from './typeClient';
import { IChatMessage, IServerMessage } from './ClientData';
import socketService from './socketService';
import { createTitle } from './helpers';
import { IDialogText, messageFromClient, newMessageNotification, notifSettings, getDialogText } from './helpers/languageHelper';
import {  syncBumesTeacher } from './helpers/bumesHelper';
import { isoToLocalString, createTimestampString } from './helpers/dateHelper';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [chatClients, setChatClients] = useState<ChatClient[]>([]);
  const [email, setEmail] = useState(''); // Email пользователя
  const [teacherId, setTeacherId] = useState<number>(0);
  const [source, setSource] = useState<string>('');
  const [socketInitialized, setSocketInitialized] = useState(false); // Состояние для сокета
  const [selectedClient, setSelectedClient] = useState<number | null>(null);
  const [clientsMessages, setClientsMessages] = useState<Record<number, IChatMessage[]>>({});
  const [unreadMessages, setUnreadMessages] = useState<Record<number, number>>({});
  const [totalUnreadMessages, setTotalUnreadMessages] = useState(0);

  const [titleBlinker, setTitleBlinker] = useState<ReturnType<typeof setInterval> | null>(null);

  const [isTabActive, setIsTabActive] = useState(true); // Вкладка активна

  const [loginSource, setLoginSource] = useState<string | null>('ua');

  //delete chatMessages
  const deleteChatMessage = (message: IChatMessage) => {
    try {
      //delete message
      console.error('Deleting message:', message);
      //delete message from server
      message.source = source;
      socketService.socket.emit('deleteMessage', message );

      //update message
      setClientsMessages((prev) => {
        const clientMessages = prev[message.clientId] || [];
        return {
          ...prev,
          [message.clientId]: clientMessages.filter((msg) => msg.id !== message.id),
        };
      });
      
    } catch (error) {
      
    }
  };

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

  const updateSource = (source: string) => {
    console.error('Updating source:', source);
    setLoginSource(source);
  }
  
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
  
  

  const socket = socketService.socket;

  const defaultTitle = 'LogoChat';
  // Добавляем звук уведомления
  const notificationSound = new Audio('/notification.mp3');


  const showBrowserNotification = (title, options) => {
    console.error('Showing browser notification:', title, options);
    console.error('Notification.permission:', Notification.permission);
    if (Notification.permission === 'granted') {
      const notification = new Notification(title, options);
  
      notification.onclick = () => {
        window.focus();
        setIsTabActive(true);
      };
    } else {
      console.warn('Уведомление не отправлено: вкладка активна или уведомления не разрешены.');
    }
  };


  // const updateTabTitle = (hasNewMessages: boolean) => {
  //   document.title = hasNewMessages ? '🔔 Новое сообщение!' : defaultTitle;
  // };

  const [open, setOpen] = useState(false);


  useEffect(() => {
    const checkNotificationPermission = async () => {
      try {
        console.log("Current Notification.permission:", Notification.permission);

        if (Notification.permission === "default") {
          const permission = await Notification.requestPermission();
          console.log("User response to notification permission:", permission);

          if (permission === "denied") {
            setOpen(true); // Показываем алерт если отказано
          }
        } else if (Notification.permission === "denied") {
          setOpen(true); // Если уже отклонено, тоже показываем алерт
        }
      } catch (err) {
        console.error("Error requesting notification permission:", err);
      }
    };

    checkNotificationPermission();
  }, []);

  const handleClose = () => setOpen(false);


  const handleRequestPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      console.log("User manually requested notification permission:", permission);

      if (permission === "granted") {
        setOpen(false);
        new Notification("✅ Уведомления включены!");
      } else if (permission === "denied") {
        console.warn("Notifications are denied by the user.");
        setOpen(true);
      }
    } catch (err) {
      console.error("Error requesting notification permission:", err);
    }
  };


  //const reloadTeacherInfo 
  const reloadTeacherInfo = async () => {
    try {
      console.log("========= START RELOAD TEACHER INFO =========");
      
      // Только новая синхронизация!
      await syncBumesTeacher(teacherId);
      console.info('Teacher synced successfully');

      // Перезагрузка страницы
      window.location.reload();
    } catch (error) {
      console.error('Error updating teacher info:', error);
      alert('Error updating information. Please try again.');
    }
  };



  // Логирование после обновления
useEffect(() => {
  console.error('SOURCE UPDATED:', loginSource); // Гарантированно обновлённое значение
}, [loginSource]);

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

      let sortedMessages = serverMessages.sort((a: IServerMessage, b: IServerMessage) =>
        a.id - b.id
      );

      // filter sorted messages by isActive = true
      sortedMessages = sortedMessages.filter((msg: IServerMessage) => msg.isActive == true);
      
      console.error('Received client messages:', clientId, '==========COUNT MESSAGE ===========', serverMessages.length,  '===== LAST MESSAGE:', serverMessages[serverMessages.length - 1]);

      console.error('Sorted messages:', sortedMessages);  

      const newMessages = sortedMessages.map((msg: IServerMessage) => ({
        clientId,
        text: msg.messageText,
        timestamp: isoToLocalString(msg.createdAt),
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
        timestamp: data.message.timestamp ? isoToLocalString(data.message.timestamp) : createTimestampString(),
        source: data.message.source || 'chat',
        sender: 'client',
        id: data.message.id || Date.now(),
        format: data.message.format || 'text',
      };

      try {
        // Добавляем воспроизведение звука
        notificationSound.play().catch(err => console.error('Error playing sound:', err));

        console.error('START SHOWING NOTIFICATION');
        showBrowserNotification(newMessageNotification(source), {
          body: messageFromClient(source) + newMessage.text,
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
  }, [socket, email, teacherId,selectedClient]);

  
  useEffect(() => {
    const handleVisibilityChange = () => {
      const newTabState = !document.hidden;
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
      console.error('BEFORE TEACHER INFO ======', user.email, loginSource);
      //get source from local storage
      let currentSource = localStorage.getItem('source');
      let email = user.email;
       //email = 'tamilaryinova@gmail.com';
        teacherInfo(email, currentSource)
          .then((data: any) => {
            let clients: any;
            if (data && data.customers) {
              clients = data.customers.map((customer: any) => ({
                id: customer.customerId,
                name: customer.customerName,
                unread: customer.unreadMessages,
                chatEnabled: customer.chatEnabled
              }));
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

            if (clients && clients.length > 0) {
              setSelectedClient(null);
            }
            console.error("SET SOURCE AND EMAIL", data)
            setEmail(user.email);
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

  const onSelectClient = (clientId: number) => {
    setSelectedClient(clientId);
  
    // Очищаем сообщения перед загрузкой новых
    setClientsMessages((prev) => ({
      ...prev,
      [clientId]: [],
    }));
  
    setUnreadMessages((prev) => ({
      ...prev,
      [clientId]: 0,
    }));
  
    setTotalUnreadMessages(Object.values(unreadMessages).reduce((sum, count) => sum + count, 0));
  
    if (socket.connected) {
      console.error('Emitting selectClient:', clientId, email, teacherId, source);
      socket.emit('selectClient', { customerId: clientId, email, teacherId, source });
    } else {
      console.error('Socket is not connected');
    }
  };
  
  const handleSendMessage = (message: string, isEmail: boolean, isFile: boolean) => {
    if (!selectedClient) {
      console.error('No client selected');
      return;
    }

    const newMessage: IChatMessage = {
      id: Date.now(),
      clientId: selectedClient,
      text: message,
      timestamp: createTimestampString(),
      source: 'chat',
      sender: 'teacher',
      isEmail: isEmail,
      format: isFile ? 'file' : 'text',
      isFile: isFile,
    };

    console.error('Sending message:', newMessage);
    socket.emit('message_from_teacher', {
      message: newMessage,
      teacherId,
      customerId: selectedClient,
      isEmail: isEmail,
      isFile: isFile,
      source: source,
    });

    setClientsMessages((prev) => ({
      ...prev,
      [selectedClient]: [...(prev[selectedClient] || []), newMessage],
    }));
  };

  if (!isLoggedIn || !socketInitialized) {
    return <Login updateSource={updateSource} />;
  }

  //console.error("========= SORUCE BEFORE RENDER", source);

  const handleOpenSettings = () => {
    alert(
      notifSettings(source)
    );
  };

  let textDialog: IDialogText = getDialogText(source);

  return (
    <Box
    display="flex"
  height="100vh"
  width="100vw"
  padding="0"
  margin="0"
  sx={{
    overflow: 'hidden', /* Убираем скроллы */
    margin: 0, // Убираем возможные отступы
  }}
    >
        <Box
    sx={{
      flexShrink: 0, /* Sidebar фиксированной ширины */
      width: '100', /* Устанавливаем ширину Sidebar */
      height: '100%', /* Растягиваем на всю высоту */
      backgroundColor: '#f0f0f0', /* Пример цвета */
      margin: 0, // Убираем возможные отступы
    }}
  >
      <Sidebar
       totalUnreadMessages={totalUnreadMessages}
        email={email}
        clients={chatClients}
        onSelectClient={onSelectClient}
        unreadMessages={unreadMessages}
        title={createTitle(source)}
        selectedClient={selectedClient} // Передаём выбранного клиента
        source={source}
        reloadTeacherInfo={reloadTeacherInfo}

      />
      </Box>
      <Box
    sx={{
      flexGrow: 1, /* ChatWindow занимает оставшееся пространство */
      height: '100%', /* Полная высота */
      width: '100%', /* Полная ширина */
      overflowY: 'auto', /* Вертикальный скролл для сообщений */
      backgroundColor: '#ffffff', /* Цвет чата */
    }}
  >
      <ChatWindow
       source={source}
        selectedClient={selectedClient}
        clients={chatClients}
        messages={filteredMessages}
        onSendMessage={handleSendMessage}
        sx={{
          flexGrow: 1, // Занимает все оставшееся пространство
          overflow: 'hidden', // Убирает горизонтальный скроллинг
          margin: 0, // Убираем возможные отступы
        }}
      />
      </Box>
     
      {/* Тут может быть остальная логика твоего компонента */}
      
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{textDialog.title}</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
           {textDialog.message}
          </Typography>
          <img
      src="/notif1.png"
      alt="Instruction to Allow Notifications"
      style={{
        width: '100%',
        maxWidth: '400px',
        borderRadius: '8px',
        marginTop: '16px',
      }}
    />
        </DialogContent>
        <DialogActions>
          {Notification.permission === "default" ? (
            <Button onClick={handleRequestPermission} color="primary">
              {textDialog.allow}
            </Button>
          ) : (
            <Button onClick={handleOpenSettings} color="primary">
             {textDialog.howToEnable}
            </Button>
          )}
          <Button onClick={handleClose} color="secondary">
            {textDialog.later}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default App;
