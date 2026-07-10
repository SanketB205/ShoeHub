import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import './WhatsAppOrderModal.css';

const WhatsAppOrderModal = ({ isOpen, onClose, product, selectedSize }) => {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    city: '',
    size: selectedSize || '',
    note: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update size in form if selectedSize changes from parent
  useEffect(() => {
    if (selectedSize) {
      setFormData(prev => ({ ...prev, size: selectedSize }));
    }
  }, [selectedSize]);

  // Reset form when modal opens
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
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Please enter your name.';
    if (!formData.mobile.trim()) newErrors.mobile = 'Please enter your mobile number.';
    if (!formData.city.trim()) newErrors.city = 'Please enter your city.';
    if (!formData.size) newErrors.size = 'Please select a shoe size.';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    const adminNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '917057130039';
    
    const productImageUrl = product.images && product.images.length > 0 
      ? product.images[0].url || product.images[0] 
      : product.img;

    const message = `🛍️ New Shoe Order Request

👤 Customer:
${formData.name}

📱 Mobile:
${formData.mobile}

🏙️ City:
${formData.city}

👟 Product:
${product.name}

📏 Size:
${formData.size}

🎨 Color:
${product.color || 'As shown'}

💰 Price:
₹${product.price ? product.price.toLocaleString('en-IN') : 'N/A'}
(Price Negotiable)

📸 Product Image:
${productImageUrl}

🔗 Product Link:
${window.location.href}

📝 Note:
${formData.note || 'None'}

Please contact me regarding this order.`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${adminNumber}?text=${encodedMessage}`;
    
    // Simulate slight delay for loading state
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
            <label>Delivery City *</label>
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
            <label>Shoe Size *</label>
            <select 
              name="size" 
              value={formData.size} 
              onChange={handleChange}
              className={errors.size ? 'error' : ''}
            >
              <option value="">Select Size</option>
              {(product.sizes && product.sizes.length > 0 ? product.sizes : [6,7,8,9,10]).map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
            {errors.size && <span className="error-text">{errors.size}</span>}
          </div>
          
          <div className="form-group">
            <label>Additional Notes (Optional)</label>
            <textarea 
              name="note" 
              value={formData.note} 
              onChange={handleChange} 
              placeholder="Any specific requests?"
              rows="3"
            />
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

export default WhatsAppOrderModal;
