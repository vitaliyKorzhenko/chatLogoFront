let isProduction = true;
export const apiUrl = isProduction ? 'http://159.203.124.0:4030/api/' : 'http://127.0.0.1:4030/api/';
export const ioServer = isProduction ? 'http://159.203.124.0:4030' : 'http://127.0.0.1:4030';