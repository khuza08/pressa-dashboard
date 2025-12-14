'use client';

import { useState, useEffect } from 'react';
import { CarouselItem, carouselService } from '../../../../services/carouselService';
import AuthGuard from '../../auth-guard';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api/v1';

const CarouselPage = () => {
  const [carouselItems, setCarouselItems] = useState<CarouselItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<CarouselItem | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    imageType: 'url' as 'url' | 'file',
    link: '',
    order: 0,
    isActive: true,
    category: ''
  } as {
    title: string;
    description: string;
    image: string;
    imageType: 'url' | 'file';
    link: string;
    order: number;
    isActive: boolean;
    category: string;
  });

  // Fetch carousel items
  useEffect(() => {
    const fetchCarouselItems = async () => {
      try {
        setLoading(true);
        // Use the admin API for fetching carousel items in the admin dashboard
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
        setCarouselItems(normalizedItems);
      } catch (err) {
        setError('Failed to load carousel items');
        console.error('Error loading carousel items:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCarouselItems();
  }, []);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

    if (name === 'imageType') {
      // When switching imageType, clear the image field to prevent conflicts
      setFormData(prev => ({
        ...prev,
        imageType: value as 'url' | 'file',
        image: '' // Clear image when switching type
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  // Handle image file changes
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // For file uploads, we'll handle this differently in the submit function
      // For now, just set the file name in the image field temporarily
      setFormData(prev => ({
        ...prev,
        image: file.name // This will be updated during actual upload
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let submitData = { ...formData };

      // Handle file upload if imageType is 'file'
      if (formData.imageType === 'file') {
        const fileInput = document.querySelector('input[name="imageFile"]') as HTMLInputElement;

        if (fileInput && fileInput.files && fileInput.files[0]) {
          const file = fileInput.files[0];

          // Create FormData for file upload
          const uploadData = new FormData();
          uploadData.append('file', file);

          // Upload file to server (without authentication)
          const uploadResponse = await fetch(`${API_BASE_URL}/upload`, {
            method: 'POST',
            body: uploadData
          });

          if (!uploadResponse.ok) {
            const errorResult = await uploadResponse.json().catch(() => ({}));
            throw new Error(errorResult.error || `Failed to upload image: ${uploadResponse.status}`);
          }

          const uploadResult = await uploadResponse.json();
          submitData.image = uploadResult.filename; // Use the uploaded filename
        } else {
          // If we're in file mode but no file selected, and we're updating, keep the existing image
          if (currentItem && !fileInput?.files?.[0]) {
            // Don't change the image field, keep the existing one
            submitData.image = currentItem.image;
          } else {
            throw new Error('Please select an image file to upload');
          }
        }
      }

      if (currentItem) {
        // Update existing item
        const updatedItem = await carouselService.updateCarouselItem(currentItem.id, submitData);
        if (updatedItem) {
          setCarouselItems(prev => prev.map(item =>
            item.id === updatedItem.id ? updatedItem : item
          ));
          closeModal();
        }
      } else {
        // Create new item
        const newItem = await carouselService.createCarouselItem(submitData);
        if (newItem) {
          setCarouselItems(prev => [...prev, newItem]);
          closeModal();
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save carousel item');
      console.error('Error saving carousel item:', err);
    }
  };

  // Open modal for editing
  const openEditModal = (item: CarouselItem) => {
    setCurrentItem(item);
    setFormData({
      title: item.title,
      description: item.description || '',
      image: item.image || '',
      imageType: item.imageType || 'url',
      link: item.link || '',
      order: item.order || 0,
      isActive: item.isActive,
      category: item.category || ''
    });
    setIsModalOpen(true);
  };

  // Open modal for creating new item
  const openCreateModal = () => {
    setCurrentItem(null);
    setFormData({
      title: '',
      description: '',
      image: '',
      imageType: 'url',
      link: '',
      order: 0,
      isActive: true,
      category: ''
    });
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentItem(null);
  };

  // Delete item
  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this carousel item?')) {
      try {
        const success = await carouselService.deleteCarouselItem(id);
        if (success) {
          setCarouselItems(prev => prev.filter(item => item.id !== id));
        }
      } catch (err) {
        setError('Failed to delete carousel item');
        console.error('Error deleting carousel item:', err);
      }
    }
  };

  if (loading) {
    return <div className="p-6">Loading carousel items...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  return (
    <AuthGuard>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Carousel Management</h1>
          <button
            onClick={openCreateModal}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Add Carousel Item
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Image
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Active
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {carouselItems.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-12 w-12 object-cover rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.title}</div>
                    <div className="text-sm text-gray-500">{item.description?.substring(0, 50)}...</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.category || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.order}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      item.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {item.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => openEditModal(item)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal for creating/editing carousel items */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">
                {currentItem ? 'Edit Carousel Item' : 'Add New Carousel Item'}
              </h2>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Order
                    </label>
                    <input
                      type="number"
                      name="order"
                      value={formData.order}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Image Type
                    </label>
                    <select
                      name="imageType"
                      value={formData.imageType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="url">URL</option>
                      <option value="file">Upload File</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {formData.imageType === 'url' ? 'Image URL *' : 'Image File *'}
                    </label>
                    {formData.imageType === 'url' ? (
                      <input
                        key="image-url"
                        type="text"
                        name="image"
                        value={typeof formData.image === 'string' ? formData.image : ''}
                        onChange={handleInputChange}
                        required={formData.imageType === 'url'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    ) : (
                      <input
                        key="image-file"
                        type="file"
                        name="imageFile"
                        onChange={handleImageFileChange}
                        accept="image/*"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Link
                    </label>
                    <input
                      type="text"
                      name="link"
                      value={formData.link}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="rounded text-blue-600"
                    />
                    <span className="ml-2 text-sm text-gray-700">Active</span>
                  </label>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    {currentItem ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
};

export default CarouselPage;