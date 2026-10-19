
import axiosInstance from "./axiosInstance";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export async function login(request: LoginRequest): Promise<AuthResponse> {
  const response = await axiosInstance.post<ApiResponse<AuthResponse>>(
    "/Auth/login",
    request
  );

  return response.data.data;
}
