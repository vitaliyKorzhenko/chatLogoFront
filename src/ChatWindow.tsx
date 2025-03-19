// ChatWindow.tsx
import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Button,
  Checkbox,
  CircularProgress,
  Menu,
  MenuItem
} from '@mui/material';

import { IChatMessage } from './ClientData';
import DigitalOceanHelper from './digitalOceans';
import { renderMessageContent } from './helpers';
import { getTgLink, viaEmailMessage } from './helpers/languageHelper';
import { sendBumesMessage } from './helpers/bumesHelper';


interface ChatWindowProps {
  source: string;
  selectedClient: number | null;
  clients: { id: number; name: string, chatEnabled: boolean }[];
  messages: IChatMessage[];
  onSendMessage: (message: string, isEmail: boolean, isFile: boolean) => void;
  sx?: object; // Добавляем это свойство
  deleteMessage?: (message: IChatMessage) => void;

}

const ChatWindow: React.FC<ChatWindowProps> = ({ selectedClient, clients, messages, onSendMessage, sx, source, deleteMessage}) => {
  const [newMessage, setNewMessage] = useState('');
  const [showStickers, setShowStickers] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [duplicateToEmail, setDuplicateToEmail] = useState(false);

  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);


  const [selectedFile, setSelectedFile] = useState<File | null>(null); // Состояние для выбранного файла

  const [isUploading, setIsUploading] = useState(false); // Состояние для индикатора загрузки

    // ✨ Добавляем состояние для контекстного меню
    const [contextMenu, setContextMenu] = useState<{
      mouseX: number;
      mouseY: number;
      message: IChatMessage | null;
    } | null>(null);

    const handleContextMenu = (event: MouseEvent, message: IChatMessage) => {
      event.preventDefault();
      setContextMenu({
        mouseX: event.clientX - 2,
        mouseY: event.clientY - 4,
        message,
      });
    };

      // ✨ Закрываем меню
  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  // ✨ Копирование текста сообщения
  const handleCopyMessage = () => {
    if (contextMenu?.message) {
      navigator.clipboard.writeText(contextMenu.message.text);
    }
    handleCloseContextMenu();
  };

  // ✨ Удаление сообщения
  const handleDeleteMessage = () => {
    if (contextMenu?.message && deleteMessage) {
      deleteMessage(contextMenu.message);
    }
    handleCloseContextMenu();
  };
  


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setSelectedFileName(file.name); // Показываем имя файла в поле ввода
      setNewMessage(file.name); // Вставляем имя в `TextField`
    }
  };
  
  const handleSendMessage = async () => {
    if (!newMessage.trim() && !selectedFile) return; // Нельзя отправить пустое сообщение
  
    if (selectedFile) {
      try {
        setIsUploading(true);
        const uploadedUrl = await DigitalOceanHelper.uploadFileElementToSpaces(
          selectedFile,
          'govorikavideo',
          'chatLogo'
        );
        setIsUploading(false);
        
        onSendMessage(uploadedUrl, duplicateToEmail, true);
      } catch (error) {
        console.error('Failed to upload file:', error);
      }
  
      // Очищаем после отправки
      setSelectedFile(null);
      setSelectedFileName(null);
      setNewMessage('');
    } else {
      onSendMessage(newMessage.trim(), duplicateToEmail, false);
      setNewMessage('');
    }
  };
  
  

  useLayoutEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView();
    }
  }, [messages]);


  const stickers = ['😊', '👍', '🎉', '❤️', '😂', '😢', '🙌', '🔥', '🎁', '🤔'];


  

  const getTelegramLink = (id: number) => {
    let project = source === 'ua' ? 'promova' : source === 'pl' ? 'poland' : 'main';
    return `https://t.me/ChatLogoGovorikaBot?start=tg${id}source` + project;
  }

  // const getWhatsAppLink = (id: number) => {
  //   let project = source === 'ua' ? 'promova' : source === 'pl' ? 'poland' : 'main';
  //  return `https://wa.me/18059959955?text=wtsp${id}source` + project;
  // }

  const selectedClientName = clients.find((client) => client.id === selectedClient)?.name || 'Unknown Client';
  

  const handleForwardToAdmin = async () => {
    if (contextMenu?.message) {
      try {
        // Отправляем сообщение админу
        let currentClient = clients.find((client) => client.id === selectedClient);
        console.log('currentClient', currentClient);
        if (currentClient) {
        await sendBumesMessage(currentClient?.id, contextMenu.message.text);
        }
        
        // Отправляем уведомление клиенту
        onSendMessage(
          "Ваше питання передано адміністратору. Найближчим часом адміністратор зателефонує вами.",
          false,
          false
        );

        // Показываем алерт об успешной отправке
        alert("Message has been forwarded to admin successfully!");
      } catch (error) {
        console.error('Error forwarding message to admin:', error);
        alert("Failed to forward message to admin. Please try again.");
      }
    }
    handleCloseContextMenu();
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      flexGrow={1}
      height="100vh"
      width="100%"
      sx={{
        backgroundColor: '#ffffff',
        overflow: 'hidden',
        ...sx, // Пользовательские стили
      }}
    >
          {isUploading && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <CircularProgress />
        </Box>
      )}
      {/* Header */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        p={2}
        boxShadow={1}
        bgcolor="#ffffff"
        sx={{ position: 'sticky', top: 0, zIndex: 10 }}
      >
        <Typography variant="h6" fontWeight="bold">
          {selectedClientName}
        </Typography>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              navigator.clipboard.writeText(getTelegramLink(selectedClient || 0));
              //alert
              alert(getTgLink(source));

            }}
            sx={{
              textTransform: 'none',
              color: '#007bff',
              borderColor: '#007bff',
              '&:hover': {
                backgroundColor: '#e6f7ff',
                borderColor: '#0056b3',
              },
            }}
          >
            {' 🔗 Telegram'}
          </Button>
        </Box>
      </Box>
  
      {/* Messages */}
      <Box
        flexGrow={1}
        p={2}
        sx={{
          flexDirection: 'column',
          display: 'flex',
          overflowX: 'hidden',
          margin: 0,
          padding: 0,
        }}
      >
        {messages.map((message, index) => (
          <Box
            key={index}
            display="flex"
            flexDirection={message.sender === 'client' ? 'row' : 'row-reverse'}
            mb={1}
          >
            <Box
            bgcolor={
              message.format === 'text'
                ? message.sender === 'client'
                  ? '#D0F0C0' // Цвет для клиента
                  : '#0078D7' // Цвет для сервера/бота
                : '#FFFFFF' // Белый для всех остальных форматов
            }
              p={1.5}
              borderRadius="12px"
              maxWidth="70%"
              sx={{ color: message.sender === 'client' ? '#333' : '#fff' }}
              onContextMenu={(e) => {
                handleContextMenu(e.nativeEvent, message);
              }}
              >
              {renderMessageContent(message)}
              {/* {message.text} */}
              <Typography variant="caption" display="block" textAlign="right" mt={0.5}>
                {message.timestamp}
              </Typography>
            </Box>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Box>
  
      {/* Input */}
      <Box display="flex" flexDirection="column" p={2} boxShadow={1} sx={{ flexShrink: 0, margin: 0 }}>
        <Box display="flex" alignItems="center">
          <IconButton
            onClick={() => setShowStickers(!showStickers)} // Открываем/закрываем панель стикеров
            sx={{
              '&:focus': {
                outline: 'none',
              },
              '&:hover': {
                backgroundColor: '#e0e0e0', // Нежный серый фон при наведении
              },
              boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)', // Тень
              color: '#000', // Цвет стикера
            }}
          >
            😊
          </IconButton>
          <TextField
            fullWidth
            variant="outlined"
            multiline
            maxRows={4}
            value={newMessage}
            onChange={(e) => {
              if (e.target.value.length <= 255) {
                setNewMessage(e.target.value);
              }
            }}
            placeholder="Type your message..."
               InputProps={{
                    disableUnderline: true, // Убираем стандартную линию под текстом
                    endAdornment: (
                      <IconButton 
                        disabled={isUploading} // Кнопка неактивна во время загрузки
                        onClick={handleSendMessage}
                        sx={{
                          bgcolor: '#007bff',
                          color: '#fff',
                          borderRadius: '50%',
                          width: '40px',
                          height: '40px',
                          ml: 1, // Отступ слева от текста
                          '&:hover': { bgcolor: '#0056b3' }
                        }}
                      >
                        ➤
                      </IconButton>
                    ),
                  }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                handleSendMessage(); // Отправляем сообщение
                e.preventDefault();
              }
            }}
          />
      <IconButton
  component="label"
  sx={{
    marginLeft: 1,
    fontSize: '18px', // Размер текста для скрепки
    cursor: 'pointer',
    padding: '8px',
    border: '1px solid #ccc',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    '&:hover': {
      backgroundColor: '#e0e0e0',
    },
  }}
