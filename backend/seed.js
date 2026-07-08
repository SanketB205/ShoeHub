const sequelize = require('./config/database');
const Product = require('./models/Product');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const SEED_PRODUCTS = [
  { name: 'Air Max 270', brand: 'Nike', price: 129, rating: 4.8, img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', badge: 'New', category: 'Men', sizes: [6,7,8,9,10] },
  { name: 'Ultraboost 22', brand: 'Adidas', price: 159, rating: 4.9, img: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', badge: 'Trending', category: 'Men', sizes: [7,8,9,10,11] },
  { name: 'RS-X Reinvent', brand: 'Puma', price: 110, rating: 4.5, img: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', badge: '', category: 'Women', sizes: [5,6,7,8] },
  { name: 'Chuck 70', brand: 'Converse', price: 85, rating: 4.6, img: 'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', badge: 'Sale', category: 'Sale', sizes: [4,5,6,7,8,9] },
  { name: '9060', brand: 'New Balance', price: 149, rating: 4.7, img: 'https://images.unsplash.com/photo-1539185441755-769473a23570?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', badge: '', category: 'Sneakers', sizes: [8,9,10,11] },
  { name: 'Air Force 1', brand: 'Nike', price: 115, rating: 4.9, img: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', badge: 'Bestseller', category: 'New Arrivals', sizes: [6,7,8,9,10,11] },
];

const seedDB = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true }); // Reset DB
    await Product.bulkCreate(SEED_PRODUCTS);
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    await User.create({
      name: 'Admin',
      email: 'admin@shoehub.com',
      password: hashedPassword,
      role: 'admin'
    });
    
    console.log('Database seeded successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed database:', error);
    process.exit(1);
  }
};

seedDB();
