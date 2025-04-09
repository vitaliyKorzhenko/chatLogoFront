//const BUMES_URL = 'http://167.172.179.104:4040';

const BUMES_URL = 'https://msg.slideedu.com/bumes';


export const sendBumesMessage = async (customerId: number, message: string) => {
  try {
    //!!! TODO: remove this after testing  3 - is test customer id Bogdan 10000 - is test customer id for test and redirct to Bogdan 3
    //!!! DELETE THIS AFTER TESTING
    if (customerId == 10000) { 
      customerId = 3;
    }
    const response = await fetch(`${BUMES_URL}/customer/${customerId}/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message })
    });
    
    return response.json();
  } catch (error) {
    console.error('Error sending bumes message:', error);
    throw error;
  }
};

// Новый метод синхронизации
export const syncBumesTeacher = async (teacherId: number) => {
  try {
    const response = await fetch(`${BUMES_URL}/sync/${teacherId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('Response: sync teacher', response);
    
    if (!response.ok) {
      throw new Error(`Sync failed: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error syncing teacher:', error);
    throw error;
  }
};
