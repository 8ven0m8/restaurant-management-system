const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = 4000;

// Database Connection
mongoose.connect('mongodb://localhost:27017/restaurant_management_system')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Models
const User = require('./models/User');
const MenuItem = require('./models/MenuItem');
const Order = require('./models/Order');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// User Authentication
app.post('/api/register', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    
    // Validation
    if (!email || !password || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const user = new User({ email, password, role });
    await user.save();
    res.status(201).json({ message: 'Registration successful' });

  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'Account not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid password' });

    res.json({ role: user.role });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Menu Management
app.get('/api/menu', async (req, res) => {
  try {
    const items = await MenuItem.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
});

app.post('/api/menu', async (req, res) => {
  try {
    const newItem = new MenuItem({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      imageUrl: req.body.imageUrl
    });
    
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create menu item' });
  }
});

app.delete('/api/menu/:id', async (req, res) => {
  try {
    await MenuItem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete item' });
  }
});

// Order Management
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find({ status: { $ne: 'completed' } })
      .populate('items.itemId')
      .sort({ createdAt: 1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

app.get('/api/orders/completed', async (req, res) => {
  try {
    const orders = await Order.find({ status: 'completed' })
      .populate('items.itemId')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch completed orders' });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const newOrder = new Order({
      tableNumber: req.body.tableNumber,
      items: req.body.items
    });
    
    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create order' });
  }
});

app.patch('/api/orders/:id/complete', async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { 
                status: 'completed',
                completedAt: new Date() // Add completion timestamp
            },
            { new: true }
        );
        res.json(order);
    } catch (error) {
        res.status(400).json({ error: 'Failed to complete order' });
    }
});

app.patch('/api/orders/:id/pay', async (req, res) => {
  try {
      const order = await Order.findByIdAndUpdate(
          req.params.id,
          { paid: true },
          { new: true }
      );
      res.json(order);
  } catch (error) {
      res.status(400).json({ error: 'Payment failed' });
  }
});

// Server Start
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
