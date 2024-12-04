  export interface IChatMessage {
    clientId: number;
    text: string;
    timestamp: string;
    source: string;
    sender: string
    id: number;
  }
  
 
  // First message: {
  //   id: 249,
  //   teacherId: 1346,
  //   orderNumber: 1,
  //   customerId: '3434',
  //   messageType: 'tg',
  //   attachemnt: '',
  //   isActive: true,
  //   serverDate: 2024-12-03T20:12:20.516Z,
  //   additionalInfo: { alfaChatId: 3399, tgChatId: '444944005' },
  //   source: 'ua',
  //   inBound: true,
  //   serverId: '228612',
  //   messageText: 'Ми з четверга 28.11 перенесли на суботу 30.11',
  //   createdAt: 2024-12-03T20:12:20.517Z,
  //   updatedAt: 2024-12-03T20:12:20.517Z
  // }

  export interface IServerMessage {
    id: number;
    teacherId: number;
    orderNumber: number;
    customerId: string;
    messageType: string;
    attachemnt: string;
    isActive: boolean;
    serverDate: string;
    additionalInfo: { alfaChatId: number; tgChatId: string };
    source: string;
    inBound: boolean;
    serverId: string;
    messageText: string;
    createdAt: string;
    updatedAt: string;
  }