import axiosInstance from './axiosConfig';

export const fetchData = async () => {
  try {
    const response = await axiosInstance.get('/data');
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

export const teacherInfo = async (email: string, source: string) => {
  console.error('teacherInfo', email, source);
  try {
    const response = await axiosInstance.post('/teacher/info', {email: email, source: source});
    console.log('Response: teacher info', response.data);
    return response.data;
  } catch (error) {
    console.error('Error posting data:', error);
    throw error;
  }
};

//check email 
// /teacher/email

export const checkEmail = async (email: string, source: string) => {
  try {
    const response = await axiosInstance.post('/teacher/email', {email: email, source: source});
    console.log('Response: check email', response.data);
    return response.data;
  } catch (error) {
    console.error('Error posting data:', error);
    throw error;
  }
};
