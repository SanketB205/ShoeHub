import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Heart, Expand, ChevronLeft, ChevronRight, Truck, RotateCcw, ShieldCheck, X } from 'lucide-react';
import './ProductDetails.css';

import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import WhatsAppOrderModal from '../components/WhatsAppOrderModal';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products } = useProducts();
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const { currentUser } = useAuth();
  const { toggle, isWishlisted } = useWishlist();

  // Stable review count per product — avoids new random on every re-render
  const reviewCount = React.useMemo(() => Math.floor(Math.random() * 200) + 50, []);

  // Match product by id — handles both numeric and string IDs from backend
  const product = products.find(p => String(p.id) === String(id));

  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [activeTab, setActiveTab] = useState('DESCRIPTION');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);

  const handleBuyNowClick = () => {
    if (!selectedSize) {
      addToast('Please select a size before proceeding.', 'error');
      return;
    }
    setIsWhatsAppModalOpen(true);
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      addToast('Please select a size before adding to cart.', 'error');
      return;
    }
    addToCart(product, selectedSize);
    addToast(`${product.name} (Size: ${selectedSize}) added to cart!`, 'success');
  };

  // Safely compute images — main image first, handles both full objects and plain URL strings
  const productImages = product
    ? (() => {
        const imgs = product.images && product.images.length > 0
          ? [...product.images]
              .sort((a, b) => {
                // isMain image first
                if (a.isMain && !b.isMain) return -1;
                if (!a.isMain && b.isMain) return 1;
                return 0;
              })
              .map(img => (typeof img === 'string' ? img : img?.url))
              .filter(Boolean)
          : [];
        return imgs.length > 0 ? imgs : (product.img ? [product.img] : []);
      })()
    : [];

  const nextImage = () => setActiveImage((prev) => (prev + 1) % productImages.length);
  const prevImage = () => setActiveImage((prev) => (prev - 1 + productImages.length) % productImages.length);

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  const lightboxNext = useCallback(() =>
    setLightboxIndex((prev) => (prev + 1) % productImages.length), [productImages.length]);
  const lightboxPrev = useCallback(() =>
    setLightboxIndex((prev) => (prev - 1 + productImages.length) % productImages.length), [productImages.length]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKey = (e) => {
      if (e.key === 'ArrowRight') lightboxNext();
      else if (e.key === 'ArrowLeft') lightboxPrev();
      else if (e.key === 'Escape') closeLightbox();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightboxOpen, lightboxNext, lightboxPrev]);

  if (!product) {
    return (
      <div className="product-details-page">
        <div className="container" style={{ paddingTop: '8rem', textAlign: 'center' }}>
          <h2>Product Not Found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="product-details-page">
      <div className="container details-container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <span>Home</span> &gt; <span>Sneakers</span> &gt; <span>{product.category || 'Category'}</span> &gt; <span className="current">{product.name}</span>
        </div>

        <div className="product-layout">
          {/* Image Gallery */}
          <div className="product-gallery">
            <div className="thumbnails">
              {productImages.map((img, idx) => (
                <div 
                  key={idx} 
                  className={`thumbnail ${activeImage === idx ? 'active' : ''}`}
                  onClick={() => setActiveImage(idx)}
                >
                  <img src={img} alt={`Thumbnail ${idx}`} />
                </div>
              ))}
              {productImages.length > 4 && (
                <div className="thumbnail-more-icon">
                  <ChevronRight size={16} />
                </div>
              )}
            </div>
            
            <div className="main-image">
              {product.badge && <div className="new-badge">{product.badge.toUpperCase()}</div>}
              <button className="expand-btn" onClick={() => openLightbox(activeImage)} aria-label="View full size image">
                <Expand size={18} />
              </button>
              
              {productImages.length > 1 && <button className="nav-arrow left" onClick={prevImage}><ChevronLeft size={24} /></button>}
              <img src={productImages[activeImage]} alt={product.name} />
              {productImages.length > 1 && <button className="nav-arrow right" onClick={nextImage}><ChevronRight size={24} /></button>}
            </div>
          </div>

          {/* Product Info */}
          <div className="product-info-panel">
            <h1 className="product-title">{product.name}</h1>
            <div className="product-subtitle-row">
              <span className="subtitle">{product.brand || "Brand"} Shoes</span>
              <span className="sku">SKU: {product.id}</span>
            </div>
            
            <div className="product-price-row">
              <div className="price">₹{product.price.toLocaleString('en-IN')}</div>
              {product.originalPrice && (
                <>
                  <div className="original-price">₹{product.originalPrice.toLocaleString('en-IN')}</div>
                  <div className="discount">{Math.round((1 - product.price/product.originalPrice) * 100)}% OFF</div>
                </>
              )}
              <div className="tax-info">* It is a Tentitive price, click on Buy now We'll contact you with the best Price.</div>
            </div>

            <div className="product-rating-row">
              <div className="stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill={i < Math.floor(product.rating || 4) ? "#d4af37" : (i === Math.floor(product.rating || 4) && (product.rating % 1 !== 0) ? "url(#half-star)" : "none")} color={i < (product.rating || 4) ? "#d4af37" : "#555"} strokeWidth={i < (product.rating || 4) ? 0 : 1} />
                ))}
              </div>
              <span className="rating-score">{product.rating || '4.0'}</span>
              <span className="reviews-count">({reviewCount} Reviews)</span>
              <span className="separator">|</span>
              <button className="write-review">Write a review</button>
            </div>

            <p className="description">{product.description}</p>
            <button className="more-info-link">More Info</button>

            <div className="selector-section">
              <div className="selector-header">
                <span className="selector-label">Select Size</span>
                <button className="size-guide">Size Guide</button>
              </div>
              
              <div className="size-options">
                {(product.sizes && product.sizes.length > 0 ? product.sizes : [6,7,8,9,10]).map(size => (
                  <button 
                    key={size}
                    className={`size-box ${selectedSize === size ? 'active' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
              
              <div className="selected-size-info">
                {selectedSize ? (
                  <span>Selected Size: UK {selectedSize} | EU {selectedSize === 7 ? 40 : 40 + (selectedSize - 7)} | 25.5 CM</span>
                ) : (
                  <span style={{ color: '#EF4444' }}>No size selected</span>
                )}
                <button className="size-not-available">Size not available?</button>
              </div>
            </div>

            <div className="action-buttons">
              {currentUser?.role !== 'admin' && (
                <>
                  <button className="btn btn-accent btn-buy-now" onClick={handleBuyNowClick}>BUY NOW</button>
                  <button className="btn btn-outline btn-add-cart" onClick={handleAddToCart}>ADD TO CART</button>
                </>
              )}
              <button
                className={`btn btn-outline btn-favorite ${product && isWishlisted(product.id) ? 'wishlisted' : ''}`}
                onClick={() => product && toggle(product)}
                title={product && isWishlisted(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart
                  size={20}
                  fill={product && isWishlisted(product.id) ? '#ff4757' : 'none'}
                  color={product && isWishlisted(product.id) ? '#ff4757' : 'currentColor'}
                />
              </button>
            </div>

            <div className="perks-list">
              <div className="perk-item">
                <Truck size={20} className="perk-icon" />
                <div className="perk-text">
                  <strong>FREE DELIVERY</strong> on all orders within India.
                </div>
              </div>
              <div className="perk-item">
                <RotateCcw size={20} className="perk-icon" />
                <div className="perk-text">
                  <strong>HASSLE FREE 7 DAY RETURN.</strong><br/>
                  Accessories are non-returnable. T&C Apply.
                </div>
              </div>
              <div className="perk-item">
                <ShieldCheck size={20} className="perk-icon" />
                <div className="perk-text">
                  <strong>1 YEAR WARRANTY &amp; CLAIMS</strong> <span className="click-here">CLICK HERE.</span>
                </div>
              </div>
            </div>

            <div className="delivery-check">
              <div className="check-label">Check expected delivery date</div>
              <div className="check-input-group">
                <input type="text" placeholder="Enter Pincode" />
                <button className="btn-check">CHECK</button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Tabs Section */}
        <div className="bottom-tabs-section">
          <div className="tabs-header">
            {['DESCRIPTION', 'DETAILS', 'REVIEWS (128)', 'DELIVERY & RETURNS'].map(tab => (
              <button 
                key={tab} 
                className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
          
          {activeTab === 'DESCRIPTION' && (
            <div className="tab-content description-content">
              <div className="desc-left">
                <p>{product.description}</p>
                <ul>
                  <li>Lightweight knit upper for breathability</li>
                  <li>OrthoLite cushioning for all-day comfort</li>
                  <li>Iconic rubber toe cap and diamond outsole</li>
                  <li>Classic All Star ankle patch</li>
                </ul>
              </div>
              <div className="desc-right">
                <div className="feature-item">
                  <div className="feature-icon-placeholder">✨</div>
                  <div className="feature-text">
                    <strong>BREATHABLE KNIT</strong>
                    <span>Lightweight &amp; comfortable</span>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-icon-placeholder">👟</div>
                  <div className="feature-text">
                    <strong>ORTHOLITE INSOLE</strong>
                    <span>Superior cushioning</span>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-icon-placeholder">⚙️</div>
                  <div className="feature-text">
                    <strong>DURABLE OUTSOLE</strong>
                    <span>High traction &amp; grip</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* SVG filter for half star (optional, simplistic approach) */}
      <svg width="0" height="0">
        <defs>
          <linearGradient id="half-star">
            <stop offset="50%" stopColor="#d4af37" />
            <stop offset="50%" stopColor="transparent" />
          </linearGradient>
        </defs>
      </svg>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div className="lightbox-overlay" onClick={closeLightbox} role="dialog" aria-modal="true" aria-label="Image viewer">
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={closeLightbox} aria-label="Close">
              <X size={24} />
            </button>

            <button className="lightbox-arrow left" onClick={lightboxPrev} aria-label="Previous image">
              <ChevronLeft size={32} />
            </button>

            <img
              src={productImages[lightboxIndex]}
              alt={`${product.name} - image ${lightboxIndex + 1}`}
              className="lightbox-img"
            />

            {productImages.length > 1 && (
              <button className="lightbox-arrow right" onClick={lightboxNext} aria-label="Next image">
                <ChevronRight size={32} />
              </button>
            )}

            <div className="lightbox-thumbnails">
              {productImages.map((img, idx) => (
                <button
                  key={idx}
                  className={`lightbox-thumb ${lightboxIndex === idx ? 'active' : ''}`}
                  onClick={() => setLightboxIndex(idx)}
                  aria-label={`View image ${idx + 1}`}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} />
                </button>
              ))}
            </div>

            <div className="lightbox-counter">
              {lightboxIndex + 1} / {productImages.length}
            </div>
          </div>
        </div>
      )}

      <WhatsAppOrderModal 
        isOpen={isWhatsAppModalOpen} 
        onClose={() => setIsWhatsAppModalOpen(false)} 
        product={product} 
        selectedSize={selectedSize} 
      />
    </div>
  );
};

export default ProductDetails;
