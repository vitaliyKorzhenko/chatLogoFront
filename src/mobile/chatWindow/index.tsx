import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Button,
  Checkbox,
} from '@mui/material';
import { IChatMessage } from '../../ClientData';

interface ChatWindowProps {
  selectedClient: number | null;
  clients: { id: number; name: string }[];
  messages: IChatMessage[];
  onSendMessage: (message: string, isEmail: boolean) => void;
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
  const [duplicateToEmail, setDuplicateToEmail] = useState(false);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const stickers = ['😊', '👍', '🎉', '❤️', '😂', '😢', '🙌', '🔥', '🎁', '🤔'];

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    onSendMessage(newMessage.trim(), duplicateToEmail);
    setNewMessage('');
  };

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
  
      case 'document':
        return (
          <a href={message.text} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff' }}>
            📄 Завантажити файл від учня
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

  const selectedClientName = clients.find((client) => client.id === selectedClient)?.name || 'Unknown Client';

  return (
    <Box
      display="flex"
      flexDirection="column"
      height="100vh"
      width="100%"
      bgcolor="#f9f9f9"
      overflow="visible" // Явно указываем, чтобы sticky работал

    >
      {/* Header */}
      <Box
        display="flex"
        alignItems="center"
        px={2}
        py={1.5}
        bgcolor="#ffffff"
        boxShadow="0px 1px 3px rgba(0,0,0,0.1)"
        sx={{ position: 'sticky', top: 0, zIndex: 10 }}
        // position="sticky"
        // top={0}
        // zIndex={10}
      >
        <IconButton
          onClick={backToSidebar}
          sx={{
            marginRight: 1,
            color: '#007bff',
            fontSize: '1.75rem',
            fontWeight: 'bold',
            padding: 0.5,
          }}
        >
          ←
        </IconButton>
        <Typography
          variant="h6"
          fontWeight="bold"
          sx={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {selectedClientName}
        </Typography>
      </Box>

      {/* Messages */}
      <Box
        flexGrow={1}
        px={2}
        py={1}
        overflow="auto"
        display="flex"
        flexDirection="column"
        bgcolor="#ffffff"
      >
        {messages.map((message, index) => (
          <Box
            key={index}
            display="flex"
            flexDirection={message.sender === 'client' ? 'row' : 'row-reverse'}
            mb={1}
          >
            <Box
              bgcolor={message.sender === 'client' ? '#D0F0C0' : '#0078D7'}
              p={1.5}
              borderRadius="10px"
              maxWidth="75%"
              sx={{ color: message.sender === 'client' ? '#333' : '#fff' }}
            >
              {renderMessageContent(message)}

              <Typography
                variant="caption"
                display="block"
                textAlign="right"
                mt={0.5}
              >
                {message.timestamp}
              </Typography>
            </Box>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input */}
      <Box
        display="flex"
        flexDirection="column"
        px={2}
        py={1.5}
        boxShadow="0 -1px 3px rgba(0,0,0,0.1)"
        bgcolor="#ffffff"
      >
        <Box display="flex" alignItems="center">
          <IconButton
            onClick={() => setShowStickers(!showStickers)}
            sx={{
              marginRight: 1,
              '&:hover': {
                backgroundColor: '#e0e0e0',
              },
              boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
              color: '#000',
            }}
          >
            😊
          </IconButton>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                handleSendMessage();
                e.preventDefault();
              }
            }}
          />
          <Button
            onClick={handleSendMessage}
            variant="contained"
            color="primary"
            sx={{ marginLeft: 1 }}
          >
            Send
          </Button>
        </Box>
        <Box display="flex" justifyContent="space-between" mt={1}>
          <Typography variant="caption" color="textSecondary">
            {`${newMessage.length}/255`}
          </Typography>
          <Box display="flex" alignItems="center">
            <Typography variant="caption" color="textSecondary">
              Send via Email
            </Typography>
            <Checkbox
              size="small"
              checked={duplicateToEmail}
              onChange={(e) => setDuplicateToEmail(e.target.checked)}
            />
          </Box>
        </Box>
      </Box>

      {/* Stickers */}
      {showStickers && (
        <Box
          display="flex"
          flexWrap="wrap"
          gap={1}
          p={1}
          bgcolor="#f9f9f9"
          boxShadow="0 -1px 3px rgba(0,0,0,0.1)"
        >
          {stickers.map((sticker, index) => (
            <IconButton
              key={index}
              onClick={() => setNewMessage((prev) => prev + sticker)}
              sx={{
                '&:hover': {
                  backgroundColor: '#e0e0e0',
                },
                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
                color: '#000',
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

export default MobileChatWindow;
