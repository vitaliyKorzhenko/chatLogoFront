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

import { IChatMessage, IEditMessageModel } from '../../ClientData';
import DigitalOceanHelper from '../../digitalOceans';
import { renderMessageContent } from '../../helpers';
import { getTgLink, viaEmailMessage } from '../../helpers/languageHelper';
import { sendBumesMessage } from '../../helpers/bumesHelper';
import { formatDateTime, formatDateKey } from '../../helpers/dateHelper';

interface ChatWindowProps {
  selectedClient: number | null;
  clients: { id: number; name: string; source: string }[];
  messages: IChatMessage[];
  onSendMessage: (message: string, isEmail: boolean, isFile: boolean) => void;
  onEditMessage?: (editData: IEditMessageModel) => void;
  backToSidebar: () => void;
  source: string;
}

const MobileChatWindow: React.FC<ChatWindowProps> = ({
  selectedClient,
  clients,
  messages,
  onSendMessage,
  onEditMessage,
  backToSidebar,
  source,
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [showStickers, setShowStickers] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const [duplicateToEmail, setDuplicateToEmail] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [selectedMessages, setSelectedMessages] = useState<IChatMessage[]>([]);

  const [isUploading, setIsUploading] = useState(false); // Состояние для индикатора загрузки
  
  // Состояние для редактирования сообщения
  const [editingMessage, setEditingMessage] = useState<IChatMessage | null>(null);
  const [editText, setEditText] = useState('');
  
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

  // ✨ Редактирование сообщения
  const handleEditMessage = () => {
    if (contextMenu?.message && contextMenu.message.sender === 'teacher') {
      setEditingMessage(contextMenu.message);
      setEditText(contextMenu.message.text);
    }
    handleCloseContextMenu();
  };

  // ✨ Сохранение отредактированного сообщения
  const handleSaveEdit = () => {
    if (editingMessage && onEditMessage && editText.trim()) {
      onEditMessage({
        id: editingMessage.id,
        newMessage: editText.trim(),
        clientId: editingMessage.clientId,
        source: source
      });
      setEditingMessage(null);
      setEditText('');
    }
  };

  // ✨ Отмена редактирования
  const handleCancelEdit = () => {
    setEditingMessage(null);
    setEditText('');
  };

  // Получаем последнее сообщение учителя
  const getLastTeacherMessage = () => {
    const teacherMessages = messages.filter(msg => msg.sender === 'teacher');
    return teacherMessages.length > 0 ? teacherMessages[teacherMessages.length - 1] : null;
  };

  const lastTeacherMessage = getLastTeacherMessage();

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

  const handleMessageSelect = (message: IChatMessage) => {
    if (message.sender === 'client') {
      setSelectedMessages(prev => {
        const isSelected = prev.some(m => m.id === message.id);
        if (isSelected) {
          return prev.filter(m => m.id !== message.id);
        } else {
          return [...prev, message];
        }
      });
    }
  };

  const handleForwardToAdmin = async () => {
    if (selectedMessages.length > 0 && selectedClient) {
      try {
        const forwardedText = `🔄 Переслано від кліента, чат підтримки:\n\n${selectedMessages
          .map(msg => `${msg.timestamp}: ${msg.text}`)
          .join('\n\n')}`;
        
        await sendBumesMessage(selectedClient, forwardedText);
        
        onSendMessage(
          "Ваше питання передано адміністратору. Найближчим часом адміністратор зателефонує вами.",
          false,
          false
        );

        alert("Messages have been forwarded to admin successfully!");
        setSelectedMessages([]);
      } catch (error) {
        console.error('Error forwarding messages to admin:', error);
        alert("Failed to forward messages to admin. Please try again.");
      }
    }
  };

  // Функция для группировки сообщений по дням
  const groupMessagesByDate = (messages: IChatMessage[]) => {
    const groups: { [key: string]: IChatMessage[] } = {};
    
    messages.forEach(message => {
      const dateKey = formatDateKey(message.timestamp);
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });
    
    return groups;
  };

  // Функция для форматирования полной даты-времени
  const formatFullDateTime = (timestamp: string) => {
    return formatDateTime(timestamp);
  };

  const messageGroups = groupMessagesByDate(messages);

  const getTelegramLink = (id: number) => {
    let project = source === 'ua' ? 'promova' : source === 'pl' ? 'poland' : 'main';
    return `https://t.me/ChatLogoGovorikaBot?start=tg${id}source` + project;
  }

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
        justifyContent="space-between"
        p={2}
        boxShadow={1}
        bgcolor="#ffffff"
        sx={{ position: 'sticky', top: 0, zIndex: 10 }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={backToSidebar} sx={{ color: '#007bff' }}>
            ←
          </IconButton>
          <Typography variant="h6" fontWeight="bold">
            {selectedClientName}
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          {selectedMessages.length > 0 ? (
            <Button
              variant="contained"
              size="small"
              onClick={handleForwardToAdmin}
              sx={{
                textTransform: 'none',
                color: '#fff',
                backgroundColor: '#007bff',
                '&:hover': {
                  backgroundColor: '#0056b3',
                },
              }}
            >
              Forward to Admin ({selectedMessages.length})
            </Button>
          ) : <></>}
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
        {Object.entries(messageGroups).map(([date, messagesInDate]) => (
          <div key={date}>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              sx={{ 
                margin: '20px 0 10px 0',
                position: 'relative'
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: 0,
                  right: 0,
                  height: '1px',
                  backgroundColor: '#e0e0e0',
                  zIndex: 1
                }}
              />
              <Typography 
                variant="body2" 
                sx={{ 
                  backgroundColor: '#f9f9f9',
                  padding: '0 12px',
                  color: '#333',
                  fontWeight: 700,
                  fontSize: '14px',
                  zIndex: 2,
                  position: 'relative'
                }}
              >
                {date}
              </Typography>
            </Box>
            {messagesInDate.map((message, index) => (
              <Box
                key={index}
                display="flex"
                flexDirection={message.sender === 'client' ? 'row' : 'row-reverse'}
                mb={1}
                onClick={() => handleMessageSelect(message)}
                sx={{
                  cursor: message.sender === 'client' ? 'pointer' : 'default',
                  backgroundColor: selectedMessages.some(m => m.id === message.id) ? 'rgba(0, 120, 215, 0.1)' : 'transparent',
                  borderRadius: '12px',
                  padding: '8px',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: message.sender === 'client' ? 'scale(1.02)' : 'none'
                  }
                }}
              >
                <Box
                  bgcolor={
                    message.format === 'text'
                      ? message.sender === 'client'
                        ? '#D0F0C0'
                        : '#0078D7'
                      : '#FFFFFF'
                  }
                  p={1.5}
                  borderRadius="12px"
                  maxWidth="70%"
                  sx={{ color: message.sender === 'client' ? '#333' : '#fff' }}
                  onContextMenu={(e) => {
                    handleContextMenu(e.nativeEvent, message);
                  }}
                >
                  {editingMessage && editingMessage.id === message.id ? (
                    <Box sx={{ minWidth: '250px', maxWidth: '400px' }}>
                      <TextField
                        fullWidth
                        multiline
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        variant="outlined"
                        size="small"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: '#fff',
                            color: '#333',
                            '& fieldset': {
                              borderColor: '#007bff',
                            },
                          },
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSaveEdit();
                          }
                          if (e.key === 'Escape') {
                            handleCancelEdit();
                          }
                        }}
                      />
                      <Box display="flex" gap={1} mt={1} justifyContent="flex-end">
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={handleCancelEdit}
                          sx={{ 
                            fontSize: '0.7rem', 
                            padding: '4px 12px',
                            color: '#fff',
                            borderColor: '#007bff',
                            backgroundColor: '#007bff',
                            '&:hover': {
                              borderColor: '#0056b3',
                              backgroundColor: '#0056b3'
                            }
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={handleSaveEdit}
                          sx={{ 
                            fontSize: '0.7rem', 
                            padding: '4px 12px',
                            backgroundColor: '#007bff',
                            '&:hover': {
                              backgroundColor: '#0056b3'
                            }
                          }}
                        >
                          Save
                        </Button>
                      </Box>
                    </Box>
                  ) : (
                    <>
                      {renderMessageContent(message)}
                      <Typography variant="caption" display="block" textAlign="right" mt={0.5}>
                        {formatFullDateTime(message.timestamp)}
                        {message.sender === 'teacher' && lastTeacherMessage && message.id === lastTeacherMessage.id && (
                          <span style={{ marginLeft: '8px', opacity: 0.7 }}>✏️</span>
                        )}
                      </Typography>
                    </>
                  )}
                </Box>
              </Box>
            ))}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </Box>

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

      {/* Контекстное меню (копирование и редактирование) */}
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
        {contextMenu?.message?.sender === 'teacher' && 
         lastTeacherMessage && 
         contextMenu.message.id === lastTeacherMessage.id && (
          <MenuItem onClick={handleEditMessage}>✏️ edit</MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default MobileChatWindow;
