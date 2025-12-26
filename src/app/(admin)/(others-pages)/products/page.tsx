'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/types/product';
import ProductForm from '@/components/products/ProductForm';
import AuthGuard from '../../auth-guard';

// Helper function to format image URLs
const formatImageUrl = (imagePath: string): string => {
  if (!imagePath) return '';

  // If it's already an absolute URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // If it's a local upload path, construct the full URL
  if (imagePath.includes('uploads')) {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
    // Normalize the path by replacing backslashes with forward slashes and ensuring it starts with /uploads
    let normalizedPath = imagePath.replace(/\\/g, '/'); // Replace backslashes with forward slashes
    if (!normalizedPath.startsWith('/')) {
      normalizedPath = '/' + normalizedPath;
    }
    if (!normalizedPath.startsWith('/uploads')) {
      normalizedPath = '/uploads/' + normalizedPath.split('uploads/')[1];
    }
    return `${baseUrl}${normalizedPath}`;
  }

  // For other cases, return as is
  return imagePath;
};

const ProductManagement = () => {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);

  // Load products from the Go backend
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
      const response = await fetch(`${API_BASE_URL}/api/admin/products`, {
        credentials: 'include', // Include JWT cookie for authentication
      });
      if (!response.ok) {
        if (response.status === 401) {
          // If unauthorized, redirect to login
          window.location.href = '/auth';
          return;
        }
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      // Ensure data is always an array
      setProducts(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      setError('Failed to load products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    setCurrentProduct(null);
    setShowForm(true);
  };

  const handleEditProduct = (product: Product) => {
    setCurrentProduct(product);
    setShowForm(true);
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
      const response = await fetch(`${API_BASE_URL}/api/admin/products/${id}`, {
        method: 'DELETE',
        credentials: 'include', // Include JWT cookie for authentication
      });

      if (!response.ok) {
        if (response.status === 401) {
          // If unauthorized, redirect to login
          window.location.href = '/auth';
          return;
        }
        throw new Error('Failed to delete product');
      }

      setProducts(products?.filter(product => product.id !== id) || []);
    } catch (err) {
      setError('Failed to delete product');
      console.error(err);
    }
  };

  const handleSaveProduct = async (productData: any) => {
    try {
      // Create FormData for multipart upload
      const formData = new FormData();

      // Add all text fields to the FormData using snake_case names to match database schema
      formData.append('name', productData.name);
      formData.append('price', String(productData.price));
      formData.append('rating', String(productData.rating || 0));
      formData.append('total_sold', productData.totalSold || '0');
      formData.append('store', productData.store);
      formData.append('description', productData.description || '');
      formData.append('category', productData.category || '');
      formData.append('stock', String(productData.stock || 0));
      formData.append('condition', productData.condition || '');
      formData.append('min_order', String(productData.minOrder || 1));

      // Handle image file
      if (productData.image instanceof File) {
        // New image file to upload
        formData.append('image', productData.image, productData.image.name);
      } else if (productData.image && typeof productData.image === 'string') {
        // Existing image path to keep (for edit operations when no new file is selected)
        // Normalize the image path to remove base URL if present and keep just the /uploads part
        let imagePath = productData.image;
        if (imagePath.includes('uploads/')) {
          const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
          // Remove the base URL part, keeping only the path after hostname
          imagePath = imagePath.replace(baseUrl, '').replace('http://', '').replace('https://', '');
          if (!imagePath.startsWith('/')) imagePath = '/' + imagePath;
        }
        formData.append('image', imagePath);
      }

      let response;
      try {
        if (currentProduct) {
          // Update existing product
          const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
          response = await fetch(`${API_BASE_URL}/api/admin/products/${currentProduct.id}`, {
            method: 'PUT',
            credentials: 'include', // Include JWT cookie for authentication
            body: formData,
          });
        } else {
          // Create new product
          const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
          response = await fetch(`${API_BASE_URL}/api/admin/products`, {
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
        throw new Error(currentProduct ? 'Failed to update product' : 'Failed to create product');
      }

      const savedProduct = await response.json();

      if (currentProduct) {
        // Update the product in the list
        setProducts(products?.map(p => p.id === savedProduct.id ? savedProduct : p) || [savedProduct]);
      } else {
        // Add the new product to the list
        setProducts([...(products || []), savedProduct]);
      }

      setShowForm(false);
      setCurrentProduct(null);
    } catch (err) {
      setError(currentProduct ? 'Failed to update product' : 'Failed to create product');
      console.error(err);
    }
  };

  if (loading) return <div className="text-center py-10">Loading products...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

  return (
    <AuthGuard>
      <div className="mx-auto max-w-7xl p-4 sm:p-6 md:p-8">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-black dark:text-white">Product Management</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manage your store products</p>
          </div>
          <button
            onClick={handleAddProduct}
            className="font-bold bg-white/5 rounded-lg px-4 py-2 text-white/80 border border-white/20 hover:bg-white/10 transition flex items-center justify-center"
          >
            <span className="mr-2">+</span> Add Product
          </button>
        </div>

        {!showForm ? (
          <div className="rounded-xl border border-white/20 bg-white/5">
            <div className="max-w-full overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-2 text-left dark:bg-meta-4">
                    <th className="py-4 px-4 font-medium text-white/80">Product</th>
                    <th className="py-4 px-4 font-medium text-white/80">Price</th>
                    <th className="py-4 px-4 font-medium text-white/80">Category</th>
                    <th className="py-4 px-4 font-medium text-white/80">Stock</th>
                    <th className="py-4 px-4 font-medium text-white/80">Store</th>
                    <th className="py-4 px-4 font-medium text-white/80">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products && products.map((product) => (
                    <tr key={product.id} className="border-t border-white/20">
                      <td className="py-5 px-4">
                        <div className="flex items-center">
                          <div className="h-16 w-16 rounded-md">
                            <img
                              src={formatImageUrl(product.image)}
                              alt={product.name}
                              className="h-full w-full rounded object-cover"
                            />
                          </div>
                          <div className="ml-4">
                            <h5 className="font-medium text-black dark:text-white">{product.name}</h5>
                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{product.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-4">
                        <p className="font-medium text-black dark:text-white">${product.price.toFixed(2)}</p>
                      </td>
                      <td className="py-5 px-4">
                        <span className="inline-flex rounded-full bg-primary bg-opacity-10 py-1 px-3 text-sm \
                          font-medium text-primary dark:bg-opacity-20 dark:text-white">
                          {product.category || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="py-5 px-4">
                        <span className={`inline-flex rounded-full py-1 px-3 text-sm font-medium \
                          ${
                          product.stock > 10
                            ? 'bg-success bg-opacity-10 text-success dark:bg-opacity-20 dark:text-white'
                            : 'bg-warning bg-opacity-10 text-warning dark:bg-opacity-20 dark:text-white'
                        }`}>
                          {product.stock} in stock
                        </span>
                      </td>
                      <td className="py-5 px-4 text-black dark:text-white">{product.store}</td>
                      <td className="py-5 px-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="flex items-center justify-center text-sm font-medium rounded-full bg-blue-500/10 text-white py-2 px-3.5 text-shadow-[0_0_5px_rgba(59,130,246,0.8)] hover:text-shadow-[0_0_24px_rgba(59,130,246,1)] hover:text-blue-400 transition-all"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
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
            <ProductForm
              product={currentProduct}
              onSave={handleSaveProduct}
              onCancel={() => {
                setShowForm(false);
                setCurrentProduct(null);
              }}
            />
          </div>
        )}

        {products && products.length === 0 && !showForm && (
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark p-8 text-center">
            <h3 className="text-lg font-medium text-black dark:text-white mb-2">No products yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Get started by adding your first product</p>
            <button
              onClick={handleAddProduct}
              className="bg-primary hover:bg-opacity-90 rounded-lg px-6 py-2.5 text-white"
            >
              Add Your First Product
            </button>
          </div>
        )}
      </div>
    </AuthGuard>
  );
};

export default ProductManagement;