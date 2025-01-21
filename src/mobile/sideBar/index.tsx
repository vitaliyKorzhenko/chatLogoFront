import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Badge,
  IconButton,
  Divider,
} from '@mui/material';
import { FiLogOut } from 'react-icons/fi';
import { auth } from '../../firebaseConfig';

interface SidebarProps {
  clients: { id: number; name: string; chatEnabled: boolean }[];
  onSelectClient: (clientId: number) => void;
  email: string;
  title: string;
  unreadMessages: Record<number, number>;
  selectedClient: number | null;
}

const MobileSidebar: React.FC<SidebarProps> = ({
  email,
  clients,
  onSelectClient,
  title,
  unreadMessages,
  selectedClient,
}) => {
  useEffect(() => {
    // if (clients.length > 0 && selectedClient === null) {
    //   onSelectClient(clients[0].id);
    // }
  }, [clients, onSelectClient, selectedClient]);

  return (
    <Box
      bgcolor="#F5F5F5"
      height="100vh"
      display="flex"
      flexDirection="column"
      overflow="hidden"
    >
      {/* Верхняя панель */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        px={2}
        py={1.5}
        bgcolor="#ffffff"
        boxShadow="0px 1px 3px rgba(0,0,0,0.1)"
      >
        <Box>
          <Typography
            variant="body1"
            sx={{
              fontWeight: 'bold',
              color: '#333',
              fontSize: '1rem',
            }}
          >
            {email}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: '#777',
              fontSize: '0.85rem',
            }}
          >
            {title}
          </Typography>
        </Box>
        <IconButton
          color="primary"
          size="medium"
          onClick={async () => {
            await auth.signOut();
          }}
        >
          <FiLogOut />
        </IconButton>
      </Box>

      {/* Список контактов */}
      <Box flexGrow={1} overflow="auto">
        <List>
          {clients.map((client) => (
            <React.Fragment key={client.id}>
              <ListItem
                onClick={client.chatEnabled ? () => onSelectClient(client.id) : undefined}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  padding: '10px 15px',
                  '&:hover': client.chatEnabled
                    ? { backgroundColor: '#e3f2fd', cursor: 'pointer' }
                    : undefined,
                  backgroundColor:
                    selectedClient === client.id ? '#e3f2fd' : 'inherit',
                  opacity: client.chatEnabled ? 1 : 0.5, // Полупрозрачный для неактивных
                }}
              >
                <Box display="flex" alignItems="center">
                  <Badge
                    badgeContent={unreadMessages[client.id]}
                    color="error"
                    sx={{
                      marginRight: '10px',
                      '& .MuiBadge-badge': {
                        fontSize: '0.75rem',
                      },
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: '#007bff',
                        color: '#fff',
                        width: 45,
                        height: 45,
                        fontSize: '1rem',
                      }}
                    >
                      {client.name.slice(0, 2).toUpperCase()}
                    </Avatar>
                  </Badge>
                  <ListItemText
                    primary={client.name}
                    sx={{
                      color: '#333',
                      fontWeight: '500',
                      marginLeft: '10px',
                      fontSize: '0.9rem',
                    }}
                  />
                </Box>
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      </Box>
    </Box>
  );
};

export default MobileSidebar;
