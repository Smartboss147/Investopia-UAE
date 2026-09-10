/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TeslaCategory = 'Vehicles' | 'Charging' | 'Accessories' | 'Technology' | 'Lifestyle';
export type ProductAvailability = 'Available' | 'Out of Stock' | 'Coming Soon';

export interface TeslaProduct {
  id: string;
  name: string;
  slug: string;
  category: TeslaCategory;
  description: string;
  price: number;
  currency: string;
  images: string[];
  thumbnail: string;
  availability: ProductAvailability;
  featured: boolean;
  specifications: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = 'pending' | 'processing' | 'confirmed' | 'shipped' | 'customs' | 'out_for_delivery' | 'delivered' | 'completed' | 'cancelled';

export interface TeslaOrderItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  currency: string;
  thumbnail: string;
}

export interface TrackingMilestone {
  stage: string;
  location: string;
  description: string;
  date: string;
  completed: boolean;
  customsFee?: number;
  customsCurrency?: string;
  customsPaid?: boolean;
}

export interface TeslaOrder {
  id: string;
  orderNumber: string;
  userId: string;
  userEmail: string;
  status: OrderStatus;
  currency: string;
  totalAmount: number;
  shippingFee?: number;
  clearanceFee?: number;
  items: TeslaOrderItem[];
  customerInfo: {
    fullName: string;
    email: string;
    phone: string;
  };
  shippingAddress: {
    country: string;
    state: string;
    city: string;
    address: string;
    postalCode: string;
  };
  tracking?: {
    origin: string;
    destination: string;
    startDate: string;
    estimatedDeliveryDate: string;
    carrier: string;
    trackingReference: string;
    milestones: TrackingMilestone[];
  };
  createdAt: string;
  updatedAt: string;
}
