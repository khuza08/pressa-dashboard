'use client';

import { useState, useEffect } from 'react';
import CarouselForm from '@/components/carousel/CarouselForm';
import { CarouselItem } from '@/types/carousel';
import AuthGuard from '../../auth-guard';

const CarouselManagement = () => {
  const [carousels, setCarousels] = useState<CarouselItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [currentCarousel, setCurrentCarousel] = useState<CarouselItem | null>(null);

  // Helper function to format image URLs
  const formatImageUrl = (imagePath: string): string => {
    if (!imagePath) return '';

    // If it's already an absolute URL, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    // Remove any 'uploads/' prefix to avoid double path like /uploads/uploads/
    const cleanPath = imagePath.replace(/^uploads\//, '');

    // Construct the full URL
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
    return `${baseUrl}/uploads/${cleanPath}`;
  };

  // Load carousels from the Go backend
  useEffect(() => {
    fetchCarousels();
  }, []);

  const fetchCarousels = async () => {
    try {
      setLoading(true);
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
      const response = await fetch(`${API_BASE_URL}/api/admin/carousels`, {
        credentials: 'include', // Include JWT cookie for authentication
      });
      if (!response.ok) {
        if (response.status === 401) {
          // If unauthorized, redirect to login
          window.location.href = '/auth';
          return;
        }
        throw new Error('Failed to fetch carousels');
      }
      const data = await response.json();
      // Ensure data is always an array
      setCarousels(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      setError('Failed to load carousels');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCarousel = () => {
    setCurrentCarousel(null);
    setShowForm(true);
  };

  const handleEditCarousel = (carousel: CarouselItem) => {
    setCurrentCarousel(carousel);
    setShowForm(true);
  };

  const handleDeleteCarousel = async (id: number) => {
    if (!confirm('Are you sure you want to delete this carousel?')) return;

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
      const response = await fetch(`${API_BASE_URL}/api/admin/carousels/${id}`, {
        method: 'DELETE',
        credentials: 'include', // Include JWT cookie for authentication
      });

      if (!response.ok) {
        if (response.status === 401) {
          // If unauthorized, redirect to login
          window.location.href = '/auth';
          return;
        }
        throw new Error('Failed to delete carousel');
      }

      setCarousels(carousels?.filter(carousel => carousel.id !== id) || []);
    } catch (err) {
      setError('Failed to delete carousel');
      console.error(err);
    }
  };

  const handleSaveCarousel = async (carouselData: any) => {
    try {
      // Create FormData for multipart upload
      const formData = new FormData();

      // Add all text fields to the FormData using snake_case names to match database schema
      formData.append('title', carouselData.title);
      formData.append('description', carouselData.description || '');
      formData.append('link', carouselData.link || '');
      formData.append('order', String(carouselData.order || 0));
      formData.append('isActive', String(carouselData.isActive || false));
      formData.append('category', carouselData.category || '');

      // Handle image file
      if (carouselData.image instanceof File) {
        // New image file to upload
        formData.append('image', carouselData.image, carouselData.image.name);
      } else if (carouselData.image && typeof carouselData.image === 'string') {
        // Existing image path to keep (for edit operations when no new file is selected)
        // Normalize the image path to remove base URL if present and keep just the filename
        let imagePath = carouselData.image;
        if (imagePath.includes('uploads/')) {
          // Extract just the filename after 'uploads/'
          const pathParts = imagePath.split('uploads/');
          imagePath = pathParts[pathParts.length - 1]; // Get the last part after all 'uploads/' occurrences
        }
        formData.append('image', imagePath);
      }

      let response;
      try {
        if (currentCarousel) {
          // Update existing carousel
          const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
          response = await fetch(`${API_BASE_URL}/api/admin/carousels/${currentCarousel.id}`, {
            method: 'PUT',
            credentials: 'include', // Include JWT cookie for authentication
            body: formData,
          });
        } else {
          // Create new carousel
          const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
          response = await fetch(`${API_BASE_URL}/api/admin/carousels`, {
            method: 'POST',
            credentials: 'include', // Include JWT cookie for authentication
            body: formData,
          });
        }
      } catch (networkError) {
        console.error('Network error:', networkError);
        throw new Error('Network error: Could not connect to server. Please check if the backend is running.');
      }

      if (!response.ok) {
        if (response.status === 401) {
          // If unauthorized, redirect to login
          window.location.href = '/auth';
          return;
        }
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(currentCarousel ? 'Failed to update carousel' : 'Failed to create carousel');
      }

      const savedCarousel = await response.json();

      if (currentCarousel) {
        // Update the carousel in the list
        setCarousels(carousels?.map(c => c.id === savedCarousel.id ? savedCarousel : c) || [savedCarousel]);
      } else {
        // Add the new carousel to the list
        setCarousels([...(carousels || []), savedCarousel]);
      }

      setShowForm(false);
      setCurrentCarousel(null);
    } catch (err) {
      setError(currentCarousel ? 'Failed to update carousel' : 'Failed to create carousel');
      console.error(err);
    }
  };

  if (loading) return <div className="text-center py-10">Loading carousels...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

  return (
    <AuthGuard>
      <div className="mx-auto max-w-7xl p-4 sm:p-6 md:p-8">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-black dark:text-white">Carousel Management</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manage your store carousels</p>
          </div>
          <button
            onClick={handleAddCarousel}
            className="font-bold bg-white/5 rounded-lg px-4 py-2 text-white/80 border border-white/20 hover:bg-white/10 transition flex items-center justify-center"
          >
            <span className="mr-2">+</span> Add Carousel
          </button>
        </div>

        {!showForm ? (
          <div className="rounded-xl border border-white/20 bg-white/5">
            <div className="max-w-full overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-2 text-left dark:bg-meta-4">
                    <th className="py-4 px-4 font-medium text-white/80">Carousel</th>
                    <th className="py-4 px-4 font-medium text-white/80">Category</th>
                    <th className="py-4 px-4 font-medium text-white/80">Order</th>
                    <th className="py-4 px-4 font-medium text-white/80">Status</th>
                    <th className="py-4 px-4 font-medium text-white/80">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {carousels && carousels.map((carousel) => (
                    <tr key={carousel.id} className="border-t border-white/20">
                      <td className="py-5 px-4">
                        <div className="flex items-center">
                          <div className="h-16 w-16 rounded-md">
                            <img
                              src={formatImageUrl(carousel.image)}
                              alt={carousel.title}
                              className="h-full w-full rounded object-cover"
                            />
                          </div>
                          <div className="ml-4">
                            <h5 className="font-medium text-black dark:text-white">{carousel.title}</h5>
                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{carousel.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-4">
                        <span className="inline-flex rounded-full bg-primary bg-opacity-10 py-1 px-3 text-sm \
                          font-medium text-primary dark:bg-opacity-20 dark:text-white">
                          {carousel.category || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="py-5 px-4">
                        <p className="font-medium text-black dark:text-white">{carousel.order}</p>
                      </td>
                      <td className="py-5 px-4">
                        <span className={`inline-flex rounded-full py-1 px-3 text-sm font-medium ${
                          carousel.isActive
                            ? 'bg-success bg-opacity-10 text-success dark:bg-opacity-20 dark:text-white'
                            : 'bg-warning bg-opacity-10 text-warning dark:bg-opacity-20 dark:text-white'
                        }`}>
                          {carousel.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-5 px-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditCarousel(carousel)}
                            className="flex items-center justify-center text-sm font-medium rounded-full bg-blue-500/10 text-white py-2 px-3.5 text-shadow-[0_0_5px_rgba(59,130,246,0.8)] hover:text-shadow-[0_0_24px_rgba(59,130,246,1)] hover:text-blue-400 transition-all"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteCarousel(carousel.id)}
                            className="flex items-center justify-center text-sm font-medium rounded-full bg-red-500/10 text-white py-2 px-3.5 text-shadow-[0_0_5px_rgba(239,68,68,0.8)] hover:text-shadow-[0_0_24px_rgba(255,100,100,1)] hover:text-red-400 transition-all"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <CarouselForm
              carousel={currentCarousel}
              onSave={handleSaveCarousel}
              onCancel={() => {
                setShowForm(false);
                setCurrentCarousel(null);
              }}
            />
          </div>
        )}

        {carousels && carousels.length === 0 && !showForm && (
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark p-8 text-center">
            <h3 className="text-lg font-medium text-black dark:text-white mb-2">No carousels yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Get started by adding your first carousel</p>
            <button
              onClick={handleAddCarousel}
              className="bg-primary hover:bg-opacity-90 rounded-lg px-6 py-2.5 text-white"
            >
              Add Your First Carousel
            </button>
          </div>
        )}
      </div>
    </AuthGuard>
  );
};

export default CarouselManagement;