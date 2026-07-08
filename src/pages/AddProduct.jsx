import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductContext';
import { PackagePlus, X, Trash2, Star, Eye, GripVertical, UploadCloud } from 'lucide-react';
import { Reorder } from 'framer-motion';
import './AddProduct.css';

const CATEGORIES = ['Men', 'Women', 'Sneakers', 'Sports', 'New Arrivals', 'Sale'];
const BRANDS = ['Nike', 'Adidas', 'Puma', 'Converse', 'New Balance', 'Other'];
const SIZES = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

const CLOUDINARY_CLOUD  = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const CLOUDINARY_URL    = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`;

const initialForm = {
  name: '',
  brand: '',
  category: '',
  price: '',
  originalPrice: '',
  badge: '',
  description: '',
  sizes: [],
  images: [],
};

const AddProduct = () => {
  const { currentUser } = useAuth();
  const { addProduct } = useProducts();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  
  const [urlInput, setUrlInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [selectedPreviewId, setSelectedPreviewId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Redirect non-admins
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="add-product-page">
        <div className="container access-denied">
          <X size={48} className="denied-icon" />
          <h2>Access Denied</h2>
          <p>You need admin privileges to access this page.</p>
          <button className="btn btn-accent" onClick={() => navigate('/')}>Go Home</button>
        </div>
      </div>
    );
  }

  const validate = () => {
    const e = {};
    if (!form.name.trim())        e.name = 'Product name is required.';
    if (!form.brand)              e.brand = 'Please select a brand.';
    if (!form.category)           e.category = 'Please select a category.';
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0)
                                  e.price = 'Enter a valid price.';
    if (form.originalPrice && (isNaN(form.originalPrice) || Number(form.originalPrice) <= 0))
                                  e.originalPrice = 'Enter a valid original price.';
    if (!form.description.trim()) e.description = 'Description is required.';
    if (form.sizes.length === 0)  e.sizes = 'Select at least one size.';
    if (form.images.length === 0) e.images = 'At least one image is required.';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const toggleSize = (size) => {
    setForm(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size],
    }));
    if (errors.sizes) setErrors(prev => ({ ...prev, sizes: '' }));
  };

  const processFiles = async (files) => {
    const validFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (form.images.length + validFiles.length > 10) {
      setErrors(prev => ({ ...prev, images: '⚠ Maximum 10 images allowed.' }));
      return;
    }
    
    setIsUploading(true);
    
    for (const file of validFiles) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_PRESET);
      formData.append('cloud_name', CLOUDINARY_CLOUD);

      try {
        const response = await fetch('CLOUDINARY_URL', {
          method: 'POST',
          body: formData
        });
        const data = await response.json();
        
        if (data.secure_url) {
          const newImage = {
            id: Date.now().toString() + Math.random().toString(36).substring(2),
            url: data.secure_url,
            file: null,
            name: file.name,
            size: (file.size / 1024).toFixed(1) + ' KB',
            dimensions: `${data.width} × ${data.height}`,
            isMain: false,
            type: file.type,
            method: 'Cloudinary Upload'
          };
          
          setForm(prev => {
            const isFirst = prev.images.length === 0;
            if (isFirst) {
              newImage.isMain = true;
            }
            if (isFirst || !selectedPreviewId) {
              setSelectedPreviewId(newImage.id);
            }
            return { ...prev, images: [...prev.images, newImage] };
          });
          if (errors.images) setErrors(prev => ({ ...prev, images: '' }));
        }
      } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        setErrors(prev => ({ ...prev, images: '⚠ Error uploading image to Cloudinary.' }));
      }
    }
    setIsUploading(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const handleFileInput = (e) => {
    processFiles(e.target.files);
    e.target.value = ''; // Reset input
  };

  const handleAddUrl = (e) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    if (form.images.length >= 10) {
      setErrors(prev => ({ ...prev, images: '⚠ Maximum 10 images allowed.' }));
      return;
    }
    
    // Basic URL validation
    if (!urlInput.match(/^https?:\/\/.+/)) {
      setErrors(prev => ({ ...prev, images: '⚠ Invalid Image URL.' }));
      return;
    }
    
    const newImage = {
      id: Date.now().toString() + Math.random().toString(36).substring(2),
      url: urlInput.trim(),
      file: null,
      name: urlInput.split('/').pop() || 'URL Image',
      size: 'Unknown',
      dimensions: 'Unknown',
      isMain: false,
      type: 'image/*',
      method: 'URL'
    };
    
    setForm(prev => {
      const isFirst = prev.images.length === 0;
      if (isFirst) {
        newImage.isMain = true;
      }
      if (isFirst || !selectedPreviewId) {
        setSelectedPreviewId(newImage.id);
      }
      return { ...prev, images: [...prev.images, newImage] };
    });
    setUrlInput('');
    if (errors.images) setErrors(prev => ({ ...prev, images: '' }));
  };

  const handleRemoveImage = (id) => {
    setForm(prev => {
      let filtered = prev.images.filter(img => img.id !== id);
      if (filtered.length > 0 && !filtered.some(img => img.isMain)) {
        filtered[0].isMain = true;
      }
      return { ...prev, images: filtered };
    });
    if (selectedPreviewId === id) {
      setSelectedPreviewId(form.images.find(img => img.id !== id)?.id || null);
    }
  };

  const handleSetMain = (id) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.map(img => ({ ...img, isMain: img.id === id }))
    }));
  };
  
  const handleReorder = (reorderedImages) => {
    setForm(prev => ({ ...prev, images: reorderedImages }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isUploading) return;
    const e_ = validate();
    if (Object.keys(e_).length) { setErrors(e_); return; }
    addProduct(form);
    setSubmitted(true);
  };

  const selectedPreview = form.images.find(img => img.id === selectedPreviewId) || form.images[0];

  if (submitted) {
    return (
      <div className="add-product-page">
        <div className="container success-state">
          <div className="success-icon">✓</div>
          <h2>Product Added!</h2>
          <p>
            <strong>{form.name}</strong> is now live in the{' '}
            <strong>{form.category}</strong> category.
          </p>
          <div className="success-actions">
            <button className="btn btn-accent" onClick={() => { setForm(initialForm); setSubmitted(false); }}>
              Add Another
            </button>
            <button
              className="btn btn-outline"
              onClick={() => navigate(`/sneakers?category=${encodeURIComponent(form.category)}`)}
            >
              View in {form.category} →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="add-product-page">
      <div className="container add-product-container">

        <div className="add-product-header">
          <PackagePlus size={28} className="header-icon" />
          <div>
            <h1>Add New Product</h1>
            <p>Fill in the details below to list a new product.</p>
          </div>
        </div>

        <form className="add-product-form" onSubmit={handleSubmit} noValidate>

          <div className="form-grid">
            {/* Left column */}
            <div className="form-col">

              <div className={`form-group ${errors.name ? 'has-error' : ''}`}>
                <label>Product Name <span className="required">*</span></label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Air Max 270"
                />
                {errors.name && <span className="error-msg">{errors.name}</span>}
              </div>

              <div className="form-row">
                <div className={`form-group ${errors.brand ? 'has-error' : ''}`}>
                  <label>Brand <span className="required">*</span></label>
                  <select name="brand" value={form.brand} onChange={handleChange}>
                    <option value="">Select brand</option>
                    {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                  {errors.brand && <span className="error-msg">{errors.brand}</span>}
                </div>

                <div className={`form-group ${errors.category ? 'has-error' : ''}`}>
                  <label>Category <span className="required">*</span></label>
                  <select name="category" value={form.category} onChange={handleChange}>
                    <option value="">Select category</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.category && <span className="error-msg">{errors.category}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className={`form-group ${errors.price ? 'has-error' : ''}`}>
                  <label>Price (₹) <span className="required">*</span></label>
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="e.g. 129"
                    min="0"
                  />
                  {errors.price && <span className="error-msg">{errors.price}</span>}
                </div>

                <div className={`form-group ${errors.originalPrice ? 'has-error' : ''}`}>
                  <label>Original Price (₹)</label>
                  <input
                    type="number"
                    name="originalPrice"
                    value={form.originalPrice}
                    onChange={handleChange}
                    placeholder="e.g. 180 (optional)"
                    min="0"
                  />
                  {errors.originalPrice && <span className="error-msg">{errors.originalPrice}</span>}
                </div>
              </div>

              <div className="form-group">
                <label>Badge <span className="optional">(optional)</span></label>
                <input
                  type="text"
                  name="badge"
                  value={form.badge}
                  onChange={handleChange}
                  placeholder="e.g. New, Trending, Sale"
                />
              </div>

              <div className={`form-group ${errors.description ? 'has-error' : ''}`}>
                <label>Description <span className="required">*</span></label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe the product..."
                />
                {errors.description && <span className="error-msg">{errors.description}</span>}
              </div>
              
              <div className={`form-group ${errors.sizes ? 'has-error' : ''}`}>
                <label>Available Sizes <span className="required">*</span></label>
                <div className="size-picker">
                  {SIZES.map(size => (
                    <button
                      key={size}
                      type="button"
                      className={`size-option ${form.sizes.includes(size) ? 'selected' : ''}`}
                      onClick={() => toggleSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {errors.sizes && <span className="error-msg">{errors.sizes}</span>}
              </div>

            </div>

            {/* Right column - IMAGE MANAGER */}
            <div className="form-col image-manager-col">
              <div className={`form-group image-manager-group ${errors.images ? 'has-error' : ''}`}>
                <label className="section-title">Product Images <span className="required">*</span></label>
                <p className="image-manager-helper">
                  Upload high-quality product images.<br />
                  Supported: JPG, PNG, WEBP &nbsp;|&nbsp; Maximum: 10 Images &nbsp;|&nbsp; Recommended Resolution: 1200 × 1200 px
                </p>
                
                {errors.images && <div className="error-msg validation-banner">{errors.images}</div>}

                {/* Upload Methods */}
                {isUploading && (
                  <div style={{ padding: '10px', background: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px', marginBottom: '15px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.2)' }}>
                    Uploading to Cloudinary...
                  </div>
                )}
                <div className={`upload-methods ${isUploading ? 'uploading' : ''}`} style={{ opacity: isUploading ? 0.6 : 1, pointerEvents: isUploading ? 'none' : 'auto' }}>
                  <div 
                    className={`drag-drop-zone ${isDragging ? 'dragging' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <UploadCloud size={32} className="upload-icon" />
                    <p className="upload-title">+ Upload Images</p>
                    <p className="upload-desc">Drag & Drop Images Here</p>
                    <p className="upload-or">or</p>
                    <label className="browse-btn">
                      Browse Files
                      <input type="file" accept="image/*" multiple onChange={handleFileInput} style={{ display: 'none' }} />
                    </label>
                  </div>

                  <div className="divider-or">──────────── OR ────────────</div>

                  <div className="url-upload-zone">
                    <label>Image URL</label>
                    <div className="url-input-wrap">
                      <input 
                        type="text" 
                        placeholder="https://example.com/shoe-image.jpg" 
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                      />
                      <button type="button" className="btn-add-url" onClick={handleAddUrl}>Add Image</button>
                    </div>
                    <p className="helper-text">Paste any publicly accessible image URL.</p>
                  </div>
                </div>

                {/* Uploaded Images Gallery */}
                {form.images.length > 0 ? (
                  <div className="gallery-section">
                    <div className="gallery-header">
                      <div className="image-counter">
                        <span>{form.images.length} / 10 Images Uploaded</span>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${(form.images.length / 10) * 100}%` }}></div>
                        </div>
                      </div>
                    </div>

                    <Reorder.Group axis="y" values={form.images} onReorder={handleReorder} className="image-gallery-grid">
                      {form.images.map((img) => (
                        <Reorder.Item key={img.id} value={img} className={`gallery-item ${img.isMain ? 'is-main' : ''} ${selectedPreviewId === img.id ? 'is-selected' : ''}`}>
                          <div className="gallery-item-inner">
                            {img.isMain && <div className="main-badge">⭐ Main</div>}
                            <img src={img.url} alt={img.name} />
                            
                            <div className="item-overlay">
                              <div className="drag-handle"><GripVertical size={16} /></div>
                              <div className="action-buttons">
                                <button type="button" onClick={() => setSelectedPreviewId(img.id)} title="Preview"><Eye size={16} /></button>
                                {!img.isMain && <button type="button" onClick={() => handleSetMain(img.id)} title="Set as Main"><Star size={16} /></button>}
                                <label className="replace-btn" title="Replace">
                                  <UploadCloud size={16} />
                                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={async (e) => {
                                    if(e.target.files[0]) {
                                      const file = e.target.files[0];
                                      const formData = new FormData();
                                      formData.append('file', file);
                                      formData.append('upload_preset', CLOUDINARY_PRESET);
                                      formData.append('cloud_name', CLOUDINARY_CLOUD);
                                      
                                      setIsUploading(true);
                                      try {
                                        const res = await fetch('CLOUDINARY_URL', {
                                          method: 'POST',
                                          body: formData
                                        });
                                        const data = await res.json();
                                        if (data.secure_url) {
                                          setForm(prev => ({
                                            ...prev,
                                            images: prev.images.map(i => i.id === img.id ? {...i, url: data.secure_url, method: 'Cloudinary Upload'} : i)
                                          }));
                                        }
                                      } catch (err) {
                                        console.error('Error uploading to Cloudinary:', err);
                                      } finally {
                                        setIsUploading(false);
                                      }
                                    }
                                  }} />
                                </label>
                                <button type="button" onClick={() => handleRemoveImage(img.id)} className="delete-btn" title="Delete"><Trash2 size={16} /></button>
                              </div>
                            </div>
                          </div>
                        </Reorder.Item>
                      ))}
                    </Reorder.Group>

                    {/* Large Preview */}
                    {selectedPreview && (
                      <div className="large-preview-section">
                        <div className="preview-divider">────────────────────────────</div>
                        <h4 className="preview-title">Selected Image</h4>
                        <div className="large-preview-box">
                          <img src={selectedPreview.url} alt="Large Preview" />
                        </div>
                        <div className="preview-divider">────────────────────────────</div>
                        
                        <div className="image-info">
                          <div className="info-row"><span>File Name</span> <strong>{selectedPreview.name}</strong></div>
                          <div className="info-row"><span>Dimensions</span> <strong>{selectedPreview.dimensions}</strong></div>
                          <div className="info-row"><span>Size</span> <strong>{selectedPreview.size}</strong></div>
                          <div className="info-row"><span>Upload Method</span> <strong>{selectedPreview.method}</strong></div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="empty-state">
                    <span className="empty-icon">🖼</span>
                    <h3>No Images Uploaded Yet</h3>
                    <p>Upload from your computer<br/>or<br/>Paste an Image URL</p>
                    <p className="empty-sub">Images will appear here.</p>
                  </div>
                )}
                
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={() => navigate('/sneakers')}>
              Cancel
            </button>
            <button type="submit" className="btn btn-accent" disabled={isUploading}>
              <PackagePlus size={18} /> {isUploading ? 'Uploading...' : 'Publish Product'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddProduct;
