import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, Avatar, Badge, IconButton, Divider } from '@mui/material';
import { FiLogOut } from 'react-icons/fi';
import { auth } from './firebaseConfig';

interface SidebarProps {
  clients: { id: number; name: string; unread: number }[];
  onSelectClient: (clientId: number) => void;
  email: string;
}

const Sidebar: React.FC<SidebarProps> = ({ email, clients, onSelectClient }) => {
  return (
    <Box width="300px" bgcolor="#F5F5F5" p={2} boxShadow={3} display="flex" flexDirection="column" height="100vh">
      <Box mb={2} display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#333' }}>
          {email}
        </Typography>
        <IconButton color="primary" size="small">
          <FiLogOut onClick={() => {
            auth.signOut();
          }} />
        </IconButton>
      </Box>
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
              <Badge color="error" badgeContent={client.unread} overlap="circular">
                <Avatar sx={{ bgcolor: '#007bff', color: '#ffffff' }}>{client.name.charAt(0)}</Avatar>
              </Badge>
              <ListItemText primary={client.name} sx={{ ml: 2, color: '#333', fontWeight: '500' }} />
            </ListItem>
            {index < clients.length - 1 && <Divider sx={{ my: 1 }} />}
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};

export default Sidebar;
