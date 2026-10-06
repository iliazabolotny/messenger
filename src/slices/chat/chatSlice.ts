import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';
import type { Message, Session } from '../../types';
import {
  deleteNotification,
  receiveNotification,
  sendMessage as apiSendMessage,
} from '../../services/messengerApi';

interface ChatState {
  messages: Message[];
  isConnected: boolean;
  lastSeen: string | null;
  sending: Record<string, boolean>;
}

const initialState: ChatState = {
  messages: [],
  isConnected: false,
  lastSeen: null,
  sending: {},
};

export const pollNotification = createAsyncThunk<
  Message | null,
  Session,
  { rejectValue: string }
>('chat/pollNotification', async (session, { rejectWithValue }) => {
  try {
    const notification = await receiveNotification(session);
    if (!notification?.receiptId || !notification.body) {
      return null;
    }

    const body = notification.body;
    const messageData = body.messageData ?? {};
    const text =
      messageData.textMessageData?.textMessage ||
      messageData.caption ||
      body.textMessage;

    if (notification.receiptId) {
      await deleteNotification(session, notification.receiptId);
    }

    if (!text) {
      return null;
    }

    const sender =
      body.senderData?.senderPhoneNumber ||
      body.senderData?.chatId?.replace('@c.us', '') ||
      '';

    return {
      id: `in_${notification.receiptId}`,
      type: 'incoming',
      text,
      sender,
      timestamp: body.timestamp ?? Date.now(),
    };
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : 'Ошибка получения сообщения',
    );
  }
});

export const sendChatMessage = createAsyncThunk<
  { tempId: string; idMessage: string },
  { session: Session; chatId: string; text: string; tempId: string },
  { rejectValue: { tempId: string; error: string } }
>('chat/sendMessage', async ({ session, chatId, text, tempId }, { rejectWithValue }) => {

  try {
    const result = await apiSendMessage(session, chatId, text);
    if (!result.idMessage) {
      return rejectWithValue({
        tempId,
        error: 'GREEN-API не вернул идентификатор сообщения',
      });
    }
    return { tempId, idMessage: result.idMessage };
  } catch (error) {
    return rejectWithValue({
      tempId,
      error: error instanceof Error ? error.message : 'Ошибка отправки',
    });
  }
});

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    restoreMessages(state, action: PayloadAction<Message[]>) {
      state.messages = action.payload;
    },
    clearMessages(state) {
      state.messages = [];
      state.lastSeen = null;
    },
    setConnected(state, action: PayloadAction<boolean>) {
      state.isConnected = action.payload;
    },
    addOutgoingOptimistic(
      state,
      action: PayloadAction<{ id: string; text: string; timestamp: number }>,
    ) {
      state.messages.push({
        id: action.payload.id,
        type: 'outgoing',
        text: action.payload.text,
        timestamp: action.payload.timestamp,
        status: 'sending',
      });
      state.sending[action.payload.id] = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(pollNotification.fulfilled, (state, action) => {
        if (!action.payload) return;
        if (state.messages.some((message) => message.id === action.payload!.id)) {
          return;
        }
        state.messages.push(action.payload);
        state.lastSeen = new Date().toISOString();
      })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        const message = state.messages.find((item) => item.id === action.payload.tempId);
        if (message) {
          message.id = `out_${action.payload.idMessage}`;
          message.status = 'sent';
        }
        delete state.sending[action.payload.tempId];
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        const tempId = action.payload?.tempId;
        if (!tempId) return;
        const message = state.messages.find((item) => item.id === tempId);
        if (message) {
          message.status = 'error';
        }
        delete state.sending[tempId];
      });
  },
});

export const {
  restoreMessages,
  clearMessages,
  setConnected,
  addOutgoingOptimistic,
} = chatSlice.actions;

export default chatSlice.reducer;
