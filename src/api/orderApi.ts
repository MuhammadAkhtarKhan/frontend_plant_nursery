
import axiosInstance from "./axiosInstance";

export interface CreateOrderItemRequest {
  plantId: string;
  quantity: number;
}

export interface CreatePosOrderRequest {
  paymentMethod: 1 | 2;
  items: CreateOrderItemRequest[];
}

export interface OrderItemResponse {
  id: string;
  plantId: string;
  plantName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderResponse {
  id: string;
  orderNumber: string;
  orderType?: number;
  totalAmount: number;
  paymentMethod: number;
  paymentStatus: number;
  orderStatus: number;
  createdAt?: string;
  items: OrderItemResponse[];
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export async function createPosOrder(
  request: CreatePosOrderRequest,
): Promise<OrderResponse> {
  const response = await axiosInstance.post<ApiResponse<OrderResponse>>(
    "/Order/pos",
    request,
  );

  return response.data.data;
}

export async function getMyOrders(): Promise<OrderResponse[]> {
  const response = await axiosInstance.get<ApiResponse<OrderResponse[]>>(
    "/Order/my",
  );

  return response.data.data;
}

