// src/services/carouselService.ts
// Service to manage carousel items from the backend API

export interface CarouselItem {
  id: number;
  title: string;
  description: string;
  image: string;
  link?: string;
  order: number;
  isActive: boolean;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api/v1';

export const carouselService = {
  // Public methods - for frontend carousel display
  getActiveCarouselItems: async (): Promise<CarouselItem[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/carousels`);
      if (!response.ok) {
        throw new Error(`Failed to fetch carousel items: ${response.status}`);
      }
      const items = await response.json();
      return Array.isArray(items) ? items : [];
    } catch (error) {
      console.error('Error fetching carousel items:', error);
      return [];
    }
  },

  getCarouselItemById: async (id: number): Promise<CarouselItem | undefined> => {
    try {
      const response = await fetch(`${API_BASE_URL}/carousels/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          return undefined;
        }
        throw new Error(`Failed to fetch carousel item: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching carousel item:', error);
      return undefined;
    }
  },

  // Admin methods - require authentication
  createCarouselItem: async (item: Omit<CarouselItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<CarouselItem | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/carousels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Assuming JWT token storage
        },
        body: JSON.stringify(item)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create carousel item: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating carousel item:', error);
      return null;
    }
  },

  updateCarouselItem: async (id: number, item: Partial<CarouselItem>): Promise<CarouselItem | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/carousels/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Assuming JWT token storage
        },
        body: JSON.stringify(item)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update carousel item: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating carousel item:', error);
      return null;
    }
  },

  deleteCarouselItem: async (id: number): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/carousels/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Assuming JWT token storage
        }
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error deleting carousel item:', error);
      return false;
    }
  },

  // Method to get all carousel items (admin access)
  getAllCarouselItems: async (): Promise<CarouselItem[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/carousels`, { // Note: This would typically require admin access
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Assuming JWT token storage
        }
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch carousel items: ${response.status}`);
      }
      const items = await response.json();
      return Array.isArray(items) ? items : [];
    } catch (error) {
      console.error('Error fetching all carousel items:', error);
      return [];
    }
  }
};