>
  📎 {/* Используем emoji-скрепку */}
  <input
    type="file"
    hidden
    onChange={handleFileChange}
   // onChange={handleFileChange} // Обработчик выбора файла
  />
</IconButton>

         
        </Box>
        <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mt: 1 }}>
  <Typography variant="caption" color="textSecondary">
    {`${newMessage.length}/255`}
  </Typography>
  <Box display="flex" alignItems="center" gap={1}>
    <Typography variant="caption" color="textSecondary">
     {viaEmailMessage(source)}
    </Typography>
    <Checkbox
      checked={duplicateToEmail}
      onChange={(e) => setDuplicateToEmail(e.target.checked)}
      color="primary"
      size="small"
    />
  </Box>
</Box>

      </Box>
  
      {/* Stickers Panel */}
      {showStickers && (
        <Box
          display="flex"
          flexWrap="wrap"
          gap={1}
          p={1}
          bgcolor="#ffffff"
          sx={{
            flexShrink: 0,
            '& .MuiIconButton-root': {
              outline: 'none',
            },
          }}
        >
          {stickers.map((sticker, index) => (
            <IconButton
              key={index}
              onClick={() => setNewMessage((prev) => prev + sticker)} // Добавляем стикер в сообщение
              sx={{
                '&:focus': {
                  outline: 'none',
                },
                '&:hover': {
                  backgroundColor: '#e0e0e0', // Нежный серый фон при наведении
                },
                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)', // Тень
                color: '#000', // Цвет стикера
              }}
            >
              {sticker}
            </IconButton>
          ))}
        </Box>
      )}

      {/* 📌 Контекстное меню (копирование / удаление) */}
      <Menu
  open={contextMenu !== null}
  onClose={handleCloseContextMenu}
  anchorReference="anchorPosition"
  anchorPosition={
    contextMenu !== null
      ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
      : undefined
  }
>
  <MenuItem onClick={handleCopyMessage}>📎 copy</MenuItem>
  {contextMenu?.message?.sender === 'client' ? (
    <MenuItem onClick={handleForwardToAdmin}>📤 Forward to Admin</MenuItem>
  ) : (
    deleteMessage && (
      <MenuItem onClick={handleDeleteMessage} sx={{ color: 'red' }}>
        🗑️ delete
      </MenuItem>
    )
  )}
</Menu>

    </Box>
  );
  
  
  
};

export default ChatWindow;
