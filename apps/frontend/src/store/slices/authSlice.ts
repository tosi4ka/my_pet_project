import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type User = {
  id: string;
  name?: string;
  email?: string;
  role?: string;
};

type AuthState = {
  user: User | null;
  token?: string | null;
};

const initialState: AuthState = {
  user:
    typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('user') || 'null')
      : null,
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
};

const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
    },
    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
    },
    clearAuth(state) {
      state.user = null;
      state.token = null;
      try {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      } catch (e) {}
    },
  },
});

export const { setUser, clearAuth, setToken } = slice.actions;
export default slice.reducer;
