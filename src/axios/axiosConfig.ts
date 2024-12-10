import axios from 'axios';
import { apiUrl } from '../apiConfig';

const axiosInstance = axios.create({
  baseURL: apiUrl, // url
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'f3744ba48b3ed739c2b27c333f67ba40', // Добавляем API Key
  },
});

export default axiosInstance;
