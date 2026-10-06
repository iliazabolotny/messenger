import { configureStore } from '@reduxjs/toolkit';
import sessionReducer from './slices/session/sessionSlice';
import chatReducer from './slices/chat/chatSlice';

export const store = configureStore({
  reducer: {
    session: sessionReducer,
    chat: chatReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
