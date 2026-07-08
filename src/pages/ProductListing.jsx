import React, { useState, useMemo, useCallback } from 'react';
import { ChevronDown, ChevronUp, X, SlidersHorizontal, Trash2, Pencil } from 'lucide-react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { useAuth } from '../context/AuthContext';
import './ProductListing.css';

const NAV_CATEGORIES = ['All', 'Men', 'Women', 'Sneakers', 'Sports', 'New Arrivals', 'Sale'];
const GROUPED_CATEGORIES = ['Men', 'Women', 'Sneakers', 'Sports', 'New Arrivals', 'Sale'];

const FilterGroup = ({ title, isOpen, onToggle, children }) => {
  return (
    <div className="filter-group">
      <h4 className="filter-title" onClick={onToggle}>
        {title}
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </h4>
      {isOpen && children}
    </div>
  );
};

const DeleteConfirmModal = ({ product, onConfirm, onCancel }) => (
  <div className="delete-modal-overlay" onClick={onCancel}>
    <div className="delete-modal" onClick={e => e.stopPropagation()}>
      <div className="delete-modal-icon">
        <Trash2 size={28} />
      </div>
      <h3>Delete Product?</h3>
      <p>
        Are you sure you want to delete <strong>"{product.name}"</strong>?
        This action cannot be undone.
      </p>
      <div className="delete-modal-actions">
        <button className="delete-modal-cancel" onClick={onCancel}>
          Cancel
        </button>
        <button className="delete-modal-confirm" onClick={onConfirm}>
          <Trash2 size={15} /> Delete
        </button>
      </div>
    </div>
  </div>
);

