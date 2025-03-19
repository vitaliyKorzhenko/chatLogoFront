const BUMES_URL = 'http://167.172.179.104:4040';

export const syncTeacherWithBumes = async (email: string) => {
  try {
    const formData = new URLSearchParams();
    formData.append("email", email);

    const response = await fetch(`${BUMES_URL}/findTeacherInfoByEmail`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching teacher info:", error);
    return null;
  }
};

export const sendBumesMessage = async (customerId: number, message: string) => {
  try {
    //!!! TODO: remove this after testing  3 - is test customer id Bogdan 10000 - is test customer id for test and redirct to Bogdan 3
    //!!! DELETE THIS AFTER TESTING
    if (customerId == 10000) { 
      customerId = 3;
    }
    const response = await fetch(`http://msg.slideedu.com:4040/customer/${customerId}/message`, {
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
