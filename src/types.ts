export interface Session {
  idInstance: string;
  apiTokenInstance: string;
  phone: string;
  baseUrl: string;
  accountData?: unknown;
}

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'error';

export interface Message {
  id: string;
  type: 'incoming' | 'outgoing';
  text: string;
  sender?: string;
  timestamp: number;
  status?: MessageStatus;
}

export interface GreenApiNotification {
  receiptId: number | string;
  body: {
    messageData?: {
      typeMessage?: string;
      textMessageData?: {
        textMessage?: string;
      };
      caption?: string;
    };
    textMessage?: string;
    timestamp?: number;
    senderData?: {
      senderPhoneNumber?: string;
      chatId?: string;
    };
  };
}
