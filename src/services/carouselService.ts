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

  // Methods for admin operations with authentication
  createCarouselItem: async (item: Omit<CarouselItem, 'id' | 'createdAt' | 'updatedAt'>, file: File | null): Promise<CarouselItem | null> => {
    try {
      const formData = new FormData();

      // Add all the form fields
      formData.append('title', item.title);
      formData.append('description', item.description || '');
      formData.append('link', item.link || '');
      formData.append('order', String(item.order || 0));
      formData.append('is_active', String(item.isActive));
      formData.append('category', item.category || '');

      // Add the image file if provided
      if (file) {
        formData.append('image', file, file.name);
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/carousels`, {
        method: 'POST',
        credentials: 'include', // Include JWT cookie for authentication
        body: formData
      });

      if (!response.ok) {
        if (response.status === 401) {
          // If unauthorized, redirect to login
          window.location.href = '/auth';
          return null;
        }
        throw new Error(`Failed to create carousel item: ${response.status}`);
      }

      const createdItem = await response.json();
      // Ensure the created item has proper defaults to prevent undefined values
      return {
        ...createdItem,
        image: createdItem.image || '',
        description: createdItem.description || '',
        link: createdItem.link || '',
        category: createdItem.category || '',
      };
    } catch (error) {
      console.error('Error creating carousel item:', error);
      return null;
    }
  },

  updateCarouselItem: async (id: number, item: Partial<CarouselItem>, file: File | null): Promise<CarouselItem | null> => {
    try {
      const formData = new FormData();

      // Add all the form fields
      if (item.title !== undefined) formData.append('title', item.title);
      if (item.description !== undefined) formData.append('description', item.description);
      if (item.link !== undefined) formData.append('link', item.link);
      if (item.order !== undefined) formData.append('order', String(item.order));
      if (item.isActive !== undefined) formData.append('is_active', String(item.isActive));
      if (item.category !== undefined) formData.append('category', item.category);

      // Add the image file if provided
      if (file) {
        formData.append('image', file, file.name);
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/carousels/${id}`, {
        method: 'PUT',
        credentials: 'include', // Include JWT cookie for authentication
        body: formData
      });

      if (!response.ok) {
        if (response.status === 401) {
          // If unauthorized, redirect to login
          window.location.href = '/auth';
          return null;
        }
        throw new Error(`Failed to update carousel item: ${response.status}`);
      }

      const updatedItem = await response.json();
      // Ensure the updated item has proper defaults to prevent undefined values
      return {
        ...updatedItem,
        image: updatedItem.image || '',
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
      const response = await fetch(`${API_BASE_URL}/api/admin/carousels/${id}`, {
        method: 'DELETE',
        credentials: 'include', // Include JWT cookie for authentication
      });

      if (!response.ok && response.status === 401) {
        // If unauthorized, redirect to login
        window.location.href = '/auth';
        return false;
      }

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