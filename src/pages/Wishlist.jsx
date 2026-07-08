import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2 } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import './Wishlist.css';

const Wishlist = () => {
  const { wishlist, toggle } = useWishlist();

  return (
    <div className="wishlist-page">
      <div className="container wishlist-container">
        <div className="wishlist-header">
          <Heart size={26} className="wishlist-header-icon" fill="#d4af37" color="#d4af37" />
          <h1>My Wishlist</h1>
          <span className="wishlist-count">{wishlist.length} item{wishlist.length !== 1 ? 's' : ''}</span>
        </div>

        {wishlist.length === 0 ? (
          <div className="wishlist-empty">
            <Heart size={56} color="#333" />
            <h2>Your wishlist is empty</h2>
            <p>Save your favourite products here to come back to them later.</p>
            <Link to="/sneakers" className="btn btn-accent">Browse Products</Link>
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlist.map(product => (
              <div key={product.id} className="wishlist-card">
                <Link to={`/product/${product.id}`} className="wishlist-img-link">
                  <img src={product.img} alt={product.name} />
                </Link>
                <div className="wishlist-info">
                  <span className="wishlist-brand">{product.brand}</span>
                  <h3 className="wishlist-name">
                    <Link to={`/product/${product.id}`}>{product.name}</Link>
                  </h3>
                  <span className="wishlist-price">₹{Number(product.price).toLocaleString('en-IN')}</span>
                </div>
                <button
                  className="wishlist-remove"
                  onClick={() => toggle(product)}
                  title="Remove from wishlist"
                  aria-label="Remove from wishlist"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
