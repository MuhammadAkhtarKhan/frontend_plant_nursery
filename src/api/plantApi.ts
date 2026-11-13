
import axiosInstance from "./axiosInstance";
import type {
  ApiResponse,
  Plant,
  PlantRequest,
} from "../types/plant";

// Get all plants
export async function getPlants(): Promise<Plant[]> {
  const response = await axiosInstance.get<ApiResponse<Plant[]>>("/Plant");
  return response.data.data;
}

// Get plant by ID
export async function getPlantById(id: string): Promise<Plant> {
  const response = await axiosInstance.get<ApiResponse<Plant>>(
    `/Plant/${id}`
  );

  return response.data.data;
}

// Create plant
export async function createPlant(
  request: PlantRequest
): Promise<Plant> {
  const response = await axiosInstance.post<ApiResponse<Plant>>(
    "/Plant",
    request
  );

  return response.data.data;
}

// Update plant
export async function updatePlant(
  id: string,
  request: PlantRequest
): Promise<Plant> {
  const response = await axiosInstance.put<ApiResponse<Plant>>(
    `/Plant/${id}`,
    request
  );

  return response.data.data;
}

// Deactivate plant
export async function deactivatePlant(id: string): Promise<void> {
  await axiosInstance.delete(`/Plant/${id}`);
}
