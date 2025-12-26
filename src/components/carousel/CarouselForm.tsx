'use client';

import React, { useState } from 'react';
import { CarouselItem } from '@/types/carousel';

interface CarouselFormProps {
  carousel?: CarouselItem;
  onSave: (carousel: Omit<CarouselItem, 'id' | 'createdAt' | 'updatedAt'> | Partial<CarouselItem>) => void;
  onCancel: () => void;
}

const CarouselForm: React.FC<CarouselFormProps> = ({ carousel, onSave, onCancel }) => {
  const isEditing = !!carousel;

  const [formData, setFormData] = useState<Omit<CarouselItem, 'id' | 'createdAt' | 'updatedAt'> | Partial<CarouselItem>>({
    title: carousel?.title || '',
    description: carousel?.description || '',
    link: carousel?.link || '',
    order: carousel?.order || 0,
    isActive: carousel?.isActive || false,
    category: carousel?.category || '',
  });

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    carousel?.image ? formatImageUrl(carousel.image) : null
  );

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Create a FormData object to handle file uploads
    const carouselData: any = { ...formData };
    if (selectedImage) {
      carouselData.image = selectedImage;
    } else if (carousel?.image) {
      // Extract just the filename for existing image to avoid path issues
      let imagePath = carousel.image;
      if (imagePath.includes('uploads/')) {
        const pathParts = imagePath.split('uploads/');
        imagePath = pathParts[pathParts.length - 1]; // Get the last part after all 'uploads/' occurrences
      }
      carouselData.image = imagePath; // Keep existing image filename if editing and no new file selected
    }

    onSave(carouselData);
  };

  return (
    <div className="rounded-xl border border-white/20 bg-white/5">
      <div className="border-b border-white/20 py-4 px-6.5">
        <h3 className="font-bold text-white/80">
          {isEditing ? 'Edit Carousel' : 'Add New Carousel'}
        </h3>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="p-6.5">
          <div className="mb-4.5">
            <label className="mb-2.5 block text-sm font-medium text-white/80">
              Carousel Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full font-medium rounded-lg bg-white/5 border border-white/20 text-white/80 py-3 px-5 outline-0"
              required
            />
          </div>

          <div className="w-full mb-4.5">
            <label className="mb-2.5 block text-sm font-bold text-white/80">
              Category
            </label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full font-medium rounded-lg text-white/80 border border-white/20 outline-none bg-white/5 py-3 px-5"
            />
          </div>

          <div className="flex gap-4 mb-4.5">
            <div className="w-1/2">
              <label className="mb-2.5 font-bold block text-sm text-white/80">
                Order
              </label>
              <input
                type="number"
                name="order"
                value={formData.order}
                onChange={handleChange}
                className="w-full font-medium rounded-lg text-white/80 border border-white/20 outline-none bg-white/5 py-3 px-5"
                min="0"
              />
            </div>
            <div className="w-1/2 flex items-center">
              <label className="flex items-center cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className={`block w-12 h-6 rounded-full transition-colors ${
                    formData.isActive ? 'bg-blue-500' : 'bg-gray-600'
                  }`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                    formData.isActive ? 'transform translate-x-6' : ''
                  }`}></div>
                </div>
                <div className="ml-3 text-sm font-medium text-white/80">
                  Active
                </div>
              </label>
            </div>
          </div>

          <div className="mb-4.5">
            <label className="mb-2.5 block text-sm font-bold text-white/80">
              Link
            </label>
            <input
              type="text"
              name="link"
              value={formData.link}
              onChange={handleChange}
              className="w-full font-medium rounded-lg text-white/80 border border-white/20 outline-none bg-white/5 py-3 px-5"
            />
          </div>

          <div className="mb-4.5">
            <label className="mb-2.5 block text-sm font-bold text-white/80">
              Carousel Image
            </label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full font-medium rounded-lg text-white/80 border border-white/20 outline-none bg-white/5 py-3 px-5"
                />
              </div>
              {imagePreview && (
                <div className="h-16 w-16 rounded-md overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="mb-4.5">
            <label className="mb-2.5 block text-sm font-bold text-white/80">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              rows={4}
              className="w-full font-medium rounded-lg text-white/80 border border-white/20 outline-none bg-white/5 py-3 px-5"
            ></textarea>
          </div>

          <div className="flex justify-end gap-4.5">
            <button
              type="button"
              className="flex justify-center rounded-lg border border-white/20 bg-white/5 py-2 px-6 font-bold text-white/80 hover:bg-white/10 transition"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex justify-center rounded-lg border border-white/20 bg-white/5 py-2 px-6 font-bold text-white/80 hover:bg-white/10 "
            >
              {isEditing ? 'Update Carousel' : 'Add Carousel'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CarouselForm;