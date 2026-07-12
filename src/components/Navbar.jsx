import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Heart, ShoppingCart, User, Menu, X, LogOut, Shield, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import './Navbar.css';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();
  const { getCartCount } = useCart();
  const { getWishlistCount } = useWishlist();
  const profileRef = useRef(null);

  // Click outside to close profile dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    
    // Only attach the listener if the dropdown is open
    if (profileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Debounced Search Effect
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchOpen && searchQuery.trim() !== '') {
        navigate(`/sneakers?search=${encodeURIComponent(searchQuery.trim())}`);
      } else if (searchOpen && searchQuery === '' && location.pathname === '/sneakers') {
         // If they clear the search while on the sneakers page, remove the search param
         navigate(`/sneakers`);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, searchOpen, navigate, location.pathname]);


  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/sneakers?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      <nav className={`navbar ${isScrolled ? 'scrolled glass-dark' : 'transparent'}`}>
        <div className="navbar-container container">
          
          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-toggle" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} color="#fff" /> : <Menu size={24} color="#fff" />}
          </button>

          {/* Logo */}
          <Link to="/" className="navbar-logo">
            <span className="navbar-brand-name"> Shoe Hub</span>
          </Link>

          <AnimatePresence mode="wait">
            {searchOpen ? (
              <motion.div 
                key="search-mode"
                className="full-width-search"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                style={{ width: '100%', display: 'flex', alignItems: 'center' }}
              >
                <form onSubmit={handleSearchSubmit} className="nav-search-form" style={{ width: '100%' }}>
                  <Search size={20} className="search-icon-inside" style={{ color: 'var(--text-muted)', marginLeft: '15px' }} />
                  <input 
                    type="text" 
                    placeholder="Search products, brands, categories..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    style={{ 
                      flex: 1, 
                      background: 'transparent', 
                      border: 'none', 
                      padding: '10px 15px', 
                      color: 'var(--text-primary)', 
                      fontSize: '1rem', 
                      outline: 'none',
                      boxShadow: 'none'
                    }}
                  />
                  <button 
                    type="button" 
                    className="icon-btn search-close-btn" 
                    onClick={() => setSearchOpen(false)}
                    style={{ 
                      color: 'var(--text-primary)', 
                      marginRight: '15px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <X size={24} />
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div 
                key="nav-mode" 
                className="nav-content-wrapper"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between', paddingLeft: '20px' }}
              >
                {/* Desktop Navigation */}
                <ul className="navbar-links">
            <li>
              <Link to="/sneakers" className="nav-item">All</Link>
            </li>
            {['Men', 'Women', 'Sneakers', 'Sports', 'New Arrivals'].map((item) => (
              <li key={item}>
                <Link to={`/sneakers?category=${encodeURIComponent(item)}`} className="nav-item">{item}</Link>
              </li>
            ))}
            <li>
              <Link to="/sneakers?category=Sale" className="nav-item sale">Sale</Link>
            </li>
          </ul>

          {/* Icons */}
          <div className="navbar-icons">
            <button className="icon-btn search-toggle-btn" onClick={() => setSearchOpen(true)}>
              <Search size={20} />
            </button>
            
            <Link to="/wishlist" className="wishlist-nav-icon icon-btn" title="Wishlist">
              <Heart size={20} />
              {getWishlistCount() > 0 && (
                <span className="wishlist-badge">{getWishlistCount()}</span>
              )}
            </Link>

            {/* Admin: Add Product button */}
            {currentUser?.role === 'admin' && (
              <Link to="/add-product" className="btn-add-product" title="Add Product">
                <Plus size={16} />
                <span>Add Product</span>
              </Link>
            )}
            
            {currentUser ? (
              <div className="profile-menu-container" ref={profileRef}>
                <button 
                  className="icon-btn active-user"
                  onClick={() => setProfileOpen(!profileOpen)}
                >
                  <User size={20} />
                </button>
                
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div 
                      className="profile-dropdown glass-dark"
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="profile-header">
                        <div className="profile-avatar">
                          {currentUser.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="profile-info">
                          <p className="profile-name">{currentUser.name}</p>
                          <p className="profile-role">
                            {currentUser.role === 'admin' ? <><Shield size={12} /> Admin</> : 'Customer'}
                          </p>
                        </div>
                      </div>
                      <div className="profile-actions">
                        <button 
                          className="logout-btn"
                          onClick={() => {
                            logout();
                            addToast('You have successfully logged out.', 'info');
                            setProfileOpen(false);
                          }}
                        >
                          <LogOut size={16} /> Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/login"><button><User size={20} /></button></Link>
            )}

            {currentUser?.role !== 'admin' && (
              <Link to="/cart" className="cart-icon">
                <ShoppingCart size={20} />
                {getCartCount() > 0 && <span className="cart-badge">{getCartCount()}</span>}
              </Link>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              className="mobile-menu glass-dark"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'calc(100vh - var(--header-height))' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.ul
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={{
                  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
                  hidden: {}
                }}
              >
                {/* All */}
                <motion.li
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
                  }}
                >
                  <Link to="/sneakers" onClick={() => setMobileMenuOpen(false)}>All</Link>
                </motion.li>

                {['Men', 'Women', 'Sneakers', 'Sports', 'New Arrivals'].map((item) => (
                  <motion.li 
                    key={item}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
                    }}
                  >
                    <Link
                      to={`/sneakers?category=${encodeURIComponent(item)}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >{item}</Link>
                  </motion.li>
                ))}
                <motion.li 
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
                  }}
                >
                  <Link to="/sneakers?category=Sale" className="sale" onClick={() => setMobileMenuOpen(false)}>Sale</Link>
                </motion.li>

                {/* Admin: Add Product in mobile menu */}
                {currentUser?.role === 'admin' && (
                  <motion.li
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
                    }}
                  >
                    <Link
                      to="/add-product"
                      className="mobile-add-product"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Plus size={18} /> Add Product
                    </Link>
                  </motion.li>
                )}
              </motion.ul>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
};

export default Navbar;
