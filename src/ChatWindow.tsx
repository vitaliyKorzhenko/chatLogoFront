import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Checkbox,
  InputAdornment,
  FormControlLabel,
} from '@mui/material';
import { getLocalizationText } from './localization';
import { IChatMessage } from './ClientData';

interface ChatWindowProps {
  source: 'ua' | 'main' | 'pl';
  selectedClient: number | null;
  clients: { id: number; name: string }[];
  messages: IChatMessage[];
  onSendMessage: (message: string, sendToEmail: boolean) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  source,
  selectedClient,
  clients,
  messages,
  onSendMessage,
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [sendToEmail, setSendToEmail] = useState(false);

  const templates = getLocalizationText(source, 'templates') as string[];

  const handleSendMessage = (message?: string) => {
    const finalMessage = message || newMessage;
    if (finalMessage.trim() && selectedClient !== null) {
      onSendMessage(finalMessage, sendToEmail);
      setNewMessage('');
      setSendToEmail(false); // Сбрасываем чекбокс после отправки
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Предотвращаем стандартное поведение
      handleSendMessage();
    }
  };

  return (
    <Box flexGrow={1} display="flex" flexDirection="column" bgcolor="#f0f2f5" height="100vh">
      {/* Chat Header */}
      {selectedClient && (
        <Box
          display="flex"
          alignItems="center"
          p={2}
          boxShadow={1}
          bgcolor="#ffffff"
          sx={{
            flexDirection: { xs: 'column', sm: 'row' },
            textAlign: { xs: 'center', sm: 'left' },
          }}
        >
          <Typography
            variant="h6"
            sx={{
              flexGrow: 1,
              fontWeight: 'bold',
              color: '#333',
              fontSize: { xs: '1rem', sm: '1.25rem' },
            }}
          >
            {clients.find((c) => c.id === selectedClient)?.name}
          </Typography>
        </Box>
      )}

      {/* Chat Templates */}
      {selectedClient && (
        <Box
          display="flex"
          flexWrap="wrap"
          gap={1}
          p={2}
          bgcolor="#e0e0e0"
          borderBottom="1px solid #ccc"
        >
          {templates.map((template, index) => (
            <Button
              key={index}
              variant="outlined"
              size="small"
              onClick={() => handleSendMessage(template)}
              sx={{
                textTransform: 'none',
                fontSize: '0.9rem',
                borderRadius: '8px',
              }}
            >
              {template}
            </Button>
          ))}
        </Box>
      )}

      {/* Chat Messages */}
      <Box
        flexGrow={1}
        p={2}
        overflow="auto"
        className="chat-messages"
        sx={{
          fontSize: { xs: '0.8rem', sm: '1rem' },
        }}
      >
        {selectedClient ? (
          <Box>
            {messages
              .filter((msg) => msg.clientId === selectedClient)
              .map((message, index) => (
                <Box
                  key={index}
                  mb={2}
                  display="flex"
                  flexDirection={message.sender === 'client' ? 'row' : 'row-reverse'}
                  alignItems="center"
                >
                  <Box
                    bgcolor={message.sender === 'client' ? '#f1f1f1' : '#dcf8c6'}
                    p={1.5}
                    borderRadius="12px"
                    maxWidth="70%"
                  >
                    <Typography variant="body1" sx={{ fontSize: '0.95rem', color: '#333' }}>
                      {message.text}
                    </Typography>
                  </Box>
                </Box>
              ))}
          </Box>
        ) : (
          <Typography variant="body1" color="textSecondary" align="center">
            {getLocalizationText(source, 'loading')}
          </Typography>
        )}
      </Box>

      {/* Message Input */}
      {selectedClient && (
        <Box
          display="flex"
          p={2}
          bgcolor="#ffffff"
          boxShadow={2}
          sx={{
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 1, sm: 2 },
          }}
        >
          <TextField
            variant="outlined"
            fullWidth
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={getLocalizationText(source, 'enterMessage').toString()}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Typography sx={{ color: '#0088cc', fontWeight: 'bold', mr: 1 }}>Email</Typography>
                  <Checkbox
                    checked={sendToEmail}
                    onChange={(e) => setSendToEmail(e.target.checked)}
                    color="primary"
                  />
                </InputAdornment>
              ),
            }}
            sx={{
              mb: { xs: 1, sm: 0 },
            }}
          />
          <Button
            variant="contained"
            onClick={() => handleSendMessage()}
            sx={{
              backgroundColor: '#0088cc',
              color: '#ffffff',
              borderRadius: '8px',
              fontWeight: 'bold',
              textTransform: 'none',
            }}
          >
            {getLocalizationText(source, 'send')}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default ChatWindow;
