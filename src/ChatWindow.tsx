// ChatWindow.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Button,
  Checkbox,
} from '@mui/material';

import { IChatMessage } from './ClientData';
import DigitalOceanHelper from './digitalOceans';

interface ChatWindowProps {
  source: 'ua' | 'main' | 'pl';
  selectedClient: number | null;
  clients: { id: number; name: string, chatEnabled: boolean }[];
  messages: IChatMessage[];
  onSendMessage: (message: string, isEmail: boolean, isFile: boolean) => void;
  sx?: object; // Добавляем это свойство

}

const ChatWindow: React.FC<ChatWindowProps> = ({ selectedClient, clients, messages, onSendMessage, sx }) => {
  const [newMessage, setNewMessage] = useState('');
  const [showStickers, setShowStickers] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [duplicateToEmail, setDuplicateToEmail] = useState(false);



  const [selectedFile, setSelectedFile] = useState<File | null>(null); // Состояние для выбранного файла


  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      console.log('Selected file:', file);

      try {
        // Вызов вашей функции загрузки файла
        const uploadedUrl = await DigitalOceanHelper.uploadFileElementToSpaces(
          file,
          'govorikavideo', 
          'chatLogo'
        );
        console.log('Uploaded URL:', uploadedUrl);
        onSendMessage(uploadedUrl, duplicateToEmail, true);
        setNewMessage('');

      } catch (error) {
        console.error('Failed to upload file:', error);
      }
    }
  }


  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const stickers = ['😊', '👍', '🎉', '❤️', '😂', '😢', '🙌', '🔥', '🎁', '🤔'];

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    onSendMessage(newMessage.trim(), duplicateToEmail, false);
    setNewMessage('');
  };

  const getTelegramLink = (id: number) =>
    `https://t.me/ChatLogoGovorikaBot?start=tg${id}sourcepromova`;

  const getWhatsAppLink = (id: number) =>
    `https://wa.me/12295449955?text=wtsp${id}sourcepromova`;

  const selectedClientName = clients.find((client) => client.id === selectedClient)?.name || 'Unknown Client';

  //chat enabled
  const chatEnabled = clients.find((client) => client.id === selectedClient)?.chatEnabled || false;

  const renderMessageContent = (message: IChatMessage) => {
    switch (message.format) {
      case 'voice':
      case 'audio':
        return (
          <audio controls>
            <source src={message.text} type="audio/mpeg" />
            Браузер не поддерживает воспроизведение аудио.
          </audio>
        );
  
      case 'photo':
        return <img src={message.text} alt="Photo" style={{ maxWidth: '100%', borderRadius: '8px' }} />;
      
      case 'image':
        return <img src={message.text} alt="Photo" style={{ maxWidth: '100%', borderRadius: '8px' }} />;
  
      case 'document':
        return (
          <a href={message.text} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff' }}>
            📄 Завантажити файл 
          </a>
        );
      case 'file':
       return (
          <a href={message.text} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff' }}>
            📄 Завантажити файл 
          </a>
        );
  
      case 'video':
        return (
          <video controls style={{ maxWidth: '100%', borderRadius: '8px' }}>
            <source src={message.text} type="video/mp4" />
            Ваш браузер не підтримує відтворення відео.
          </video>
        );
  
      case 'video_note':
      case 'vide_note': // Вариант кружка, как в Telegram
        return (
          <video
            controls
            style={{
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              objectFit: 'cover',
            }}
          >
            <source src={message.text} type="video/mp4" />
            Ваш браузер не підтримує відтворення відео.
          </video>
        );
  
      default:
        return <>{message.text}</>;
    }
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
              alert('Посилання на чат в Telegram скопійовано в буфер обміну');

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
          <Button
            variant="outlined"
            size="small"
            onClick={() => 
            {
              navigator.clipboard.writeText(getWhatsAppLink(selectedClient || 0));
              //alert
              alert('Посилання на чат в WhatsApp скопійовано в буфер обміну');
            }}
            sx={{
              textTransform: 'none',
              color: '#28a745',
              borderColor: '#28a745',
              '&:hover': {
                backgroundColor: '#e6ffe6',
                borderColor: '#1d7a34',
              },
            }}
          >
            {' 🔗 WhatsApp'}
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
    onChange={handleFileChange} // Обработчик выбора файла
  />
</IconButton>


          
          {
            chatEnabled ?
            <Button onClick={handleSendMessage} variant="contained" sx={{ marginLeft: 1 }}>
            Send
          </Button>
          :
           // Кнопка неактивна, если чат отключен
          <Button disabled variant="contained" sx={{ marginLeft: 1 }}>
            Send-(disabled)
          </Button>
          }
         
        </Box>
        <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mt: 1 }}>
  <Typography variant="caption" color="textSecondary">
    {`${newMessage.length}/255`}
  </Typography>
  <Box display="flex" alignItems="center" gap={1}>
    <Typography variant="caption" color="textSecondary">
      Відправити на email
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
    </Box>
  );
  
  
  
};

export default ChatWindow;
