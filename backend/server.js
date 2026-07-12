const express = require('express');
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./config/database');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const cartRoutes = require('./routes/cartRoutes');

const User = require('./models/User');
const Product = require('./models/Product');
const CartItem = require('./models/CartItem');

// Define Associations
User.hasMany(CartItem, { foreignKey: 'userId' });
CartItem.belongsTo(User, { foreignKey: 'userId' });

Product.hasMany(CartItem, { foreignKey: 'productId' });
CartItem.belongsTo(Product, { foreignKey: 'productId' });

const app = express();
const PORT = process.env.PORT || 5000;

// Parse allowed origins — supports comma-separated list in CORS_ORIGIN
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map(o => o.trim());

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cart', cartRoutes);

// Connect to database, sync models, then start server
sequelize.authenticate()
  .then(() => {
    console.log('[Database] Connection established successfully.');
    return sequelize.sync({ alter: false }); // alter:false = safe — won't drop columns
  })
  .then(() => {
    console.log('[Database] Models synchronized. Tables are ready.');
    app.listen(PORT, () => {
      console.log(`[Server] Running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('[Database] Unable to connect:', err.message);
    process.exit(1);
  });
