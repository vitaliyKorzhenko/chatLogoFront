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
import { IChatMessage } from '../../ClientData';
import DigitalOceanHelper from '../../digitalOceans';
import { renderMessageContent } from '../../helpers';
import { viaEmailMessage } from '../../helpers/languageHelper';
import { sendBumesMessage } from '../../helpers/bumesHelper';

interface ChatWindowProps {
  selectedClient: number | null;
  clients: { id: number; name: string }[];
  messages: IChatMessage[];
  onSendMessage: (message: string, isEmail: boolean, isFile: boolean) => void;
  backToSidebar: () => void;
  source: string;
  deleteMessage?: (message: IChatMessage) => void;
}

const MobileChatWindow: React.FC<ChatWindowProps> = ({
  selectedClient,
  clients,
  messages,
  onSendMessage,
  backToSidebar,
  source,
  deleteMessage,
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [showStickers, setShowStickers] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const [duplicateToEmail, setDuplicateToEmail] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

   const [isUploading, setIsUploading] = useState(false); // Состояние для индикатора загрузки
  


       // ✨ Добавляем состояние для контекстного меню
       const [contextMenu, setContextMenu] = useState<{
         mouseX: number;
         mouseY: number;
         message: IChatMessage | null;
       } | null>(null);

       const handleLongPress = (event: React.TouchEvent<HTMLDivElement>, message: IChatMessage) => {
        event.preventDefault(); // Блокируем стандартное действие
      
        const touch = event.touches[0]; // Получаем координаты первого касания
      
        setContextMenu({
          mouseX: touch.clientX,
          mouseY: touch.clientY,
          message,
        });
      };
      
   
       const handleContextMenu = (event: MouseEvent, message: IChatMessage) => {
        console.log('handleContextMenu');
         event.preventDefault(); // Предотвращаем стандартное меню браузера
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
      setSelectedFileName(file.name);
      setNewMessage(file.name);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !selectedFile) return;

    if (selectedFile) {
      try {
        setIsUploading(true);
        const uploadedUrl = await DigitalOceanHelper.uploadFileElementToSpaces(selectedFile, 'govorikavideo', 'chatLogo');
        setIsUploading(false);
        onSendMessage(uploadedUrl, duplicateToEmail, true);
      } catch (error) {
        console.error('Failed to upload file:', error);
      }
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

  const selectedClientName = clients.find((client) => client.id === selectedClient)?.name || 'Unknown Client';

  const handleForwardToAdmin = async () => {
    if (contextMenu?.message && selectedClient) {
      try {
        const forwardedText = `🔄 Переслано з чату з Логопедом:\n\n${contextMenu.message.text}`;
        await sendBumesMessage(selectedClient, forwardedText);
        
        onSendMessage(
          "Ваше питання передано адміністратору. Найближчим часом адміністратор зателефонує вами.",
          false,
          false
        );

        alert("Message has been forwarded to admin successfully!");
      } catch (error) {
        console.error('Error forwarding message to admin:', error);
        alert("Failed to forward message to admin. Please try again.");
      }
    }
    handleCloseContextMenu();
  };

  return (
    <Box display="flex" flexDirection="column" height="100vh" width="100%" bgcolor="#f9f9f9">
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
  px={2}
  py={0.75} // Уменьшили вертикальный отступ
  height="40px" // Задали фиксированную высоту
  bgcolor="#ffffff"
  boxShadow="0px 1px 3px rgba(0,0,0,0.1)"
  sx={{ position: 'sticky', top: 0, zIndex: 10 }}
>
  <IconButton onClick={backToSidebar} sx={{ marginRight: 0.5, color: '#007bff', fontSize: '1rem', padding: 0.25 }}>
    ←
  </IconButton>
  <Typography variant="body1" fontWeight="bold" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
    {selectedClientName}
  </Typography>
</Box>


      {/* Messages */}
      <Box ref={chatContainerRef} flexGrow={1} px={2} py={1} overflow="auto" display="flex" flexDirection="column" bgcolor="#ffffff">
        {messages.map((message, index) => (
          <Box key={index} display="flex" flexDirection={message.sender === 'client' ? 'row' : 'row-reverse'} mb={1}>
            <Box
              bgcolor={
                message.format === 'text'
                  ? message.sender === 'client'
                    ? '#D0F0C0' // Цвет для клиента
                    : '#0078D7' // Цвет для сервера/бота
                  : '#FFFFFF' // Белый для всех остальных форматов
              }
              p={1.5}
              borderRadius="10px"
              maxWidth="75%"
              sx={{ color: message.sender === 'client' ? '#333' : '#fff' }}
              onContextMenu={(e) => {
                if (message.sender !== 'client') {
                  handleContextMenu(e.nativeEvent, message);
                } 
              }}
              onTouchStart={(e) => handleLongPress(e, message)} // Добавляем обработку долгого нажатия
            >
                {renderMessageContent(message)}
              <Typography variant="caption" display="block" textAlign="right" mt={0.5}>
                {message.timestamp}
              </Typography>
            </Box>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Box>

    {/* Input */}
{/* Input */}
{/* Input */}
<Box display="flex" flexDirection="column" px={2} py={1.5} boxShadow="0 -1px 3px rgba(0,0,0,0.1)" bgcolor="#ffffff">

  {/* Поле ввода с кнопкой отправки внутри */}
  <Box display="flex" alignItems="center" bgcolor="#f1f1f1" borderRadius="25px" px={2} py={1}>
    <TextField
      fullWidth
      variant="standard"
      multiline
      minRows={1}
      value={newMessage}
      onChange={(e) => setNewMessage(e.target.value)}
      placeholder="Type a message..."
      inputProps={{
        maxLength: undefined,
        style: { maxHeight: 'none' }
      }}
      InputProps={{
        disableUnderline: true,
        endAdornment: (
          <IconButton 
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
      sx={{
        flexGrow: 1,
        '& .MuiInputBase-root': {
          padding: '10px 0',
        },
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          setNewMessage((prev) => prev + '\n');
        }
      }}
    />
  </Box>

  {/* Нижняя панель (Смайлик, Скрепка, Email) */}
  <Box display="flex" alignItems="center" justifyContent="space-between" mt={1}>

    {/* Смайлик и Скрепка */}
    <Box display="flex" gap={1}>
      <IconButton onClick={() => setShowStickers(!showStickers)} sx={{ color: '#f39c12' }}>
        😊
      </IconButton>
      <IconButton component="label" sx={{ color: '#007bff' }}>
        📎
        <input type="file" hidden onChange={handleFileChange} />
      </IconButton>
    </Box>

    {/* Send via Email */}
    <Box display="flex" alignItems="center">
      <Typography variant="caption">{viaEmailMessage(source)}</Typography>
      <Checkbox size="small" checked={duplicateToEmail} onChange={(e) => setDuplicateToEmail(e.target.checked)} />
    </Box>
  </Box>
</Box>



      {/* Stickers */}
      {showStickers && (
        <Box display="flex" flexWrap="wrap" gap={1} p={1} bgcolor="#f9f9f9" boxShadow="0 -1px 3px rgba(0,0,0,0.1)">
          {stickers.map((sticker, index) => (
            <IconButton key={index} onClick={() => setNewMessage((prev) => prev + sticker)}>
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

export default MobileChatWindow;
