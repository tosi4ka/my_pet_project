import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type User = {
  id: string;
  name?: string;
  email?: string;
  role?: string;
};

type AuthState = {
  user: User | null;
  loading: boolean;
};

const initialState: AuthState = {
  user: null,
  loading: false,
};

const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User | null>) {
      state.user = action.payload;
      state.loading = false;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    clearUser(state) {
      state.user = null;
      state.loading = false;
    },
  },
});

export const { setUser, clearUser, setLoading } = slice.actions;
export default slice.reducer;
