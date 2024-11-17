import React, { useState } from 'react';
import { Box } from '@mui/material';
import Sidebar from './SideBar';
import ChatWindow from './ChatWindow';
import './Chat.css';
import { clients, messages } from './ClientData';

//props for chat component
 interface ChatProps {
  email: string;
 }

const Chat = ({ email }: ChatProps) => {
  const [selectedClient, setSelectedClient] = useState<number | null>(1);

  const handleSendMessage = (message: string) => {
    messages.push({
      clientId: selectedClient!,
      text: message,
      timestamp: new Date().toLocaleTimeString(),
      source: 'chat',
      sender: 'therapist',
    });
  };

  return (
    <Box
      display="flex"
      height="100vh"
      width="100vw"
      overflow="hidden"
    >
      <Sidebar email={email} clients={clients} onSelectClient={setSelectedClient} />
      <ChatWindow
        selectedClient={selectedClient}
        clients={clients}
        messages={messages}
        onSendMessage={handleSendMessage}
      />
    </Box>
  );
};

export default Chat;
