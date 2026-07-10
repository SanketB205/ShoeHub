const { Op } = require('sequelize');
const Product = require('../models/Product');

// ── Paginated product list ───────────────────────────────────────
exports.getProducts = async (req, res) => {
  try {
    const {
      page     = 1,
      limit    = 12,
      category,
      brand,
      search,
      sort     = 'newest',
      minPrice,
      maxPrice,
    } = req.query;

    const pageNum  = Math.max(1, parseInt(page,  10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 12));
    const offset   = (pageNum - 1) * limitNum;

    // ── WHERE clause ──────────────────────────────────────────────
    const where = {};

    if (category && category !== 'All') {
      where.category = category;
    }

    if (brand) {
      // support comma-separated brands
      const brands = brand.split(',').map(b => b.trim()).filter(Boolean);
      if (brands.length === 1) {
        where.brand = brands[0];
      } else if (brands.length > 1) {
        where.brand = { [Op.in]: brands };
      }
    }

    if (search) {
      const q = `%${search}%`;
      where[Op.or] = [
        { name:        { [Op.like]: q } },
        { brand:       { [Op.like]: q } },
        { category:    { [Op.like]: q } },
        { description: { [Op.like]: q } },
      ];
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice !== undefined) where.price[Op.lte] = parseFloat(maxPrice);
    }

    // ── ORDER clause ──────────────────────────────────────────────
    let order;
    switch (sort) {
      case 'price-asc':  order = [['price', 'ASC']];       break;
      case 'price-desc': order = [['price', 'DESC']];      break;
      default:           order = [['createdAt', 'DESC']];  break; // newest
    }

    // ── Query ─────────────────────────────────────────────────────
    const { count, rows } = await Product.findAndCountAll({
      where,
      order,
      limit:  limitNum,
      offset,
    });

    const totalPages = Math.ceil(count / limitNum);

    res.json({
      products:        rows,
      currentPage:     pageNum,
      totalPages,
      totalProducts:   count,
      productsPerPage: limitNum,
      hasNextPage:     pageNum < totalPages,
      hasPreviousPage: pageNum > 1,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Server error fetching products' });
  }
};

// ── Single product ────────────────────────────────────────────────
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Server error fetching product' });
  }
};

// ── Create ────────────────────────────────────────────────────────
exports.createProduct = async (req, res) => {
  try {
    const newProduct = await Product.create(req.body);
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Server error creating product' });
  }
};

// ── Update ────────────────────────────────────────────────────────
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    await product.update(req.body);
    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Server error updating product' });
  }
};

// ── Delete ────────────────────────────────────────────────────────
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    await product.destroy();
    res.json({ message: 'Product deleted' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Server error deleting product' });
  }
};
