import React, { useEffect } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Divider,
  Badge,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface SidebarProps {
  clients: { id: number; name: string; chatEnabled: boolean }[];
  onSelectClient: (clientId: number) => void;
  unreadMessages: Record<number, number>;
  selectedClient: number | null;
}

const Sidebar: React.FC<SidebarProps> = ({
  clients,
  onSelectClient,
  unreadMessages,
  selectedClient,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    // if (clients.length > 0 && selectedClient === null) {
    //   onSelectClient(clients[0].id);
    // }
  }, [clients, onSelectClient, selectedClient]);

  return (
    <Box
      sx={{
        width: isMobile ? '100%' : '250px',
        height: '100%',
        overflowY: 'auto',
        bgcolor: '#F5F5F5',
        display: 'flex',
        flexDirection: 'column',
        padding: '8px',
      }}
    >
      <List>
        {clients.map((client) => (
          <React.Fragment key={client.id}>
            <ListItem
              onClick={client.chatEnabled ? () => onSelectClient(client.id) : undefined}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: isMobile ? '8px' : '12px',
                borderRadius: '8px',
                backgroundColor: selectedClient === client.id ? '#e3f2fd' : 'inherit',
                '&:hover': client.chatEnabled
                  ? { backgroundColor: '#e3f2fd', cursor: 'pointer' }
                  : undefined,
                opacity: client.chatEnabled ? 1 : 0.5,
              }}
            >
              <Box display="flex" alignItems="center" flexGrow={1}>
                <Avatar
                  sx={{
                    bgcolor: '#007bff',
                    color: '#fff',
                    width: 35,
                    height: 35,
                    fontSize: '0.9rem',
                  }}
                >
                  {client.name.slice(0, 2).toUpperCase()}
                </Avatar>
                <ListItemText
                  primary={client.name}
                  sx={{
                    marginLeft: '10px',
                    color: '#333',
                    fontWeight: '500',
                    fontSize: '0.9rem',
                    whiteSpace: 'nowrap', // Предотвращаем переносы
                    overflow: 'hidden', // Прячем текст, если он слишком длинный
                    textOverflow: 'ellipsis', // Добавляем "..." для длинных имен
                  }}
                />
              </Box>
              {unreadMessages[client.id] > 0 && (
                <Badge
                  badgeContent={unreadMessages[client.id]}
                  color="error"
                  sx={{
                    marginLeft: '8px',
                    '& .MuiBadge-badge': {
                      fontSize: '0.8rem',
                      minWidth: '20px',
                      height: '20px',
                    },
                  }}
                />
              )}
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};

export default Sidebar;
