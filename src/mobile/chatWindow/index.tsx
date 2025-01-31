import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Button,
  Checkbox,
} from '@mui/material';
import { IChatMessage } from '../../ClientData';
import DigitalOceanHelper from '../../digitalOceans';
import { renderMessageContent } from '../../helpers';

interface ChatWindowProps {
  selectedClient: number | null;
  clients: { id: number; name: string }[];
  messages: IChatMessage[];
  onSendMessage: (message: string, isEmail: boolean, isFile: boolean) => void;
  backToSidebar: () => void;
}

const MobileChatWindow: React.FC<ChatWindowProps> = ({
  selectedClient,
  clients,
  messages,
  onSendMessage,
  backToSidebar,
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [showStickers, setShowStickers] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const [duplicateToEmail, setDuplicateToEmail] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);



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
        const uploadedUrl = await DigitalOceanHelper.uploadFileElementToSpaces(selectedFile, 'govorikavideo', 'chatLogo');
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

  return (
    <Box display="flex" flexDirection="column" height="100vh" width="100%" bgcolor="#f9f9f9">
      {/* Header */}
      <Box
        display="flex"
        alignItems="center"
        px={2}
        py={1.5}
        bgcolor="#ffffff"
        boxShadow="0px 1px 3px rgba(0,0,0,0.1)"
        sx={{ position: 'sticky', top: 0, zIndex: 10 }}
      >
        <IconButton onClick={backToSidebar} sx={{ marginRight: 1, color: '#007bff', fontSize: '1.75rem', padding: 0.5 }}>
          ←
        </IconButton>
        <Typography variant="h6" fontWeight="bold" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
      <Box display="flex" flexDirection="column" px={2} py={1.5} boxShadow="0 -1px 3px rgba(0,0,0,0.1)" bgcolor="#ffffff">
        <Box display="flex" alignItems="center">
          <IconButton onClick={() => setShowStickers(!showStickers)} sx={{ marginRight: 1 }}>😊</IconButton>
          <TextField
            fullWidth
            variant="outlined"
            multiline
            maxRows={4}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            sx={{ whiteSpace: 'pre-wrap' }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                //handleSendMessage();
                e.preventDefault();
                setNewMessage((prev) => prev + '\n'); // Добавляем перенос строки
              }
            }}
          />
          <IconButton component="label">
            📎
            <input type="file" hidden onChange={handleFileChange} />
          </IconButton>
          <Button onClick={handleSendMessage} variant="contained" sx={{ marginLeft: 1 }}>
            Send
          </Button>
        </Box>
        <Box display="flex" justifyContent="space-between" mt={1}>
          <Typography variant="caption">{`${newMessage.length}/255`}</Typography>
          <Box display="flex" alignItems="center">
            <Typography variant="caption">Send via Email</Typography>
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
    </Box>
  );
};

export default MobileChatWindow;
