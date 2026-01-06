
export enum ReservationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED'
}

export interface Product {
  sku: string;
  name: string;
  price: number;
  stock: number;
  imageUrl: string;
  description: string;
}

export interface Reservation {
  id: string;
  sku: string;
  userId: string;
  quantity: number;
  expiresAt: number;
  status: ReservationStatus;
  createdAt: number;
}

export interface InventoryStats {
  sku: string;
  available: number;
  reserved: number;
  sold: number;
}

export interface AIInsight {
  sku: string;
  recommendation: string;
  riskLevel: 'low' | 'medium' | 'high';
}
