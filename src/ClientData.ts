// Example clients and messages data for demonstration purposes
export const clients = [
    { id: 1, name: 'John D.', unread: 2 },
    { id: 2, name: 'Jane S.', unread: 1 },
    { id: 3, name: 'Алексей П.', unread: 0 },
    { id: 4, name: 'Maria R.', unread: 3 },
    { id: 5, name: 'Ольга К.', unread: 5 },
    { id: 6, name: 'Michael T.', unread: 1 },
    { id: 7, name: 'Иван С.', unread: 0 },
    { id: 8, name: 'Emily W.', unread: 4 },
    { id: 9, name: 'Сергей Н.', unread: 2 },
    { id: 10, name: 'Anastasia V.', unread: 1 },
  ];
  
  export const messages = [
    { clientId: 1, text: 'Hello, how are you today?', timestamp: '12:01 PM', source: 'telegram', sender: 'client' },
    { clientId: 1, text: 'I am doing well, thanks for asking!', timestamp: '12:03 PM', source: 'whatsapp', sender: 'therapist' },
    { clientId: 1, text: 'I have a few questions.', timestamp: '12:05 PM', source: 'telegram', sender: 'client' },
    { clientId: 2, text: 'Can we schedule a meeting?', timestamp: '11:30 AM', source: 'whatsapp', sender: 'client' },
    { clientId: 3, text: 'Привет, мне нужна помощь.', timestamp: '10:15 AM', source: 'telegram', sender: 'client' },
    { clientId: 3, text: 'Конечно, как я могу помочь?', timestamp: '10:18 AM', source: 'chat', sender: 'therapist' },
    { clientId: 4, text: 'Hi, I am struggling with anxiety.', timestamp: '9:45 AM', source: 'whatsapp', sender: 'client' },
    { clientId: 4, text: `Let's take it step by step. Can you tell me more about it?`, timestamp: '9:47 AM', source: 'chat', sender: 'therapist' },
    { clientId: 5, text: 'Мне нужно обсудить наши предыдущие сессии.', timestamp: '1:20 PM', source: 'telegram', sender: 'client' },
    { clientId: 5, text: 'Давай обсудим. Какой конкретно вопрос тебя беспокоит?', timestamp: '1:25 PM', source: 'chat', sender: 'therapist' },
    { clientId: 6, text: 'Is it possible to reschedule our appointment?', timestamp: '3:00 PM', source: 'whatsapp', sender: 'client' },
    { clientId: 6, text: 'Sure, what time works for you?', timestamp: '3:05 PM', source: 'chat', sender: 'therapist' },
    { clientId: 7, text: 'Добрый день, мне нужно немного времени поговорить.', timestamp: '4:10 PM', source: 'telegram', sender: 'client' },
    { clientId: 8, text: 'Hey, I feel overwhelmed with work.', timestamp: '5:45 PM', source: 'whatsapp', sender: 'client' },
    { clientId: 8, text: `I understand, let's break it down together.`, timestamp: '5:50 PM', source: 'chat', sender: 'therapist' },
    { clientId: 9, text: 'Можно поговорить о моей тревоге?', timestamp: '6:30 PM', source: 'telegram', sender: 'client' },
    { clientId: 9, text: 'Конечно, расскажи подробнее.', timestamp: '6:35 PM', source: 'chat', sender: 'therapist' },
    { clientId: 10, text: 'I have some questions regarding my last session.', timestamp: '7:15 PM', source: 'whatsapp', sender: 'client' },
    { clientId: 10, text: 'I am here to answer. What would you like to know?', timestamp: '7:20 PM', source: 'chat', sender: 'therapist' },
  ];
  