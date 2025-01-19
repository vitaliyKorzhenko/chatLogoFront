let isProduction = true;
export const apiUrl = isProduction ? 'http://167.172.179.104:4030/api/' : 'http://127.0.0.1:4030/api/';
export const ioServer = isProduction ? 'https://chatgovorika.chat:4030' : 'http://127.0.0.1:4030';