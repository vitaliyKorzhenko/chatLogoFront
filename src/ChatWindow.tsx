import React, { useState } from 'react';
import { Box, Typography, IconButton, TextField, Button } from '@mui/material';
import { FaPhoneAlt, FaTelegramPlane, FaWhatsapp } from 'react-icons/fa';

interface ChatWindowProps {
  selectedClient: number | null;
  clients: { id: number; name: string }[];
  messages: {
    clientId: number;
    text: string;
    timestamp: string;
    source: string;
    sender: string;
  }[];
  onSendMessage: (message: string) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ selectedClient, clients, messages, onSendMessage }) => {
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedClient !== null) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  return (
    <Box flexGrow={1} display="flex" flexDirection="column" bgcolor="#f0f2f5" height="100vh">
      {/* Chat Header */}
      {selectedClient && (
        <Box display="flex" alignItems="center" p={2} boxShadow={1} bgcolor="#ffffff">
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold', color: '#333' }}>
            Chat with {clients.find((c) => c.id === selectedClient)?.name}
          </Typography>
          <IconButton color="primary" sx={{ ml: 1 }}>
            <FaPhoneAlt />
          </IconButton>
        </Box>
      )}

      {/* Chat Messages */}
      <Box flexGrow={1} p={2} overflow="auto" className="chat-messages">
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
                  {/* Show message source icon for client messages */}
                  {message.sender === 'client' && (message.source === 'telegram' ? (
                    <FaTelegramPlane color="#0088cc" style={{ marginRight: '8px' }} />
                  ) : (
                    <FaWhatsapp color="#25d366" style={{ marginRight: '8px' }} />
                  ))}
                  <Box
                    bgcolor={message.sender === 'client' ? '#f1f1f1' : '#dcf8c6'}
                    p={1.5}
                    borderRadius="12px"
                    maxWidth="70%"
                  >
                    <Typography variant="body1" sx={{ fontSize: '0.95rem', color: '#333' }}>
                      {message.text}
                    </Typography>
                    <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.75rem' }}>
                      {message.timestamp}
                    </Typography>
                  </Box>
                </Box>
              ))}
          </Box>
        ) : (
          <Typography variant="body1" color="textSecondary" align="center">
            Select a client to start chatting
          </Typography>
        )}
      </Box>

      {/* Message Input */}
      {selectedClient && (
        <Box display="flex" p={2} bgcolor="#ffffff" boxShadow={2}>
          <TextField
            variant="outlined"
            fullWidth
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            InputProps={{
              style: {
                borderRadius: '8px',
                backgroundColor: '#f9f9f9',
              },
            }}
          />
          <Button
            variant="contained"
            onClick={handleSendMessage}
            sx={{ ml: 2, backgroundColor: '#0088cc', color: '#ffffff', borderRadius: '8px', fontWeight: 'bold', textTransform: 'none' }}
          >
            Send
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default ChatWindow;
