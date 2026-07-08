import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ArrowRight, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Home.css';

// Using local generated high-quality sneaker
const HERO_SNEAKER = '/hero_sneaker.png';
const SMALL_SNEAKER = '/hero_sneaker.png';

// Keep the others for the rest of the page
const MENS_COL_IMG = 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
const WOMENS_COL_IMG = 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

const AnimatedSection = ({ children, className }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  return (
    <motion.section
      ref={ref}
      animate={controls}
      initial="hidden"
      variants={{
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
        hidden: { opacity: 0, y: 50 }
      }}
      className={className}
    >
      {children}
    </motion.section>
  );
};

const Home = () => {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-container container">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="hero-text-content"
          >
            <span className="hero-subtitle">NEW COLLECTION 2026</span>
            <h1 className="hero-title">Step Into<br />Style & Comfort</h1>
            <p className="hero-desc">Discover the latest premium footwear collection designed for performance and everyday elegance.</p>
            <div className="hero-actions">
              <Link to="/sneakers" className="btn btn-gold">
                Shop Now <ArrowRight size={18} className="ml-2" />
              </Link>
              <button className="btn btn-play-wrap">
                <span className="play-circle"><Play size={14} fill="#fff" /></span>
                Explore Collection
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1.2, delay: 0.4 }}
            className="hero-image-content"
          >
            <div className="hero-glow"></div>
            <img src={HERO_SNEAKER} alt="Luxury Sneaker" className="main-sneaker" />
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="floating-card glass-dark"
            >
              <img src={SMALL_SNEAKER} alt="Air Max Pulse" className="small-sneaker" />
              <div className="card-info">
                <h4>Air Max Pulse</h4>
                <p>Premium</p>
                <span>₹6999.00</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Strip */}
      <div className="benefits-strip">
        <div className="container benefits-container">
          <div className="benefit-item">
            <h4>Free Shipping</h4>
            <p>On all orders over ₹150</p>
          </div>
          <div className="benefit-item">
            <h4>Negotiable Price</h4>
            <p>Tentitive prices, contact for best Price</p>
          </div>
          <div className="benefit-item">
            <h4>Secure Contact</h4>
            <p>100% secure Contact</p>
          </div>
          <div className="benefit-item">
            <h4>Premium Quality</h4>
            <p>Only original products</p>
          </div>
        </div>
      </div>

      {/* Featured Collections */}
      <AnimatedSection className="featured-collections container section-padding">
        <div className="section-header">
          <h2 className="section-title">Featured Collections</h2>
          <Link to="/sneakers" className="view-all">View All <ArrowRight size={16} /></Link>
        </div>
        <div className="collection-grid">
          <Link to="/sneakers" className="collection-card">
            <img src={MENS_COL_IMG} alt="Men's Collection" />
            <div className="collection-info">
              <h3>Men's Collection</h3>
              <span className="explore-link">Explore <ArrowRight size={16} /></span>
            </div>
          </Link>
          <Link to="/sneakers" className="collection-card">
            <img src={WOMENS_COL_IMG} alt="Women's Collection" />
            <div className="collection-info">
              <h3>Women's Collection</h3>
              <span className="explore-link">Explore <ArrowRight size={16} /></span>
            </div>
          </Link>
          <div className="collection-card smaller-cards">
            <Link to="/sneakers" className="sub-collection bg-dark">
              <div className="sub-content">
                <h3>Running</h3>
                <span>Explore</span>
              </div>
            </Link>
            <Link to="/sneakers" className="sub-collection bg-accent">
              <div className="sub-content">
                <h3>Limited Edition</h3>
                <span>Explore</span>
              </div>
            </Link>
          </div>
        </div>
      </AnimatedSection>
      
      {/* Newsletter */}
      <AnimatedSection className="newsletter section-padding">
        <div className="container newsletter-container">
          <div className="newsletter-content glass-dark">
            <h2>Join Our Exclusive List</h2>
            <p>Get early access to new collections, limited drops, and exclusive offers.</p>
            <form className="newsletter-form">
              <input type="email" placeholder="Enter your email address" required />
              <button type="submit" className="btn btn-accent">Subscribe</button>
            </form>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
};

export default Home;
