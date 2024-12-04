import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://159.203.124.0:4030/api/', // url
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'f3744ba48b3ed739c2b27c333f67ba40', // Добавляем API Key
  },
});

export default axiosInstance;
