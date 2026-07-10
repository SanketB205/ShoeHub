import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Returns products-per-page based on viewport width.
 * Desktop: 12 | Tablet (≤992): 8 | Mobile (≤576): 6
 */
const getLimit = () => {
  if (typeof window === 'undefined') return 12;
  if (window.innerWidth <= 576) return 6;
  if (window.innerWidth <= 992) return 8;
  return 12;
};

const usePaginatedProducts = ({ page, category, brand, search, sort, minPrice, maxPrice }) => {
  const [data, setData]       = useState({ products: [], totalPages: 1, totalProducts: 0, productsPerPage: 12, currentPage: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const abortRef              = useRef(null);

  const fetchPage = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);

    const limit = getLimit();
    const params = new URLSearchParams();
    params.set('page',  page);
    params.set('limit', limit);
    params.set('sort',  sort || 'newest');
    if (category && category !== 'All') params.set('category', category);
    if (brand)    params.set('brand',    brand);
    if (search)   params.set('search',   search);
    if (minPrice != null) params.set('minPrice', minPrice);
    if (maxPrice != null) params.set('maxPrice', maxPrice);

    try {
      // Use relative URL — goes through Vite proxy → backend
      const res = await fetch(`/api/products?${params.toString()}`, {
        signal: abortRef.current.signal,
      });
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const json = await res.json();
      // Normalise: handle both paginated shape and plain array
      if (Array.isArray(json)) {
        setData({ products: json, totalPages: 1, totalProducts: json.length, productsPerPage: limit, currentPage: 1 });
      } else {
        setData({ ...json, productsPerPage: json.productsPerPage ?? limit });
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Pagination fetch error:', err);
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [page, category, brand, search, sort, minPrice, maxPrice]);

  useEffect(() => {
    fetchPage();
    return () => { if (abortRef.current) abortRef.current.abort(); };
  }, [fetchPage]);

  return { ...data, loading, error, refetch: fetchPage };
};

export default usePaginatedProducts;
