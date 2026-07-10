import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

const API_URL = `/api/cart`;

export const CartProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isSyncing, setIsSyncing] = useState(false);

  // Sync to localstorage whenever cartItems change, to have a fallback
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Fetch or Sync cart from backend on login
  useEffect(() => {
    if (currentUser) {
      const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
      if (localCart.length > 0) {
        syncLocalCartToBackend(localCart);
      } else {
        fetchBackendCart();
      }
    }
  }, [currentUser]);

  const fetchBackendCart = async () => {
    try {
      const res = await fetch(API_URL, {
        headers: {
          'x-user-id': currentUser.id
        }
      });
      if (res.ok) {
        const data = await res.json();
        // Transform backend format to match frontend state format
        const formattedItems = data.map(item => ({
          product: item.Product,
          size: item.size,
          quantity: item.quantity
        }));
        setCartItems(formattedItems);
      }
    } catch (error) {
      console.error('Error fetching backend cart:', error);
    }
  };

  const syncLocalCartToBackend = async (localCartArray = cartItems) => {
    if (!currentUser || localCartArray.length === 0) return;
    
    setIsSyncing(true);
    try {
      const localItems = localCartArray.map(item => ({
        productId: item.product.id,
        size: item.size,
        quantity: item.quantity
      }));

      const res = await fetch(`${API_URL}/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id
        },
        body: JSON.stringify({ localItems })
      });

      if (res.ok) {
        const data = await res.json();
        const formattedItems = data.map(item => ({
          product: item.Product,
          size: item.size,
          quantity: item.quantity
        }));
        setCartItems(formattedItems);
        localStorage.removeItem('cart'); // Clear local storage after successful sync to prevent duplicate syncing later
      }
    } catch (error) {
      console.error('Error syncing cart:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const addToCart = async (product, size, quantity = 1) => {
    // Optimistic UI update
    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === product.id && item.size === size);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id && item.size === size 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, size, quantity }];
    });

    // If logged in, update backend
    if (currentUser) {
      try {
        await fetch(`${API_URL}/add`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': currentUser.id
          },
          body: JSON.stringify({ productId: product.id, size, quantity })
        });
      } catch (error) {
        console.error('Error adding to backend cart:', error);
      }
    }
  };

  const removeFromCart = async (productId, size) => {
    // Optimistic UI update
    setCartItems(prev => prev.filter(item => !(item.product.id === productId && item.size === size)));

    // If logged in, update backend
    if (currentUser) {
      try {
        await fetch(`${API_URL}/remove/${productId}/${size}`, {
          method: 'DELETE',
          headers: {
            'x-user-id': currentUser.id
          }
        });
      } catch (error) {
        console.error('Error removing from backend cart:', error);
      }
    }
  };

  const clearCart = async () => {
    setCartItems([]);
    if (currentUser) {
      try {
        await fetch(`${API_URL}/clear`, {
          method: 'DELETE',
          headers: {
            'x-user-id': currentUser.id
          }
        });
      } catch (error) {
        console.error('Error clearing backend cart:', error);
      }
    }
  };

  const getCartCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart, 
      removeFromCart, 
      clearCart, 
      getCartCount,
      syncLocalCartToBackend,
      isSyncing
    }}>
      {children}
    </CartContext.Provider>
  );
};
