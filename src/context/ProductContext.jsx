import React, { createContext, useState, useContext, useEffect } from 'react';

const ProductContext = createContext();
const API_BASE = import.meta.env.VITE_API_BASE_URL;

export const useProducts = () => useContext(ProductContext);

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch products from backend
  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/products`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        console.error('Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const addProduct = async (formData) => {
    let mainImageUrl = '';
    if (formData.images && formData.images.length > 0) {
      const mainImage = formData.images.find(img => img.isMain);
      mainImageUrl = mainImage ? mainImage.url : formData.images[0].url;
    } else {
      mainImageUrl = formData.imageUrl || '';
    }

    const newProduct = {
      name: formData.name,
      brand: formData.brand,
      price: Number(formData.price),
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
      rating: 0,
      img: mainImageUrl,
      images: formData.images || [],
      badge: formData.badge || '',
      category: formData.category,
      description: formData.description,
      sizes: formData.sizes,
      isNew: true,
    };

    try {
      const response = await fetch(`${API_BASE}/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
      });
      
      if (response.ok) {
        const addedProduct = await response.json();
        setProducts(prev => [addedProduct, ...prev]);
        return addedProduct.id;
      } else {
        console.error('Failed to add product');
      }
    } catch (error) {
      console.error('Error adding product:', error);
    }
    return null;
  };

  const deleteProduct = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/api/products/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setProducts(prev => prev.filter(p => p.id !== id));
        return true;
      } else {
        console.error('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
    return false;
  };

  const updateProduct = async (id, formData) => {
    let mainImageUrl = '';
    if (formData.images && formData.images.length > 0) {
      const mainImage = formData.images.find(img => img.isMain);
      mainImageUrl = mainImage ? mainImage.url : formData.images[0].url;
    } else {
      mainImageUrl = formData.imageUrl || '';
    }

    const updatedProduct = {
      name: formData.name,
      brand: formData.brand,
      price: Number(formData.price),
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
      img: mainImageUrl,
      images: formData.images || [],
      badge: formData.badge || '',
      category: formData.category,
      description: formData.description,
      sizes: formData.sizes,
    };

    try {
      const response = await fetch(`${API_BASE}/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct),
      });

      if (response.ok) {
        const saved = await response.json();
        setProducts(prev => prev.map(p => p.id === id ? { ...p, ...saved } : p));
        return true;
      } else {
        console.error('Failed to update product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
    }
    return false;
  };

  return (
    <ProductContext.Provider value={{ products, addProduct, updateProduct, deleteProduct, loading }}>
      {children}
    </ProductContext.Provider>
  );
};
