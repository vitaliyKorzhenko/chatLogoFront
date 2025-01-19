import { useEffect } from 'react';
import socketService from './socketService';

const useSocket = (onMessageHandlers: {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onNewMessage?: (data: any) => void;
  onClientMessages?: (data: any) => void;
  onConfirmConnect?: () => void;
}) => {
  useEffect(() => {
    const socket = socketService.socket;

    if (onMessageHandlers.onConnect) {
      socket.on('connect', onMessageHandlers.onConnect);
    }

    if (onMessageHandlers.onDisconnect) {
      socket.on('disconnect', onMessageHandlers.onDisconnect);
    }

    if (onMessageHandlers.onNewMessage) {
      socket.on('newMessage', onMessageHandlers.onNewMessage);
    }

    if (onMessageHandlers.onClientMessages) {
      socket.on('clientMessages', onMessageHandlers.onClientMessages);
    }

    if (onMessageHandlers.onConfirmConnect) {
        socket.on('confirmConnection', onMessageHandlers.onConfirmConnect)
    }

    return () => {
      socket.off('connect', onMessageHandlers.onConnect);
      socket.off('disconnect', onMessageHandlers.onDisconnect);
      socket.off('newMessage', onMessageHandlers.onNewMessage);
      socket.off('clientMessages', onMessageHandlers.onClientMessages);
      socket.off('confirmConnection', onMessageHandlers.onConfirmConnect);

    };
  }, [onMessageHandlers]);
};

export default useSocket;
