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

export const teacherInfo = async (email: string) => {
  try {
    const response = await axiosInstance.post('/teacher/info', {email: email});
    console.log('Response: teacher info', response.data);
    return response.data;
  } catch (error) {
    console.error('Error posting data:', error);
    throw error;
  }
};

//check email 
// /teacher/email

export const checkEmail = async (email: string) => {
  try {
    const response = await axiosInstance.post('/teacher/email', {email: email});
    console.log('Response: check email', response.data);
    return response.data;
  } catch (error) {
    console.error('Error posting data:', error);
    throw error;
  }
};
