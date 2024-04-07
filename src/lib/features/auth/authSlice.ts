import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store";
import _ from "lodash";
import AppUser from "../../../models/user";

export type AuthStateType =
  | "anonymous"
  | "authenticated"
  | "unauthenticated"
  | "registration_required";

export interface AuthState {
  user: AppUser | null;
  isAdmin: boolean;
  state: AuthStateType;
  loading: boolean;
  error: string | null;
}

export const initialState: AuthState = {
  user: null,
  isAdmin: false,
  state: "unauthenticated",
  loading: true,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (
      state,
      action: PayloadAction<(AppUser & { state?: AuthStateType }) | null>,
    ) => {
      state.loading = false;
      if (!action.payload) {
        state.user = null;
        state.state = "unauthenticated";
        return;
      }
      const { state: authState, ...user } = action.payload;
      if (user && !_.isEqual(state.user, user)) {
        state.user = user;
      }
      state.isAdmin = action.payload?.role === "admin";
      state.state = action.payload.state ?? "authenticated";
    },
    setError: (state, action: PayloadAction<string | null>) => {
      console.error(action.payload);
      state.error = action.payload;
      state.loading = false;
    },
    clearUser: state => {
      state.user = null;
      state.state = "unauthenticated";
    },
  },
});

export const { setUser, setError, clearUser } = authSlice.actions;

export const selectAuth = (state: RootState): AuthState => state.auth;

export default authSlice.reducer;