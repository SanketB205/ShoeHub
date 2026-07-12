import React, { createContext, useState, useContext, useEffect } from 'react';

const ProductContext = createContext();

export const useProducts = () => useContext(ProductContext);

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [refreshKey, setRefreshKey] = useState(0); // incremented to signal paginated hook to re-fetch

  // Fetch products from backend — uses large limit to get all for grouped view & filter counts
  const fetchProducts = async () => {
    try {
      const response = await fetch(`/api/products?limit=500`);
      if (response.ok) {
        const data = await response.json();
        // Handle both paginated response shape and plain array (backwards compat)
        const list = Array.isArray(data) ? data : (data.products || []);
        setProducts(list);
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
      const mainImage = formData.images.find(img => img.isMain) || formData.images[0];
      mainImageUrl = mainImage.url;
    } else {
      mainImageUrl = formData.imageUrl || '';
    }

    // Strip non-serialisable `file` references before sending to the API
    const safeImages = (formData.images || []).map(({ file, ...rest }) => rest);

    const newProduct = {
      name: formData.name,
      brand: formData.brand,
      price: Number(formData.price),
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
      rating: 0,
      img: mainImageUrl,
      images: safeImages,
      badge: formData.badge || '',
      category: formData.category,
      description: formData.description,
      sizes: formData.sizes,
      isNew: true,
    };

    try {
      const response = await fetch(`/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
      });
      
      if (response.ok) {
        const addedProduct = await response.json();
        setProducts(prev => [addedProduct, ...prev]);
        setRefreshKey(k => k + 1);
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
      const response = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setProducts(prev => prev.filter(p => p.id !== id));
        setRefreshKey(k => k + 1);
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
      const mainImage = formData.images.find(img => img.isMain) || formData.images[0];
      mainImageUrl = mainImage.url;
    } else {
      mainImageUrl = formData.imageUrl || '';
    }

    // Strip non-serialisable `file` references before sending to the API
    const safeImages = (formData.images || []).map(({ file, ...rest }) => rest);

    const updatedProduct = {
      name: formData.name,
      brand: formData.brand,
      price: Number(formData.price),
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
      img: mainImageUrl,
      images: safeImages,
      badge: formData.badge || '',
      category: formData.category,
      description: formData.description,
      sizes: formData.sizes,
    };

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct),
      });

      if (response.ok) {
        const saved = await response.json();
        setProducts(prev => prev.map(p => String(p.id) === String(id) ? { ...p, ...saved } : p));
        setRefreshKey(k => k + 1);
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
    <ProductContext.Provider value={{ products, addProduct, updateProduct, deleteProduct, loading, refreshKey }}>
      {children}
    </ProductContext.Provider>
  );
};
