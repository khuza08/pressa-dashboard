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
    image: product?.image || '',
    images: product?.images || [],
    rating: product?.rating || 0,
    totalSold: product?.totalSold || '',
    store: product?.store || '',
    description: product?.description || '',
    category: product?.category || '',
    variants: product?.variants || [],
    stock: product?.stock || 0,
    condition: product?.condition || '',
    minOrder: product?.minOrder || 1,
    features: product?.features || [],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('price') || name.includes('rating') || name.includes('stock') || name.includes('minOrder') 
        ? Number(value) 
        : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
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
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-formstroke dark:bg-form-input dark:focus:border-primary"
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
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-formstroke dark:bg-form-input dark:focus:border-primary"
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
                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-formstroke dark:bg-form-input dark:focus:border-primary"
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
                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-formstroke dark:bg-form-input dark:focus:border-primary"
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
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-formstroke dark:bg-form-input dark:focus:border-primary"
              required
            />
          </div>

          <div className="mb-4.5">
            <label className="mb-2.5 block text-sm font-medium text-black dark:text-white">
              Image URL
            </label>
            <input
              type="text"
              name="image"
              value={formData.image}
              onChange={handleChange}
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-formstroke dark:bg-form-input dark:focus:border-primary"
              required
            />
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
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-formstroke dark:bg-form-input dark:focus:border-primary"
            ></textarea>
          </div>

          <div className="flex justify-end gap-4.5">
            <button
              type="button"
              className="flex justify-center rounded border border-stroke py-2 px-6 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
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