// Sidebar.tsx
import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Avatar,
  IconButton,
  Divider,
  Drawer,
  Badge,
  useMediaQuery,
  Tooltip,
} from '@mui/material';
import { FiLogOut , FiRefreshCcw} from 'react-icons/fi';
import { useTheme } from '@mui/material/styles';
import { auth } from './firebaseConfig';
import { getNewMessageText, newMessageNotification, notActive } from './helpers/languageHelper';

interface SidebarProps {
  clients: { id: number; name: string, chatEnabled: boolean }[];
  onSelectClient: (clientId: number) => void;
  email: string;
  title: string;
  unreadMessages: Record<number, number>;
  selectedClient: number | null; // Новый пропс
  sx?: object;
  totalUnreadMessages: number;
  source: string;
  reloadTeacherInfo: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ email, clients, onSelectClient, title, unreadMessages, selectedClient, totalUnreadMessages, source, reloadTeacherInfo }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    console.log('Selected client:', selectedClient);
    if (clients.length > 0 && selectedClient === null) {
      onSelectClient(clients[0].id);
    }
  }, [clients, onSelectClient, selectedClient]);

  return (
    <Drawer
      variant="permanent"
      open
      sx={{
        width: isMobile ? '70px' : '250px',
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: isMobile ? '70px' : '250px',
          boxSizing: 'border-box',
        },
      }}
    >
      <Box
        bgcolor="#F5F5F5"
        p={1}
        display="flex"
        flexDirection="column"
        height="100vh"
        overflow="hidden"
      >
        <Box mb={2} display="flex" alignItems="center" flexDirection="column">
          {/*/ button for reload clients */}
          <Tooltip title="Reload clients">
            <IconButton
              onClick={reloadTeacherInfo}
              sx={{
                backgroundColor: '#ff3333',
                color: 'white',
                borderRadius: '8px',
                padding: '8px 16px',
                '&:hover': {
                  backgroundColor: '#e60000',
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.2s ease-in-out',
                boxShadow: '0 2px 8px rgba(255,0,0,0.3)',
                margin: '8px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span style={{ fontSize: '1.2em' }}>🔄</span>
              v.1.02 Оновити список
            </IconButton>
          </Tooltip>

          <Typography
            variant="body1"
            sx={{
              fontWeight: 'bold',
              color: '#333',
              fontSize: isMobile ? '0.7rem' : '1rem',
              textAlign: 'center',
            }}
          >
            {email}
          </Typography>
          {/* <Typography
            variant="body2"
            sx={{
              color: '#777',
              fontSize: isMobile ? '0.6rem' : '0.9rem',
              textAlign: 'center',
            }}
          >
            {title}
          </Typography> */}
          <Typography
            variant="body2"
            sx={{
              color: 'red ',
              fontSize: isMobile ? '0.6rem' : '0.9rem',
              textAlign: 'center',

            }}
          >
            {getNewMessageText(source) + ': ' + totalUnreadMessages}
          </Typography>
          <IconButton color="primary" size="small" onClick={async() => {
            //firebae logout
            await auth.signOut();
            
          }}>
            
            <FiLogOut />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Box flexGrow={1} overflow="auto">
          <List>
            {clients.map((client) => (
              <React.Fragment key={client.id}>
                <ListItem
                onClick={() => onSelectClient(client.id)}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: isMobile ? '8px' : '12px',
                    borderRadius: '8px',
                    '&:hover': client.chatEnabled
                    ? { backgroundColor: '#e3f2fd', cursor: 'pointer' }
                    : undefined,
                    // opacity: client.chatEnabled ? 1 : 0.5, // Полупрозрачный для неактивных
                  }}
                >
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ bgcolor: '#007bff', color: '#fff', width: 35, height: 35 }}>
                      {client.name.slice(0, 2).toUpperCase()}
                    </Avatar>
                    
                    <ListItemText
  primary={
    <Box component="span">
      {client.name}{' '}
      {!client.chatEnabled ? (
        <Typography
          component="span"
          sx={{ color: 'red', fontWeight: 'bold', fontSize: '0.85rem' }}
        >
          {notActive(source)}
        </Typography>
      ) : null}
    </Box>
  }
  sx={{
    color: '#333',
    fontWeight: 500,
    fontSize: '0.9rem',
    marginLeft: '10px',
  }}
/>

                  
                  </Box>
                  {unreadMessages[client.id] > 0 && (
                    <Badge badgeContent={unreadMessages[client.id]} color="error" />
                  )}
                </ListItem>
                <Divider sx={{ my: 1 }} />
              </React.Fragment>
            ))}
          </List>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
