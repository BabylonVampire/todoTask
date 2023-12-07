import api from "..";
import { Tokens } from "../../types";

export default class AuthService {
  static async login({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<Tokens> {
    const response = await api.post<Tokens>("/auth/local/signIn", {
      email,
      password,
    });
    return response.data;
  }

  static async registration({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<Tokens> {
    const response = await api.post<Tokens>("/auth/local/signUp", {
      email,
      password,
    });
    return response.data;
  }

  static async logout(): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>("/auth/logout");
    return response.data;
  }
}