const ProductCard = ({ product }) => {
  const { currentUser } = useAuth();
  const { deleteProduct } = useProducts();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const isAdmin = currentUser?.role === 'admin';

  const handleDeleteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setShowDeleteModal(false);
    await deleteProduct(product.id);
  };

  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/edit-product/${product.id}`);
  };

  return (
    <div className="product-card-wrapper">
      {/* Delete confirm modal */}
      {showDeleteModal && (
        <DeleteConfirmModal
          product={product}
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}

      <Link to={`/product/${product.id}`} className="product-card">
        <div className="product-img-wrapper">
          {product.badge && <span className="product-badge">{product.badge}</span>}
          <img src={product.img} alt={product.name} />
          {!isAdmin && (
            <div className="product-actions-overlay">
              <button className="btn btn-primary btn-full">View</button>
            </div>
          )}

          {/* Admin action buttons — top-right corner */}
          {isAdmin && (
            <div className="admin-card-actions">
              <button
                className="card-action-btn edit-btn"
                onClick={handleEdit}
                title="Edit product"
                aria-label="Edit product"
              >
                <Pencil size={13} />
              </button>
              <button
                className="card-action-btn delete-product-btn"
                onClick={handleDeleteClick}
                title="Delete product"
                aria-label="Delete product"
              >
                <Trash2 size={13} />
              </button>
            </div>
          )}
        </div>
        <div className="product-info">
          <div className="product-brand">{product.brand}</div>
          <h3 className="product-name">{product.name}</h3>
          <div className="product-meta">
            <span className="product-price">₹{product.price}.00 (Tentative Price)</span>
            <span className="product-rating">
              {product.rating > 0 ? `★ ${product.rating}` : '★ New'}
            </span>
          </div>
          <div className="product-brand">
            * Order now. We'll contact you with the best Price.
          </div>
        </div>
      </Link>
    </div>
  );
};

const ProductListing = () => {
  const { products } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filterOpen, setFilterOpen] = useState(false);
  const [openFilterGroup, setOpenFilterGroup] = useState('Category');
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [userPriceMax, setUserPriceMax] = useState(null);
  const [sortBy, setSortBy] = useState('newest');

  // Derive the actual max price from products so the slider scales correctly
  const maxProductPrice = useMemo(
    () => Math.max(500, ...products.map(p => p.price)),
    [products]
  );

  const priceMax = userPriceMax !== null ? userPriceMax : maxProductPrice;

  const activeCategory = searchParams.get('category') || 'All';
  const searchQuery = searchParams.get('search') || '';

  const setCategory = (cat) => {
    const params = {};
    if (cat !== 'All') params.category = cat;
    if (searchQuery) params.search = searchQuery;
    setSearchParams(params);
  };

  const allBrands = useMemo(() => [...new Set(products.map(p => p.brand))], [products]);

  const toggleBrand = (brand) => {
    setSelectedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const clearFilters = () => {
    setSelectedBrands([]);
    setUserPriceMax(null);
    setSortBy('newest');
    setSearchParams({});
  };

  // Keep original fetch order as the "newest" reference
  const productOrder = useMemo(
    () => new Map(products.map((p, i) => [p.id, i])),
    [products]
  );

  const applyFiltersAndSort = useCallback((list) => {
    let result = [...list];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.modelName && p.modelName.toLowerCase().includes(q))
      );
    }

    if (selectedBrands.length > 0) result = result.filter(p => selectedBrands.includes(p.brand));
    result = result.filter(p => p.price <= priceMax);

    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case 'price-desc':
        result.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case 'newest':
      default:
        // Restore original insertion order (API returns newest first)
        result.sort((a, b) => {
          const ia = productOrder.get(a.id) ?? Infinity;
          const ib = productOrder.get(b.id) ?? Infinity;
          return ia - ib;
        });
        break;
    }
    return result;
  }, [searchQuery, selectedBrands, priceMax, sortBy, productOrder]);

  const filtered = useMemo(() => {
    const base = activeCategory === 'All'
      ? products
      : products.filter(p => p.category === activeCategory);
    return applyFiltersAndSort(base);
  }, [products, activeCategory, applyFiltersAndSort]);

  const grouped = useMemo(() => {
    return GROUPED_CATEGORIES
      .map(cat => ({
        category: cat,
        items: applyFiltersAndSort(products.filter(p => p.category === cat)),
      }))
      .filter(group => group.items.length > 0);
  }, [products, applyFiltersAndSort]);

  const isAll = activeCategory === 'All';
  const pageTitle = searchQuery 
    ? `Search Results for "${searchQuery}"`
    : isAll ? 'All Products' : activeCategory;
  const totalShowing = isAll
    ? grouped.reduce((sum, g) => sum + g.items.length, 0)
    : filtered.length;

  return (
    <div className="product-listing-page">
      <div className="page-header">
        <div className="container">
          <h1>{pageTitle}</h1>
          <p>Home / {pageTitle}</p>
        </div>
      </div>

      {/* Mobile filter toggle bar */}
      <div className="mobile-filter-bar">
        <button
          className={`mobile-filter-toggle ${filterOpen ? 'active' : ''}`}
          onClick={() => setFilterOpen(!filterOpen)}
          aria-expanded={filterOpen}
        >
          <SlidersHorizontal size={18} />
          {filterOpen ? 'Hide Filters' : 'Show Filters'}
          {filterOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        <div className="sort-dropdown mobile-sort">
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      <div className="container main-content">
        {/* Sidebar */}
        <aside className={`sidebar ${filterOpen ? 'sidebar-open' : ''}`}>
          <div className="filter-header">
            <h3>Filters</h3>
            <div className="filter-header-actions">
              <button className="clear-btn" onClick={clearFilters}>Clear All</button>
              <button className="filter-close-btn" onClick={() => setFilterOpen(false)} aria-label="Close filters">
                <X size={18} />
              </button>
            </div>
          </div>

          <FilterGroup 
            title="Category"
            isOpen={openFilterGroup === 'Category'}
            onToggle={() => setOpenFilterGroup(openFilterGroup === 'Category' ? null : 'Category')}
          >
            <ul className="filter-list">
              {NAV_CATEGORIES.map(cat => (
                <li key={cat}>
                  <label className={activeCategory === cat ? 'active-filter' : ''}>
                    <input
                      type="radio"
                      name="category"
                      checked={activeCategory === cat}
                      onChange={() => setCategory(cat)}
                    />
                    {cat}
                    <span className="filter-count">
                      ({cat === 'All' ? products.length : products.filter(p => p.category === cat).length})
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </FilterGroup>

          <FilterGroup 
            title="Brand"
            isOpen={openFilterGroup === 'Brand'}
            onToggle={() => setOpenFilterGroup(openFilterGroup === 'Brand' ? null : 'Brand')}
          >
            <ul className="filter-list">
              {allBrands.map(brand => (
                <li key={brand}>
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand)}
                      onChange={() => toggleBrand(brand)}
                    />
                    {brand}
                    <span className="filter-count">
                      ({products.filter(p => p.brand === brand).length})
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </FilterGroup>

          <FilterGroup 
            title="Price Range"
            isOpen={openFilterGroup === 'Price Range'}
            onToggle={() => setOpenFilterGroup(openFilterGroup === 'Price Range' ? null : 'Price Range')}
          >
            <div className="price-slider-container">
              <input
                type="range" min="0" max={maxProductPrice}
                value={priceMax}
                onChange={e => setUserPriceMax(Number(e.target.value))}
                className="price-slider"
              />
              <div className="price-labels">
                <span>₹0</span>
                <span className="price-current">
                  {priceMax >= maxProductPrice ? 'All prices' : `Up to ₹${priceMax}`}
                </span>
              </div>
            </div>
          </FilterGroup>
        </aside>

        <section className="product-grid-section">
          <div className="grid-header desktop-grid-header">
            <p>
              Showing <strong>{totalShowing}</strong> result{totalShowing !== 1 ? 's' : ''}
              {!isAll ? ` in "${activeCategory}"` : ''}
            </p>
            <div className="sort-dropdown">
              <span>Sort by:</span>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="newest">Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* ALL view — grouped by category */}
          {isAll ? (
            grouped.length === 0 ? (
              <div className="no-results">
                <span>😕</span>
                <h3>No products found</h3>
                <p>Try adjusting your filters.</p>
                <button className="btn btn-accent" onClick={clearFilters}>Clear Filters</button>
              </div>
            ) : (
              <div className="all-categories-view">
                {grouped.map(({ category, items }) => (
                  <div key={category} className="category-section">
                    <div className="category-section-header">
                      <h2 className="category-section-title">{category}</h2>
                      <Link
                        to={`/sneakers?category=${encodeURIComponent(category)}`}
                        className="category-view-all"
                      >
                        View all {category} →
                      </Link>
                    </div>
                    <div className="products-grid">
                      {items.map(product => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            /* Single category view — flat grid */
            filtered.length === 0 ? (
              <div className="no-results">
                <span>😕</span>
                <h3>No products found</h3>
                <p>Try adjusting your filters or browse a different category.</p>
                <button className="btn btn-accent" onClick={clearFilters}>Clear Filters</button>
              </div>
            ) : (
              <div className="products-grid">
                {filtered.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )
          )}
        </section>
      </div>
    </div>
  );
};

export default ProductListing;
