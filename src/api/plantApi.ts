import axiosInstance from "./axiosInstance";
import type { ApiResponse, Plant } from "../types/plant";

export async function getPlants(): Promise<Plant[]> {
  const response = await axiosInstance.get<ApiResponse<Plant[]>>("/Plant");
  return response.data.data;
}