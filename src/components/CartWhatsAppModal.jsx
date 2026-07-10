import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './WhatsAppOrderModal.css';

const CartWhatsAppModal = ({ isOpen, onClose }) => {
  const { cartItems, getCartCount } = useCart();
  
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    city: '',
    address: '',
    pincode: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Please enter your name.';
    if (!formData.mobile.trim()) newErrors.mobile = 'Please enter your mobile number.';
    if (!formData.city.trim()) newErrors.city = 'Please enter your city.';
    if (!formData.address.trim()) newErrors.address = 'Please enter your address.';
    if (!formData.pincode.trim()) newErrors.pincode = 'Please enter your pincode.';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    const adminNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '917057130039';
    
    const subtotal = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
    const cartCount = getCartCount();

    let itemsText = '';
    const numberEmojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

    cartItems.forEach((item, index) => {
      const emoji = index < 10 ? numberEmojis[index] : `${index + 1}️⃣`;
      const productImageUrl = item.product.images && item.product.images.length > 0 
        ? item.product.images[0].url || item.product.images[0] 
        : item.product.img;

      itemsText += `${emoji} ${item.product.name}

📏 Size: UK ${item.size}
🔢 Quantity: ${item.quantity}
💰 Price: ₹${item.product.price.toLocaleString('en-IN')}
🖼️ Image:
${productImageUrl}

──────────────────────
`;
    });

    const message = `🛍️ *NEW SHOE ORDER REQUEST*

━━━━━━━━━━━━━━━━━━━━━━

👤 *Customer Details*

• Name: ${formData.name}
• Mobile: ${formData.mobile}
• City: ${formData.city}
• Address: ${formData.address}
• Pincode: ${formData.pincode}

━━━━━━━━━━━━━━━━━━━━━━

🛒 *Order Items*

${itemsText}
━━━━━━━━━━━━━━━━━━━━━━

📦 *Order Summary*

Total Products: ${cartItems.length}
Total Quantity: ${cartCount}

Subtotal: ₹${subtotal.toLocaleString('en-IN')}
Shipping: FREE
Grand Total: ₹${subtotal.toLocaleString('en-IN')}

━━━━━━━━━━━━━━━━━━━━━━`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${adminNumber}?text=${encodedMessage}`;
    
    setTimeout(() => {
      window.open(whatsappUrl, '_blank');
      setIsSubmitting(false);
      onClose();
    }, 600);
  };

  return (
    <div className="whatsapp-modal-overlay">
      <div className="whatsapp-modal-content">
        <button className="whatsapp-modal-close" onClick={onClose} aria-label="Close">
          <X size={24} />
        </button>
        
        <h2 className="whatsapp-modal-title">Complete Your Order</h2>
        
        <div className="whatsapp-modal-body">
          <div className="form-group">
            <label>Customer Name *</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              placeholder="Enter your name"
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>
          
          <div className="form-group">
            <label>Mobile Number *</label>
            <input 
              type="tel" 
              name="mobile" 
              value={formData.mobile} 
              onChange={handleChange} 
              placeholder="Enter your mobile number"
              className={errors.mobile ? 'error' : ''}
            />
            {errors.mobile && <span className="error-text">{errors.mobile}</span>}
          </div>
          
          <div className="form-group">
            <label>City *</label>
            <input 
              type="text" 
              name="city" 
              value={formData.city} 
              onChange={handleChange} 
              placeholder="Enter your city"
              className={errors.city ? 'error' : ''}
            />
            {errors.city && <span className="error-text">{errors.city}</span>}
          </div>

          <div className="form-group">
            <label>Address *</label>
            <textarea 
              name="address" 
              value={formData.address} 
              onChange={handleChange} 
              placeholder="Enter your full address"
              rows="2"
              className={errors.address ? 'error' : ''}
            />
            {errors.address && <span className="error-text">{errors.address}</span>}
          </div>

          <div className="form-group">
            <label>Pincode *</label>
            <input 
              type="text" 
              name="pincode" 
              value={formData.pincode} 
              onChange={handleChange} 
              placeholder="Enter your pincode"
              className={errors.pincode ? 'error' : ''}
            />
            {errors.pincode && <span className="error-text">{errors.pincode}</span>}
          </div>
          
        </div>
        
        <div className="whatsapp-modal-footer">
          <button className="btn-cancel" onClick={onClose} disabled={isSubmitting}>Cancel</button>
          <button className="btn-continue" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Processing...' : 'Continue to WhatsApp'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartWhatsAppModal;
