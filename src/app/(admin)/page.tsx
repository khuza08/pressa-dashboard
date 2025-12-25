"use client";
import React, { useState, useEffect } from "react";
import { FaBox, FaImages } from "react-icons/fa";
import AuthGuard from './auth-guard';

// Define types for our data
interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
  image: string;
}

interface CarouselItem {
  id: number;
  title: string;
  description: string;
  image: string;
  isActive: boolean;
}

export default function Ecommerce() {
  const [products, setProducts] = useState<Product[]>([]);
  const [carousels, setCarousels] = useState<CarouselItem[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalCarousels, setTotalCarousels] = useState(0);
  const [lowStockProducts, setLowStockProducts] = useState(0);
  const [activeCarousels, setActiveCarousels] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch data from the backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

        // Fetch products
        const productsResponse = await fetch(`${API_BASE_URL}/api/admin/products`, {
          credentials: 'include',
        });

        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          const productsList = Array.isArray(productsData) ? productsData : productsData.data || [];
          setProducts(productsList);
          setTotalProducts(productsList.length);
          setLowStockProducts(productsList.filter(p => p.stock < 10).length);
        }

        // Fetch carousels
        const carouselsResponse = await fetch(`${API_BASE_URL}/api/admin/carousels`, {
          credentials: 'include',
        });

        if (carouselsResponse.ok) {
          const carouselsData = await carouselsResponse.json();
          const carouselsList = Array.isArray(carouselsData) ? carouselsData : carouselsData.data || [];
          setCarousels(carouselsList);
          setTotalCarousels(carouselsList.length);
          setActiveCarousels(carouselsList.filter(c => c.isActive).length);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <AuthGuard>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="space-y-6">
        {/* Dashboard Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-black dark:text-white">Dashboard Overview</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Welcome back! Here's what's happening with your store today.</p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Total Products Card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl dark:bg-blue-900/30">
              <FaBox className="text-blue-600 dark:text-blue-400 text-xl" />
            </div>
            <div className="mt-5">
              <span className="text-sm text-gray-500 dark:text-gray-400">Total Products</span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                {totalProducts}
              </h4>
            </div>
          </div>

          {/* Active Carousels Card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl dark:bg-green-900/30">
              <FaImages className="text-green-600 dark:text-green-400 text-xl" />
            </div>
            <div className="mt-5">
              <span className="text-sm text-gray-500 dark:text-gray-400">Active Carousels</span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                {activeCarousels}
              </h4>
            </div>
          </div>

          {/* Low Stock Products Card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-xl dark:bg-yellow-900/30">
              <FaBox className="text-yellow-600 dark:text-yellow-400 text-xl" />
            </div>
            <div className="mt-5">
              <span className="text-sm text-gray-500 dark:text-gray-400">Low Stock Items</span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                {lowStockProducts}
              </h4>
            </div>
          </div>

          {/* Total Carousels Card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl dark:bg-purple-900/30">
              <FaImages className="text-purple-600 dark:text-purple-400 text-xl" />
            </div>
            <div className="mt-5">
              <span className="text-sm text-gray-500 dark:text-gray-400">Total Carousels</span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                {totalCarousels}
              </h4>
            </div>
          </div>
        </div>

        {/* Products and Carousels Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Products */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-gray-800 dark:text-white">Recent Products</h3>
              <a href="/products" className="text-sm text-blue-500 hover:underline">View All</a>
            </div>

            <div className="space-y-4">
              {products.slice(0, 5).map((product) => (
                <div key={product.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden">
                    {product.image ? (
                      // Check if the image is already a full URL
                      product.image.startsWith('http') ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/uploads/${product.image}`}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      )
                    ) : (
                      <div className="w-full h-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                        <FaBox className="text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-800 dark:text-white truncate">{product.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">${product.price.toFixed(2)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        product.stock > 10
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {product.stock} in stock
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{product.category}</span>
                    </div>
                  </div>
                </div>
              ))}

              {products.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No products found. <a href="/products" className="text-blue-500 hover:underline">Add your first product</a>
                </div>
              )}
            </div>
          </div>

          {/* Active Carousels */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-gray-800 dark:text-white">Active Carousels</h3>
              <a href="/carousel" className="text-sm text-blue-500 hover:underline">View All</a>
            </div>

            <div className="space-y-4">
              {carousels.filter(c => c.isActive).slice(0, 5).map((carousel) => (
                <div key={carousel.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden">
                    {carousel.image ? (
                      // Check if the image is already a full URL
                      carousel.image.startsWith('http') ? (
                        <img
                          src={carousel.image}
                          alt={carousel.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/uploads/${carousel.image}`}
                          alt={carousel.title}
                          className="w-full h-full object-cover"
                        />
                      )
                    ) : (
                      <div className="w-full h-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                        <FaImages className="text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-800 dark:text-white truncate">{carousel.title}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{carousel.description}</p>
                    <div className="mt-1">
                      <span className="inline-flex items-center text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        Active
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {carousels.filter(c => c.isActive).length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No active carousels. <a href="/carousel" className="text-blue-500 hover:underline">Create a new carousel</a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
