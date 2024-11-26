import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, Avatar, Badge, IconButton, Divider, Drawer, useMediaQuery } from '@mui/material';
import { FiLogOut } from 'react-icons/fi';
import { auth } from './firebaseConfig';
import { useTheme } from '@mui/material/styles';

interface SidebarProps {
  clients: { id: number; name: string; unread: number }[];
  onSelectClient: (clientId: number) => void;
  email: string;
}

const Sidebar: React.FC<SidebarProps> = ({ email, clients, onSelectClient }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Drawer
      variant="permanent"
      open
      sx={{
        width: isMobile ? '80px' : '300px',
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: isMobile ? '80px' : '300px',
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
        <Box mb={2} display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap">
          <Typography
            variant="body1"
            sx={{
              fontWeight: 'bold',
              color: '#333',
              fontSize: isMobile ? '0.75rem' : '1rem',
              flexBasis: isMobile ? '100%' : 'auto',
              textAlign: isMobile ? 'center' : 'left'
            }}
          >
            {email}
          </Typography>
          <IconButton color="primary" size="small" sx={{ ml: isMobile ? 'auto' : 0 }}>
            <FiLogOut onClick={() => {
              auth.signOut();
            }} />
          </IconButton>
        </Box>
        <Box flexGrow={1} overflow="auto">
          <List>
            {clients.map((client, index) => (
              <React.Fragment key={client.id}>
                <ListItem
                  component="div"
                  onClick={() => onSelectClient(client.id)}
                  sx={{
                    borderRadius: '8px',
                    '&:hover': { backgroundColor: '#e3f2fd', cursor: 'pointer' },
                    padding: '10px',
                    transition: 'background-color 0.3s ease',
                  }}
                >
                  {!isMobile && (
                    <Badge color="error" badgeContent={client.unread} overlap="circular">
                      <Avatar sx={{ bgcolor: '#007bff', color: '#ffffff', width: 40, height: 40 }}>{client.name.charAt(0)}</Avatar>
                    </Badge>
                  )}
                  <ListItemText primary={client.name} sx={{ ml: isMobile ? 0 : 2, color: '#333', fontWeight: '500', fontSize: isMobile ? '0.75rem' : '1rem' }} />
                </ListItem>
                {index < clients.length - 1 && <Divider sx={{ my: 1 }} />}
              </React.Fragment>
            ))}
          </List>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
