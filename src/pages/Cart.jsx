import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Trash2, ArrowLeft, ShieldCheck, Truck, RotateCcw, Award, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import CartWhatsAppModal from '../components/CartWhatsAppModal';
import './Cart.css';

const Cart = () => {
  const { cartItems, getCartCount, removeFromCart, addToCart, clearCart } = useCart();
  const { products } = useProducts();
  const { currentUser } = useAuth();
  const { toggle, isWishlisted } = useWishlist();
  const navigate = useNavigate();
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const cartCount = getCartCount();

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const subtotal = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const actualSubtotal = subtotal;

  // Mock recommendations
  const recommended = products.slice(0, 4);
  const recentlyViewed = products.slice(4, 8);

  return (
    <div className="cart-page">
      <div className="container cart-container">
        
        {/* Breadcrumb */}
        <div className="breadcrumb cart-breadcrumb">
          <Link to="/">Home</Link> &gt; <span className="current">Cart</span>
        </div>

        {/* Page Header */}
        <div className="cart-header">
          <div>
            <h1 className="cart-title">Shopping Cart</h1>
            <p className="cart-subtitle">Review your selected products before checkout.</p>
          </div>
          <div className="cart-item-count">
            <span className="cart-bag-icon">🛍️</span> {cartCount} Items
          </div>
        </div>

        <AnimatePresence mode="wait">
        {cartItems.length > 0 ? (
          <motion.div 
            key="cart-full"
            className="cart-layout"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            
            {/* LEFT: Cart Items (70%) */}
            <div className="cart-items-section">
              {cartItems.map((item, idx) => (
                <div key={idx} className="cart-item-card glass-dark">
                  <div className="item-image">
                    <img src={item.product.img} alt={item.product.name} />
                  </div>
                  
                  <div className="item-info">
                    <div className="item-brand">{item.product.brand}</div>
                    <h3 className="item-name">{item.product.name}</h3>
                    
                    <div className="item-rating-row">
                      <div className="stars">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className="star-icon" style={{ color: i < Math.floor(item.product.rating || 4.8) ? '#d4af37' : '#555' }}>★</span>
                        ))}
                      </div>
                      <span className="rating-score">{item.product.rating || '4.8'}</span>
                      <span className="reviews-count">(120)</span>
                    </div>
                    
                    <div className="item-sku">SKU: {item.product.id || 'NK-AM270-BLK'}</div>
                    <div className="item-availability"><span className="status-dot"></span> In Stock</div>
                  </div>

                  <div className="item-size-group">
                    <span className="label">Size</span>
                    <div className="size-badge">UK {item.size}</div>
                  </div>

                  <div className="item-qty-group">
                    <span className="label">Quantity</span>
                    <div className="qty-selector">
                      <button 
                        className="qty-btn" 
                        onClick={() => {
                          if (item.quantity > 1) {
                            addToCart(item.product, item.size, -1);
                          } else {
                            removeFromCart(item.product.id, item.size);
                          }
                        }}
                      >
                        -
                      </button>
                      <span className="qty-value">{item.quantity}</span>
                      <button 
                        className="qty-btn" 
                        onClick={() => addToCart(item.product, item.size, 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="item-price-group">
                    <span className="label">Price</span>
                    <div className="current-price">₹{item.product.price.toLocaleString('en-IN')}</div>
                    {item.product.originalPrice && (
                      <div className="original-price-row">
                        <span className="original-price">₹{item.product.originalPrice.toLocaleString('en-IN')}</span>
                        <span className="discount-pct">{Math.round((1 - item.product.price / item.product.originalPrice) * 100)}% OFF</span>
                      </div>
                    )}
                  </div>

                  <div className="item-subtotal-group">
                    <span className="label">Subtotal</span>
                    <div className="subtotal-val">₹{(item.product.price * item.quantity).toLocaleString('en-IN')}</div>
                  </div>

                  <div className="item-actions">
                    <button
                      className={`action-btn save-btn ${isWishlisted(item.product.id) ? 'wishlisted' : ''}`}
                      title={isWishlisted(item.product.id) ? 'Remove from Wishlist' : 'Save to Wishlist'}
                      onClick={() => toggle(item.product)}
                    >
                      <Heart
                        size={18}
                        fill={isWishlisted(item.product.id) ? '#ff4757' : 'none'}
                        color={isWishlisted(item.product.id) ? '#ff4757' : 'currentColor'}
                      />
                    </button>
                    <button className="action-btn remove-btn" title="Remove" onClick={() => removeFromCart(item.product.id, item.size)}><Trash2 size={18} /></button>
                  </div>
                </div>
              ))}

              <div className="cart-items-footer">
                <Link to="/sneakers" className="continue-shopping-btn">
                  <ArrowLeft size={16} /> Continue Shopping
                </Link>
                <button className="clear-cart-btn" onClick={clearCart}><Trash2 size={16} /> Clear Cart</button>
              </div>
            </div>

            {/* RIGHT: Order Summary (30%) */}
            <div className="order-summary-section">
              <div className="order-summary-card glass-dark">
                <h3 className="summary-title">Order Summary</h3>
                <div className="tax-info">* All prices are Tentitive, We'll contact you with the best Total Price.</div>
                
                {/* Coupon removed as requested */}

                <div className="summary-details">
                  <div className="summary-row">
                    <span className="summary-label">Subtotal ({cartCount} Items)</span>
                    <span className="summary-value">₹{actualSubtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Shipping</span>
                    <span className="summary-value success-text">FREE</span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Discount</span>
                    <span className="summary-value danger-text">-₹0</span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Tax (Included)</span>
                    <span className="summary-value">—</span>
                  </div>
                </div>

                <div className="summary-divider"></div>

                <div className="summary-row grand-total-row">
                  <span className="grand-total-label">Grand Total</span>
                  <span className="grand-total-value">₹{actualSubtotal.toLocaleString('en-IN')}</span>
                </div>
                

                <div className="summary-actions">
                  <button 
                    className="btn btn-accent btn-checkout" 
                    onClick={() => setIsWhatsAppModalOpen(true)}
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="whatsapp-icon"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                    Checkout via WhatsApp
                  </button>
                </div>

                <div className="trust-badges">
                  <div className="trust-item"><ShieldCheck size={16} /> Secure Checkout</div>
                  <div className="trust-item"><RotateCcw size={16} /> Easy Returns</div>
                  <div className="trust-item"><Truck size={16} /> Free Shipping</div>
                  <div className="trust-item"><Award size={16} /> Premium Quality</div>
                </div>

               
              </div>
            </div>
          </motion.div>
        ) : (
          /* Empty Cart UI */
          <motion.div 
            key="cart-empty"
            className="premium-empty-cart"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="empty-cart-illustration">
              <ShoppingBag size={100} strokeWidth={1} color="#D4AF37" className="bag-icon" />
              <div className="illustration-glow"></div>
            </div>
            
            <h2 className="empty-cart-title">Your Shopping Cart is Empty</h2>
            <p className="empty-cart-desc">
              Looks like you haven't added any shoes yet.<br/>
              Explore our latest sneakers and discover your next favorite pair.
            </p>
            
            <div className="empty-cart-actions">
              <Link to="/sneakers" className="btn btn-accent btn-large glow-hover">Continue Shopping</Link>
              <Link to="/sneakers?category=New%20Arrivals" className="btn btn-outline btn-large">Browse New Arrivals</Link>
            </div>

            <div className="empty-trust-badges">
              <div className="trust-item"><Truck size={18} /> Free Shipping</div>
              <div className="trust-item"><RotateCcw size={18} /> Easy Returns</div>
              <div className="trust-item"><ShieldCheck size={18} /> Secure Checkout</div>
              <div className="trust-item"><Award size={18} /> Premium Quality</div>
            </div>
          </motion.div>
        )}
        </AnimatePresence>

        {/* Recommended Products Slider */}
        <div className="cart-slider-section">
          <div className="slider-header">
            <h3><span className="accent-bar"></span> Trending Sneakers</h3>
            <Link to="/sneakers" className="view-all-link">View All <span>→</span></Link>
          </div>
          
          <div className="horizontal-slider">
            {recommended.map(prod => (
              <div key={prod.id} className="mini-product-card glass-dark">
                <img src={prod.img} alt={prod.name} />
                <div className="mini-info">
                  <span className="mini-brand">{prod.brand}</span>
                  <h4>{prod.name}</h4>
                  <div className="mini-price">₹{prod.price.toLocaleString('en-IN')}</div>
                </div>
                {currentUser?.role !== 'admin' && (
                  <button
                    className="mini-add-btn"
                    title="Add to Cart"
                    onClick={() => addToCart(prod, prod.sizes?.[0] || 7)}
                  >🛍️</button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recently Viewed Slider */}
        <div className="cart-slider-section">
          <div className="slider-header">
            <h3><span className="accent-bar"></span> Recently Viewed</h3>
            <Link to="/sneakers" className="view-all-link">View All <span>→</span></Link>
          </div>
          
          <div className="horizontal-slider">
            {recentlyViewed.map(prod => (
              <div key={prod.id} className="mini-product-card glass-dark">
                <img src={prod.img} alt={prod.name} />
                <div className="mini-info">
                  <span className="mini-brand">{prod.brand}</span>
                  <h4>{prod.name}</h4>
                  <div className="mini-price">₹{prod.price.toLocaleString('en-IN')}</div>
                </div>
                {currentUser?.role !== 'admin' && (
                  <button
                    className="mini-add-btn"
                    title="Add to Cart"
                    onClick={() => addToCart(prod, prod.sizes?.[0] || 7)}
                  >🛍️</button>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Mobile Sticky Checkout Bottom Bar */}
      {cartItems.length > 0 && (
        <div className="mobile-sticky-checkout glass-dark">
          <div className="mobile-checkout-total">
            <span className="label">Grand Total</span>
            <span className="value">₹{actualSubtotal.toLocaleString('en-IN')}</span>
          </div>
          <button
            className="btn btn-accent btn-mobile-checkout"
            onClick={() => setIsWhatsAppModalOpen(true)}
          >
            Checkout
          </button>
        </div>
      )}

      <CartWhatsAppModal 
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
      />

    </div>
  );
};

export default Cart;
