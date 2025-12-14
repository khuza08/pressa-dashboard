'use client';

import { Product } from '@/types/product';
import React, { useState } from 'react';

interface ProductFormProps {
  product?: Product;
  onSave: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> | Partial<Product>) => void;
  onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onSave, onCancel }) => {
  const isEditing = !!product;
  
  const [formData, setFormData] = useState<Omit<Product, 'id' | 'createdAt' | 'updatedAt'> | Partial<Product>>({
    name: product?.name || '',
    price: product?.price || 0,
    rating: product?.rating || 0,
    totalSold: product?.totalSold || '',
    store: product?.store || '',
    description: product?.description || '',
    category: product?.category || '',
    stock: product?.stock || 0,
    condition: product?.condition || '',
    minOrder: product?.minOrder || 1,
  });

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  // Helper function to format image URLs
  const formatImageUrl = (imagePath: string): string => {
    if (!imagePath) return '';

    // If it's already an absolute URL, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    // If it's a local upload path, construct the full URL
    if (imagePath.includes('uploads/')) {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
      // Ensure the path starts with /uploads
      const normalizedPath = imagePath.startsWith('/uploads') ? imagePath : `/uploads/${imagePath.split('uploads/')[1]}`;
      return `${baseUrl}${normalizedPath}`;
    }

    // For other cases, return as is
    return imagePath;
  };

  const [imagePreview, setImagePreview] = useState<string | null>(product?.image ? formatImageUrl(product.image) : null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'rating' || name === 'stock' || name === 'minOrder'
        ? Number(value)
        : value
    }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      let file = e.target.files[0];
      const fileType = file.type;

      // Check if the file is already avif or webp
      if (fileType.includes('avif') || fileType.includes('webp')) {
        // File is already in accepted format
        setSelectedImage(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        // Convert the image to AVIF
        try {
          const convertedFile = await convertToAvif(file);
          setSelectedImage(convertedFile);
          const reader = new FileReader();
          reader.onloadend = () => {
            setImagePreview(reader.result as string);
          };
          reader.readAsDataURL(convertedFile);
        } catch (error) {
          alert('Failed to convert image to AVIF format. Please try another image.');
          e.target.value = ''; // Reset the input
          console.error('Image conversion error:', error);
        }
      }
    }
  };

  // Function to convert image to AVIF format
  const convertToAvif = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Set canvas dimensions to match the image
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw the image on the canvas
        ctx?.drawImage(img, 0, 0);

        // Convert to AVIF blob
        canvas.toBlob((blob) => {
          if (blob) {
            // Create a new File from the blob
            const avifFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.avif'), {
              type: 'image/avif',
              lastModified: Date.now()
            });
            resolve(avifFile);
          } else {
            reject(new Error('Canvas toBlob failed'));
          }
        }, 'image/avif', 0.8); // quality: 0.8 (80%)
      };

      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Create a FormData object to handle file uploads
    const productData: any = { ...formData };
    if (selectedImage) {
      productData.image = selectedImage;
    } else if (product?.image) {
      productData.image = product.image; // Keep existing image if editing and no new file selected
    }

    onSave(productData);
  };

  return (
    <div className="rounded-sm border border-black/50 dark:border-white/50 bg-white dark:bg-black shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
        <h3 className="font-medium text-black dark:text-white">
          {isEditing ? 'Edit Product' : 'Add New Product'}
        </h3>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="p-6.5">
          <div className="mb-4.5">
            <label className="mb-2.5 block text-sm font-medium text-black dark:text-white">
              Product Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black placeholder:text-black placeholder:opacity-40 focus:border-primary focus:outline-none active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-formstroke dark:bg-form-input dark:text-white dark:placeholder:text-white dark:placeholder:opacity-50"
              required
            />
          </div>

          <div className="w-full mb-4.5">
            <label className="mb-2.5 block text-sm font-medium text-black dark:text-white">
              Category
            </label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black placeholder:text-black placeholder:opacity-40 focus:border-primary focus:outline-none active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-formstroke dark:bg-form-input dark:text-white dark:placeholder:text-white dark:placeholder:opacity-50"
            />
          </div>

          <div className="flex gap-4 mb-4.5">
            <div className="w-1/2">
              <label className="mb-2.5 block text-sm font-medium text-black dark:text-white">
                Price ($)
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black placeholder:text-black placeholder:opacity-40 focus:border-primary focus:outline-none active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-formstroke dark:bg-form-input dark:text-white dark:placeholder:text-white dark:placeholder:opacity-50"
                step="0.01"
                required
              />
            </div>
            <div className="w-1/2">
              <label className="mb-2.5 block text-sm font-medium text-black dark:text-white">
                Stock
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black placeholder:text-black placeholder:opacity-40 focus:border-primary focus:outline-none active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-formstroke dark:bg-form-input dark:text-white dark:placeholder:text-white dark:placeholder:opacity-50"
                required
              />
            </div>
          </div>

          <div className="mb-4.5">
            <label className="mb-2.5 block text-sm font-medium text-black dark:text-white">
              Store
            </label>
            <input
              type="text"
              name="store"
              value={formData.store}
              onChange={handleChange}
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black placeholder:text-black placeholder:opacity-40 focus:border-primary focus:outline-none active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-formstroke dark:bg-form-input dark:text-white dark:placeholder:text-white dark:placeholder:opacity-50"
              required
            />
          </div>

          <div className="mb-4.5">
            <label className="mb-2.5 block text-sm font-medium text-black dark:text-white">
              Product Image
            </label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black placeholder:text-black placeholder:opacity-40 focus:border-primary focus:outline-none active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-formstroke dark:bg-form-input dark:text-white dark:placeholder:text-white dark:placeholder:opacity-50"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Image will be automatically converted to AVIF format
                </p>
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
            <label className="mb-2.5 block text-sm font-medium text-black dark:text-white">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              rows={4}
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black placeholder:text-black placeholder:opacity-40 focus:border-primary focus:outline-none active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-formstroke dark:bg-form-input dark:text-white dark:placeholder:text-white dark:placeholder:opacity-50"
            ></textarea>
          </div>

          <div className="flex justify-end gap-4.5">
            <button
              type="button"
              className="flex justify-center rounded border border-stroke py-2 px-6 font-medium text-black hover:bg-gray-100 hover:shadow-1 dark:border-strokedark dark:text-white dark:hover:bg-meta-4"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex justify-center rounded bg-primary py-2 px-6 font-medium text-white hover:bg-opacity-90"
            >
              {isEditing ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;