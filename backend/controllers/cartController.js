const CartItem = require('../models/CartItem');
const Product = require('../models/Product');

// Get all cart items for a user
exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id; // Assumes auth middleware sets req.user
    
    const cartItems = await CartItem.findAll({
      where: { userId },
      include: [{ model: Product }]
    });
    
    res.json(cartItems);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Server error fetching cart' });
  }
};

// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, size, quantity = 1 } = req.body;
    
    if (!productId || !size) {
      return res.status(400).json({ message: 'Product ID and size are required' });
    }

    // Check if item already exists
    let cartItem = await CartItem.findOne({
      where: { userId, productId, size }
    });

    if (cartItem) {
      cartItem.quantity += quantity;
      await cartItem.save();
    } else {
      cartItem = await CartItem.create({
        userId,
        productId,
        size,
        quantity
      });
    }

    // Fetch the added item with its product data
    const itemWithProduct = await CartItem.findByPk(cartItem.id, {
      include: [{ model: Product }]
    });

    res.status(201).json(itemWithProduct);
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Server error adding to cart' });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, size } = req.params; // Using params or query
    
    await CartItem.destroy({
      where: { userId, productId, size }
    });
    
    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ message: 'Server error removing from cart' });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user.id;
    
    await CartItem.destroy({
      where: { userId }
    });
    
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ message: 'Server error clearing cart' });
  }
};

// Sync local cart to backend
exports.syncCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { localItems } = req.body; // Array of { productId, size, quantity }
    
    if (!localItems || !Array.isArray(localItems)) {
      return res.status(400).json({ message: 'Invalid local items format' });
    }

    for (const item of localItems) {
      let cartItem = await CartItem.findOne({
        where: { userId, productId: item.productId, size: item.size }
      });

      if (cartItem) {
        // Option: add to existing quantity, or take the max, or overwrite. Let's just add for now.
        // Or if we sync perfectly, maybe just set it to item.quantity if it wasn't there.
        // Using max is safest to not duplicate items if they somehow synced twice.
        cartItem.quantity = Math.max(cartItem.quantity, item.quantity);
        await cartItem.save();
      } else {
        await CartItem.create({
          userId,
          productId: item.productId,
          size: item.size,
          quantity: item.quantity
        });
      }
    }

    // Return the updated cart
    const updatedCart = await CartItem.findAll({
      where: { userId },
      include: [{ model: Product }]
    });

    res.json(updatedCart);
  } catch (error) {
    console.error('Error syncing cart:', error);
    res.status(500).json({ message: 'Server error syncing cart' });
  }
};
