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
