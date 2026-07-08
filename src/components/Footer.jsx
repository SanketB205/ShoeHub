import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer bg-primary">
      <div className="container footer-container">
        <div className="footer-col brand-col">
          <h2 className="footer-logo">Shoe Hub<span className="dot">.</span></h2>
          <p>Premium footwear for every step you take. Style, comfort, and performance designed for the modern individual.</p>
          <div className="social-links">
            <a href="#">Ig</a>
            <a href="#">Fb</a>
            <a href="#">Tw</a>
            <a href="#">Yt</a>
          </div>
        </div>

        <div className="footer-col links-col">
          <h3>Shop</h3>
          <ul>
            <li><a href="#">Men's Shoes</a></li>
            <li><a href="#">Women's Shoes</a></li>
            <li><a href="#">Running</a></li>
            <li><a href="#">Basketball</a></li>
            <li><a href="#">Sale</a></li>
          </ul>
        </div>

        <div className="footer-col links-col">
          <h3>Support</h3>
          <ul>
            <li><a href="#">Help Center</a></li>
            <li><a href="#">Track Order</a></li>
            <li><a href="#">Returns & Exchanges</a></li>
            <li><a href="#">Size Guide</a></li>
            <li><a href="#">Contact Us</a></li>
          </ul>
        </div>

        <div className="footer-col links-col">
          <h3>Company</h3>
          <ul>
            <li><a href="#">About Us</a></li>
            <li><a href="#">Careers</a></li>
            <li><a href="#">Sustainability</a></li>
            <li><a href="#">Press</a></li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom container">
        <p>&copy; {new Date().getFullYear()} Shoe Hub. All rights reserved.</p>
        
      </div>
    </footer>
  );
};

export default Footer;
