
export interface PlantImage {
  id: string;
  imageUrl: string;
  isPrimary: boolean;
}

export interface Plant {
  id: string;
  name: string;
  categoryName: string;
  price: number;
  stockQuantity: number;
  description?: string;
  images: PlantImage[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
