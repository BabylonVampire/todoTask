import {
  PayloadAction,
  Reducer,
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import AuthService from "../../http/services/auth.service";
import { Tokens } from "../../types";

interface Credentials {
  email: string;
  password: string;
}

interface AuthSchema {
  isAuth: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthSchema = {
  isAuth: false,
  accessToken: null,
  refreshToken: null,
  loading: false,
  error: null,
};

export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }: Credentials): Promise<Tokens> => {
    const response = await AuthService.login({ email, password });
    return response;
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async ({ email, password }: Credentials): Promise<Tokens> => {
    const response = await AuthService.registration({ email, password });
    return response;
  }
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (): Promise<void> => {
    await AuthService.logout();
  }
);

export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (): Promise<Tokens> => {
    const response = await axios.post<Tokens>(
      `${import.meta.env.VITE_API_URL}/auth/refresh`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("refreshToken")}`,
        },
      }
    );
    return response.data;
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setError(state, action) {
      state.error = action.payload;
    },
    setTokens(state, action: PayloadAction<Tokens>) {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(login.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.isAuth = false;
      state.accessToken = null;
      state.refreshToken = null;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.loading = false;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuth = true;
      localStorage.setItem("accessToken", action.payload.accessToken);
      localStorage.setItem("refreshToken", action.payload.refreshToken);
    });
    builder.addCase(login.rejected, (state, action) => {
      state.loading = false;
      state.error = (action.payload as AxiosError).message;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuth = false;
    });
    builder.addCase(register.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.isAuth = false;
      state.accessToken = null;
      state.refreshToken = null;
    });
    builder.addCase(register.fulfilled, (state, action) => {
      state.loading = false;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuth = true;
      localStorage.setItem("accessToken", action.payload.accessToken);
      localStorage.setItem("refreshToken", action.payload.refreshToken);
    });
    builder.addCase(register.rejected, (state, action) => {
      state.loading = false;
      state.error = (action.payload as AxiosError).message;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuth = false;
    });
    builder.addCase(logout.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.isAuth = false;
    });
    builder.addCase(logout.fulfilled, (state) => {
      state.loading = false;
      state.isAuth = false;
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    });
    builder.addCase(logout.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message ?? null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuth = true;
      localStorage.removeItem("accessToken");
    });
    builder.addCase(checkAuth.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.isAuth = false;
    });
    builder.addCase(checkAuth.fulfilled, (state, action) => {
      state.loading = false;
      state.isAuth = true;
      state.error = null;
      localStorage.setItem("accessToken", action.payload.accessToken);
    });
    builder.addCase(checkAuth.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message ?? null;
      state.isAuth = false;
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    });
  },
});
export const { setError, setTokens } = authSlice.actions;

export const authReducer = authSlice.reducer as Reducer<typeof initialState>;
