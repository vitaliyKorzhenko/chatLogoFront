import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Checkbox,
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
  console.log('messages now', messages);
  const [newMessage, setNewMessage] = useState('');
  const [sendToEmail, setSendToEmail] = useState(false);

  const handleSendMessage = (message?: string) => {
    const finalMessage = message || newMessage;
    if (finalMessage.trim() && selectedClient !== null) {
      onSendMessage(finalMessage, sendToEmail);
      setNewMessage('');
      setSendToEmail(false); // Reset checkbox after sending
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent default behavior
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

      {/* Chat Messages */}
      <Box
  flexGrow={1}
  p={2}
  overflow="auto"
  className="chat-messages"
  sx={{
    fontSize: { xs: '0.8rem', sm: '1rem' },
    backgroundColor: '#f9f9f9', // Серый с теплым подтоном
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
              bgcolor={message.sender === 'client' ? '#D0F0C0' : '#0078D7'}
              p={1.5}
              borderRadius="12px"
              maxWidth="70%"
              boxShadow="0 2px 4px rgba(0, 0, 0, 0.1)"
            >
              <Typography
                variant="body1"
                sx={{
                  fontSize: '0.95rem',
                  color: message.sender === 'client' ? '#333' : '#ffffff',
                  whiteSpace: 'pre-wrap', // Сохраняем переносы строк
                }}
                
              >
                {message.text}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  marginTop: '4px',
                  color: message.sender === 'client' ? '#666' : '#cfe8ff',
                  textAlign: 'right',
                }}
              >
                {message.timestamp}
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
          sx={{ flexDirection: 'column', gap: 1 }}
        >
          <TextField
            variant="outlined"
            fullWidth
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={getLocalizationText(source, 'enterMessage').toString()}
            multiline
            minRows={2}
            InputProps={{
              sx: { paddingRight: '120px' },
            }}
          />
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <FormControlLabel
              control={
                <Checkbox
                  checked={sendToEmail}
                  onChange={(e) => setSendToEmail(e.target.checked)}
                  color="primary"
                />
              }
              label="Дублювати на email"
              sx={{ marginRight: 'auto', color: '#333' }}
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
        </Box>
      )}
    </Box>
  );
};

export default ChatWindow;
