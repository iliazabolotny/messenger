import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Session } from '../../types';

const STORAGE_KEY = 'max_chat_session';

function loadSession(): Session | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? (JSON.parse(saved) as Session) : null;
  } catch {
    return null;
  }
}

interface SessionState {
  data: Session | null;
}

const initialState: SessionState = {
  data: loadSession(),
};

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    login(state, action: PayloadAction<Session>) {
      state.data = action.payload;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(action.payload));
    },
    logout(state) {
      state.data = null;
      localStorage.removeItem(STORAGE_KEY);
    },
  },
});

export const { login, logout } = sessionSlice.actions;
export default sessionSlice.reducer;
