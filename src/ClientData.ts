  export interface IChatMessage {
    clientId: number;
    text: string;
    timestamp: string;
    source: string;
    sender: string
    id: number;
  }


  export interface IServerMessage {
    id: number;
    sender: string;
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