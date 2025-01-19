import { io, Socket } from 'socket.io-client';
import { ioServer } from './apiConfig';

class SocketService {
  private static instance: SocketService;
  public socket: Socket;

  private constructor() {
    this.socket = io(ioServer, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 30000,
    });
  }

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }
}

export default SocketService.getInstance();
