// src/types/product.ts

export interface ProductImage {
  url: string;
  alt: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  icon: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  images?: ProductImage[];
  rating: number;
  totalSold: string;
  store: string;
  description?: string;
  category?: string;
  variants?: ProductVariant[];
  stock: number;
  condition?: string;
  minOrder: number;
  features?: string[];
  createdAt: Date;
  updatedAt: Date;
}