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

// Helper function to get proper image URL
const getImageUrl = (imagePath: string) => {
  if (!imagePath) return '';

  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }

  // Remove any 'uploads/' prefix to avoid double path
  const cleanPath = imagePath.replace(/^uploads\//, '');

  // Return full URL with API base
  return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/uploads/${cleanPath}`;
};

export default function Ecommerce() {
  const [products, setProducts] = useState<Product[]>([]);
  const [carousels, setCarousels] = useState<CarouselItem[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalCarousels, setTotalCarousels] = useState(0);
  const [lowStockProducts, setLowStockProducts] = useState(0);
  const [activeCarousels, setActiveCarousels] = useState(0);
  const [loading, setLoading] = useState(true);
  const [carouselView, setCarouselView] = useState<'active' | 'inactive'>('active'); // New state for carousel view

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
          console.log('Fetched carousels:', carouselsList); // Debug log
          setCarousels(carouselsList);
          setTotalCarousels(carouselsList.length);
          const activeCount = carouselsList.filter(c => c.isActive).length;
          console.log('Active carousel count:', activeCount); // Debug log
          setActiveCarousels(activeCount);
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
            <p className="mt-4 text-gray-400 dark:text-gray-400">Loading dashboard...</p>
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
          <h1 className="text-2xl font-bold text-white/80">Dashboard Overview</h1>
          <p className="text-sm text-white/60">Welcome back! Here's what's happening with your store today.</p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Total Products Card */}
          <div className="rounded-2xl border border-white/20 bg-white/5 p-5">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg  bg-blue-400/20 border border-white/20 )]">
              <FaBox className="text-blue-400 text-xl" />
            </div>
            <div className="mt-5">
              <span className="text-sm text-white/80">Total Products</span>
              <h4 className="mt-2 font-bold text-white text-title-sm dark:text-white/90">
                {totalProducts}
              </h4>
            </div>
          </div>

          {/* Active Carousels Card */}
          <div className="rounded-2xl border border-white/20 bg-white/5 p-5">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-green-900/30 border border-white/20">
              <FaImages className="text-green-400 text-xl" />
            </div>
            <div className="mt-5">
              <span className="text-sm text-white/80">Active Carousels</span>
              <h4 className="mt-2 font-bold text-white text-title-sm dark:text-white/90">
                {activeCarousels}
              </h4>
            </div>
          </div>

          {/* Low Stock Products Card */}
          <div className="rounded-2xl border border-white/20 bg-white/5 p-5">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-yellow-900/30 border border-white/20">
              <FaBox className="text-yellow-400 text-xl" />
            </div>
            <div className="mt-5">
              <span className="text-sm text-white/80">Low Stock Items</span>
              <h4 className="mt-2 font-bold text-white text-title-sm dark:text-white/90">
                {lowStockProducts}
              </h4>
            </div>
          </div>

          {/* Total Carousels Card */}
          <div className="rounded-2xl border border-white/20 bg-white/5 p-5">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-purple-900/30 border border-white/20">
              <FaImages className="text-purple-400 text-xl" />
            </div>
            <div className="mt-5">
              <span className="text-sm text-white/80">Total Carousels</span>
              <h4 className="mt-2 font-bold text-white text-title-sm dark:text-white/90">
                {totalCarousels}
              </h4>
            </div>
          </div>
        </div>

        {/* Products and Carousels Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Products */}
          <div className="rounded-2xl bg-white/6 border border-white/20 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-white/80 bg-white/5 rounded-full py-2 px-4 border border-white/20">Recent Products</h3>
              <a href="/products" className="border border-white/20 bg-white/5 rounded-full py-2 px-4 text-sm text-blue-500 hover:bg-blue-900/50 transition">View All</a>
            </div>

            <div className="border border-white/20 rounded-xl bg-white/5 h-72 flex flex-col">
              <div className="overflow-y-auto custom-scrollbar flex-grow">
                {products.map((product) => (
                  <div key={product.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/10 transition-all">
                    <div className="shrink-0 w-16 h-16 border bg-white/5 border-white/20 rounded-lg p-1 overflow-hidden">
                      {product.image ? (
                        <img
                          src={getImageUrl(product.image)}
                          alt={product.name}
                          className="w-full h-full object-cover rounded-md"
                        />
                      ) : (
                        <div className="w-full h-full bg-wwhite/80 flex items-center justify-center">
                          <FaBox className="text-white/80" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-white/80 truncate">{product.name}</h4>
                      <p className="text-sm text-white/50">${product.price.toFixed(2)}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          product.stock > 10
                            ? 'bg-gray-700 text-gray-200 dark:bg-gray-700/30 dark:text-gray-300'
                            : 'bg-gray-900 text-gray-400 dark:bg-gray-900/30 dark:text-gray-500'
                        }`}>
                          {product.stock} in stock
                        </span>
                        <span className="text-xs text-white/60">{product.category}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {products.length === 0 && (
                  <div className="text-center py-8 text-white/60">
                    No products found. <a href="/products" className="text-blue-500 hover:underline">Add your first product</a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Active Carousels */}
          <div className="rounded-2xl border border-white/20 bg-white/5 p-6">
            <div className="flex items-center mb-6">
              <h3 className="font-bold text-lg text-white/80 bg-white/5 border border-white/20 rounded-full py-2 px-4">Carousels</h3>
              <div className="flex-1 flex justify-center">
                <div className="flex rounded-full border border-white/20 overflow-hidden">
                  <button
                    onClick={() => setCarouselView('active')}
                    className={`px-4 py-2 text-sm ${
                      carouselView === 'active'
                        ? 'bg-white/10 text-white'
                        : 'bg-white/5 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    Active
                  </button>
                  <button
                    onClick={() => setCarouselView('inactive')}
                    className={`px-4 py-2 text-sm ${
                      carouselView === 'inactive'
                        ? 'bg-white/10 text-white'
                        : 'bg-white/5 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    Inactive
                  </button>
                </div>
              </div>
              <a href="/carousel" className="text-sm text-blue-500 hover:bg-blue-900/50 transition-all border border-white/20 bg-white/5 rounded-full py-2 px-4">View All</a>
            </div>

            <div className="bg-white/5 rounded-lg border border-white/20 h-72 flex flex-col">
              <div className="overflow-y-auto custom-scrollbar flex-grow">
                {carouselView === 'active'
                  ? carousels.filter(c => c.isActive).map((carousel) => (
                      <div key={carousel.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/10 transition-all">
                        <div className="shrink-0 w-16 h-16 overflow-hidden p-1 bg-white/5 rounded-lg border border-white/20">
                          {carousel.image ? (
                            <img
                              src={getImageUrl(carousel.image)}
                              alt={carousel.title}
                              className="w-full h-full object-cover rounded-md"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                              <FaImages className="text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-white/80 truncate">{carousel.title}</h4>
                          <p className="text-sm text-white/60 line-clamp-1">{carousel.description}</p>
                          <div className="mt-1">
                            <span className="inline-flex items-center text-xs px-2 py-1 rounded-full border border-white/20 bg-gray-700 text-gray-200 dark:bg-gray-700/30 dark:text-gray-300">
                              Active
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  : carousels.filter(c => !c.isActive).map((carousel) => (
                      <div key={carousel.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/10 transition-all">
                        <div className="shrink-0 w-16 h-16 overflow-hidden p-1 bg-white/5 rounded-lg border border-white/20">
                          {carousel.image ? (
                            <img
                              src={getImageUrl(carousel.image)}
                              alt={carousel.title}
                              className="w-full h-full object-cover rounded-md"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                              <FaImages className="text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-white/80 truncate">{carousel.title}</h4>
                          <p className="text-sm text-white/60 line-clamp-1">{carousel.description}</p>
                          <div className="mt-1">
                            <span className="inline-flex items-center text-xs font-bold text-white/80">
                              Inactive
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}

                {carouselView === 'active' && carousels.filter(c => c.isActive).length === 0 && (
                  <div className="text-center py-8 text-white/60">
                    No active carousels. <a href="/carousel" className="text-blue-500 hover:underline">Create a new carousel</a>
                  </div>
                )}
                {carouselView === 'inactive' && carousels.filter(c => !c.isActive).length === 0 && (
                  <div className="text-center py-8 text-white/60">
                    No inactive carousels. <a href="/carousel" className="text-blue-500 hover:underline">Create a new carousel</a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
