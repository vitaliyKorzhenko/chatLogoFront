import React, { useState, useEffect, useMemo } from 'react';
import { Box, Tabs, Tab, Badge, Typography, IconButton } from '@mui/material';
import './AppMobile.css';
import { auth } from '../firebaseConfig';
import { teacherInfo } from '../axios/api';
import { IChatMessage, IServerMessage } from '../ClientData';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";

import Login from '../Login';
import MobileSidebar from './sideBar';
import MobileChatWindow from './chatWindow';
import socketService from '../socketService';
import { ChatClient } from '../typeClient';
import { FiLogOut } from 'react-icons/fi';
import { IDialogText, messageFromClient, newMessageNotification, notifSettings, getDialogText, chatText, studentsText } from '../helpers/languageHelper';
import { syncBumesTeacher } from '../helpers/bumesHelper';
import { isoToLocalString, createTimestampString } from '../helpers/dateHelper';

const notificationSound = new Audio('/notification.mp3');

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


  const updateSource = (source: string) => {
    console.error('Updating source:', source);
    setLoginSource(source);
  }


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


    //const reloadTeacherInfo 
    const reloadTeacherInfo = async () => {
      try {
        console.log("========= START RELOAD TEACHER INFO =========");
        //step 1  syncTeacherWithBumes
        //let currentEmail = 'tamilaryinova@gmail.com';
        let result = await syncBumesTeacher(teacherId);
        console.info('syncTeacherWithBumes:', result);
  
        //reload page
        window.location.reload();
      } catch (error) {
        //error
        console.error('Error fetching teacher info:', error);
      }
    };


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

      console.log('Server Messages', serverMessages.length, 'MOBILE FIRST MESSAGE', serverMessages[0]);

      let sortedMessages = serverMessages.sort((a: IServerMessage, b: IServerMessage) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      // filter sorted messages by isActive = true
      sortedMessages = sortedMessages.filter((msg: IServerMessage) => msg.isActive == true);

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
  }, [socket, email, teacherId, source, selectedClient]);


  // Инициализация Firebase и загрузка данных
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user && user.email) {
        setEmail(user.email);
        let currentSource = localStorage.getItem('source');

        teacherInfo(user.email, currentSource)
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
    setSelectedClient(clientId);
    setActiveTab(1);

  
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
    });

    setClientsMessages((prev) => ({
      ...prev,
      [selectedClient]: [...(prev[selectedClient] || []), newMessage],
    }));
  };

  if (!isLoggedIn || !socketInitialized) {
    return <Login updateSource={updateSource} />;
  }

   const handleOpenSettings = () => {
      alert(
        notifSettings(source)
      );
    };
  
    let textDialog: IDialogText = getDialogText(source);
  

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
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          <IconButton
            onClick={reloadTeacherInfo}
            sx={{
              backgroundColor: '#ff3333',
              color: 'white',
              borderRadius: '8px',
              padding: '8px 16px',
              '&:hover': {
                backgroundColor: '#e60000',
                transform: 'scale(1.05)',
              },
              transition: 'all 0.2s ease-in-out',
              boxShadow: '0 2px 8px rgba(255,0,0,0.3)',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span style={{ fontSize: '1.2em' }}>🔄</span>
            v.1.1 Оновити список
          </IconButton>
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
              {studentsText(source)}
            </Badge>
          }
        />
        <Tab
          label={chatText(source)}
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
            source={source}
            reloadTeacherInfo={reloadTeacherInfo}
          />
        )}

        {activeTab === 1 && selectedClient !== null && (
          <MobileChatWindow
            backToSidebar={() => setActiveTab(0)}
            selectedClient={selectedClient}
            clients={chatClients}
            messages={clientsMessages[selectedClient] || []}
            onSendMessage={handleSendMessage}
            source={source}
            deleteMessage={deleteChatMessage}
          />
        )}
      </Box>
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

export default MobileApp;
