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
  Typography,
  Tooltip,
  IconButton,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { notActive } from '../../helpers/languageHelper';
import { FiLogOut , FiRefreshCcw} from 'react-icons/fi';


interface SidebarProps {
  clients: { id: number; name: string; chatEnabled: boolean }[];
  onSelectClient: (clientId: number) => void;
  unreadMessages: Record<number, number>;
  selectedClient: number | null;
  source: string;
  reloadTeacherInfo: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  clients,
  onSelectClient,
  unreadMessages,
  selectedClient,
  source,
  reloadTeacherInfo
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
         <Tooltip title="Reload clients">
            <IconButton
              onClick={async () => {
                await reloadTeacherInfo();
              }}
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
             v.1.1 Оновити список
            </IconButton>
          </Tooltip>

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
    backgroundColor: selectedClient === client.id ? '#e3f2fd' : 'inherit',
    '&:hover': client.chatEnabled
      ? { backgroundColor: '#e3f2fd', cursor: 'pointer' }
      : undefined,
    //opacity: client.chatEnabled ? 1 : 0.5,
  }}
>
  <Box
    display="flex"
    alignItems="center"
    sx={{
      flexGrow: 1,
      overflow: 'hidden',
    }}
  >
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
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        flexGrow: 1,
        marginLeft: '10px',
        overflow: 'hidden',
      }}
    >
      <ListItemText
        primary={
          <Box component="span" display="flex" alignItems="center">
            {client.name}
            {unreadMessages[client.id] > 0 && (
           <Typography
           component="span"
           sx={{
             color: '#fff', // Белый текст
             backgroundColor: 'red', // Красный фон
             fontWeight: 'bold',
             fontSize: '0.9rem',
             marginLeft: '8px',
             padding: '2px 6px', // Добавляем внутренние отступы
             borderRadius: '12px', // Делаем скругление для круга
             display: 'inline-flex',
             minWidth: '20px', // Минимальная ширина для ровного круга
             justifyContent: 'center',
             alignItems: 'center',
           }}
         >
           {"+" + unreadMessages[client.id]}
         </Typography>
         
            )}
            {!client.chatEnabled && (
              <Typography
                component="span"
                sx={{
                  color: 'red',
                  fontWeight: 'bold',
                  fontSize: '0.85rem',
                  marginLeft: '6px',
                }}
              >
                {notActive(source)}
              </Typography>
            )}
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
  </Box>
</ListItem>


            <Divider />
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};

export default Sidebar;
