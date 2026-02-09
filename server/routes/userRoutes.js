const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');

/**
 * Middleware to check if user is superadmin.
 * Must be used AFTER the 'auth' middleware.
 */
const checkSuperAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'superadmin') {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied. Superadmin rights required.' });
  }
};

// --- AUTHENTICATION ---

// Login user and get token
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    // Check if account is active
    if (!user.isActive) return res.status(403).json({ message: 'Account is deactivated. Contact superadmin.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1d' }
    );

    res.json({ token, user: { username: user.username, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// --- USER MANAGEMENT ---

// Get all users
router.get('/users', auth, checkSuperAdmin, async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new admin user
router.post('/users', auth, checkSuperAdmin, async (req, res) => {
  try {
    const { username, password } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: 'Username already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username, password: hashedPassword, role: 'admin', createdBy: req.user.username 
    });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user last login
router.patch('/users/:username/last-login', auth, async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { username: req.params.username },
      { lastLogin: new Date() },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle user activation status
router.patch('/users/:username/toggle-status', auth, checkSuperAdmin, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'superadmin') return res.status(400).json({ message: 'Cannot deactivate superadmin' });

    user.isActive = !user.isActive;
    await user.save();
    res.json({ isActive: user.isActive });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user
router.delete('/users/:username', auth, checkSuperAdmin, async (req, res) => {
  try {
    const { username } = req.params;
    if (username === req.user.username) return res.status(400).json({ message: 'Cannot delete yourself' });
    const user = await User.findOneAndDelete({ username, role: 'admin' });
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;