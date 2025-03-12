let isProduction = true;
export const apiUrl = isProduction ? 'https://msg.slideedu.com:4000/api/' : 'http://127.0.0.1:4000/api/';
export const ioServer = isProduction ? 'wss://msg.slideedu.com:4000' : 'http://127.0.0.1:4000';