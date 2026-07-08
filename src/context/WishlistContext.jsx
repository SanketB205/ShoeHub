import React, { createContext, useState, useContext, useEffect } from 'react';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

const STORAGE_KEY = 'wishlist';

const load = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (_) { return []; }
};

const save = (items) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch (_) {}
};

export const WishlistProvider = ({ children }) => {
  const [items, setItems] = useState(load);

  useEffect(() => { save(items); }, [items]);

  const toggle = (product) => {
    setItems(prev => {
      const exists = prev.some(p => p.id === product.id);
      return exists
        ? prev.filter(p => p.id !== product.id)
        : [...prev, product];
    });
  };

  const isWishlisted   = (id) => items.some(p => p.id === id);
  const getWishlistCount = () => items.length;

  return (
    <WishlistContext.Provider value={{ wishlist: items, toggle, isWishlisted, getWishlistCount }}>
      {children}
    </WishlistContext.Provider>
  );
};
