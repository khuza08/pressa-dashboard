// src/services/carouselService.ts
// Service to manage carousel items from the backend API

export interface CarouselItem {
  id: number;
  title: string;
  description: string;
  image: string;
  imageType?: 'url' | 'file'; // Added image type field
  link?: string;
  order: number;
  isActive: boolean;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export const carouselService = {
  // Public methods - for frontend carousel display
  getActiveCarouselItems: async (): Promise<CarouselItem[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/carousels`);
      if (!response.ok) {
        throw new Error(`Failed to fetch carousel items: ${response.status}`);
      }
      const items = await response.json();
      // Ensure all items have proper defaults to prevent undefined values
      const normalizedItems = Array.isArray(items) ? items.map(item => ({
        ...item,
        image: item.image || '',
        imageType: item.imageType || 'url',
        description: item.description || '',
        link: item.link || '',
        category: item.category || '',
      })) : [];
      return normalizedItems;
    } catch (error) {
      console.error('Error fetching carousel items:', error);
      return [];
    }
  },

  getCarouselItemById: async (id: number): Promise<CarouselItem | undefined> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/carousels/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          return undefined;
        }
        throw new Error(`Failed to fetch carousel item: ${response.status}`);
      }
      const item = await response.json();
      // Ensure the item has proper defaults to prevent undefined values
      return {
        ...item,
        image: item.image || '',
        imageType: item.imageType || 'url',
        description: item.description || '',
        link: item.link || '',
        category: item.category || '',
      };
    } catch (error) {
      console.error('Error fetching carousel item:', error);
      return undefined;
    }
  },

  // Methods that replace admin authentication with unauthenticated access
  createCarouselItem: async (item: Omit<CarouselItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<CarouselItem | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/carousels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item)
      });

      if (!response.ok) {
        throw new Error(`Failed to create carousel item: ${response.status}`);
      }

      const createdItem = await response.json();
      // Ensure the created item has proper defaults to prevent undefined values
      return {
        ...createdItem,
        image: createdItem.image || '',
        imageType: createdItem.imageType || 'url',
        description: createdItem.description || '',
        link: createdItem.link || '',
        category: createdItem.category || '',
      };
    } catch (error) {
      console.error('Error creating carousel item:', error);
      return null;
    }
  },

  updateCarouselItem: async (id: number, item: Partial<CarouselItem>): Promise<CarouselItem | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/carousels/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item)
      });

      if (!response.ok) {
        throw new Error(`Failed to update carousel item: ${response.status}`);
      }

      const updatedItem = await response.json();
      // Ensure the updated item has proper defaults to prevent undefined values
      return {
        ...updatedItem,
        image: updatedItem.image || '',
        imageType: updatedItem.imageType || 'url',
        description: updatedItem.description || '',
        link: updatedItem.link || '',
        category: updatedItem.category || '',
      };
    } catch (error) {
      console.error('Error updating carousel item:', error);
      return null;
    }
  },

  deleteCarouselItem: async (id: number): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/carousels/${id}`, {
        method: 'DELETE',
      });

      return response.ok;
    } catch (error) {
      console.error('Error deleting carousel item:', error);
      return false;
    }
  },

  // Method to get all carousel items
  getAllCarouselItems: async (): Promise<CarouselItem[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/carousels`);
      if (!response.ok) {
        throw new Error(`Failed to fetch carousel items: ${response.status}`);
      }
      const items = await response.json();
      // Ensure all items have proper defaults to prevent undefined values
      const normalizedItems = Array.isArray(items) ? items.map(item => ({
        ...item,
        image: item.image || '',
        imageType: item.imageType || 'url',
        description: item.description || '',
        link: item.link || '',
        category: item.category || '',
      })) : [];
      return normalizedItems;
    } catch (error) {
      console.error('Error fetching all carousel items:', error);
      return [];
    }
  }
};