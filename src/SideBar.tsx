import React from 'react';
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
  useMediaQuery 
} from '@mui/material';
import { FiLogOut } from 'react-icons/fi';
import { auth } from './firebaseConfig';
import { useTheme } from '@mui/material/styles';

interface SidebarProps {
  clients: { id: number; name: string }[];
  onSelectClient: (clientId: number) => void;
  email: string;
  title: string;
  unreadMessages: Record<number, number>;
}

const Sidebar: React.FC<SidebarProps> = ({ email, clients, onSelectClient, title, unreadMessages }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Drawer
      variant="permanent"
      open
      sx={{
        width: isMobile ? '80px' : '250px',
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: isMobile ? '80px' : '250px',
          boxSizing: 'border-box',
        },
      }}
    >
      <Box
        bgcolor="#F5F5F5"
        p={1}
        boxShadow={3}
        display="flex"
        flexDirection="column"
        height="100vh"
        overflow="hidden"
      >
        {/* Email and Title Header */}
        <Box mb={2} display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap">
          <Typography
            variant="body1"
            sx={{
              fontWeight: 'bold',
              color: '#333',
              fontSize: isMobile ? '0.6rem' : '0.9rem',
              flexBasis: isMobile ? '100%' : 'auto',
              textAlign: isMobile ? 'center' : 'left',
              mb: isMobile ? 1 : 0,
              wordWrap: 'break-word',
            }}
          >
            {email}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: '#777',
              fontSize: isMobile ? '0.55rem' : '0.8rem',
              textAlign: isMobile ? 'center' : 'left',
              wordWrap: 'break-word',
            }}
          >
            {title}
          </Typography>
          <IconButton color="primary" size="small" sx={{ ml: isMobile ? 'auto' : 0 }}>
            <FiLogOut
              onClick={() => {
                auth.signOut();
              }}
            />
          </IconButton>
        </Box>
        <Divider sx={{ mb: 2 }} />
        {/* Clients List */}
        <Box flexGrow={1} overflow="auto">
          <List>
            {clients.map((client) => (
              <React.Fragment key={client.id}>
                <ListItem
                  component="div"
                  onClick={() => onSelectClient(client.id)}
                  sx={{
                    borderRadius: '8px',
                    '&:hover': { backgroundColor: '#e3f2fd', cursor: 'pointer' },
                    padding: isMobile ? '8px' : '12px',
                    transition: 'background-color 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ bgcolor: '#007bff', color: '#ffffff', width: 35, height: 35, mr: isMobile ? 0 : 1.5 }}>
                      {isMobile ? client.name.slice(0, 2).toUpperCase() : client.name.charAt(0).toUpperCase()}
                    </Avatar>
                    {!isMobile && (
                      <ListItemText
                        primary={client.name}
                        sx={{
                          color: '#333',
                          fontWeight: '500',
                          fontSize: isMobile ? '0.6rem' : '0.9rem',
                          textAlign: isMobile ? 'center' : 'left',
                          wordWrap: 'break-word',
                        }}
                      />
                    )}
                  </Box>
                  {unreadMessages[client.id] > 0 && (
                    <Badge
                      badgeContent={unreadMessages[client.id]}
                      color="error"
                      sx={{ ml: 2 }}
                    />
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
