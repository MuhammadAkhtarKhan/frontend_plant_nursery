
export interface PlantImage {
  id: string;
  imageUrl: string;
  isPrimary: boolean;
}

export interface Plant {
  id: string;
  name: string;
  description?: string;
  price: number;
  stockQuantity: number;
  scientificName?: string;
  careInstructions?: string;
  sunlightRequirement?: string;
  wateringFrequency?: string;
  size?: string;
  isActive: boolean;
  categoryId: string;
  categoryName: string;
  images: PlantImage[];
  createdAt: string;
  updatedAt?: string | null;
}

export interface CreatePlantImageRequest {
  imageUrl: string;
  isPrimary: boolean;
}

export interface PlantRequest {
  name: string;
  description?: string | null;
  price: number;
  stockQuantity: number;
  scientificName?: string | null;
  careInstructions?: string | null;
  sunlightRequirement?: string | null;
  wateringFrequency?: string | null;
  size?: string | null;
  categoryId: string;
  images: CreatePlantImageRequest[];
}

export interface Category {
  id: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
