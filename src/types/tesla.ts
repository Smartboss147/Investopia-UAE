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

export type OrderStatus = 'pending' | 'processing' | 'confirmed' | 'completed' | 'cancelled';

export interface TeslaOrderItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  currency: string;
  thumbnail: string;
}

export interface TeslaOrder {
  id: string;
  userId: string;
  userEmail: string;
  status: OrderStatus;
  currency: string;
  totalAmount: number;
  items: TeslaOrderItem[];
  shippingAddress?: {
    fullName: string;
    address: string;
    city: string;
    country: string;
    phone: string;
  };
  createdAt: string;
  updatedAt: string;
}
