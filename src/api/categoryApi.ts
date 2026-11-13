
import axiosInstance from "./axiosInstance";
import type { ApiResponse, Category } from "../types/plant";

export async function getCategories(): Promise<Category[]> {
  const response = await axiosInstance.get<ApiResponse<Category[]>>(
    "/Category"
  );

  return response.data.data;
}
