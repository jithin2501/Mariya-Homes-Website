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

/**
 * @route POST /api/admin/login
 * @desc Login user and get token
 */router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log("Login attempt for:", username); // Debugging

    const user = await User.findOne({ username });
    if (!user) {
      console.log("User not found"); // Debugging
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // DEBUG: Check if the password field exists
    if (!user.password) {
      console.error("CRITICAL: User document is missing 'password' field. Check your DB.");
      return res.status(500).json({ message: 'Database schema mismatch' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1d' }
    );

    res.json({ token, user: { username: user.username, role: user.role } });
  } catch (error) {
    console.error("LOGIN ERROR:", error); // This will show the exact error in your terminal
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// --- USER MANAGEMENT (PROTECTED) ---

// Get all users - Requires Authentication AND SuperAdmin role
router.get('/users', auth, checkSuperAdmin, async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new admin user
router.post('/users', auth, checkSuperAdmin, async (req, res) => {
  try {
    const { username, password } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      password: hashedPassword,
      role: 'admin',
      createdBy: req.user.username 
    });

    await newUser.save();

    const userResponse = newUser.toObject();
    delete userResponse.password;

    res.status(201).json(userResponse);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete user
router.delete('/users/:username', auth, checkSuperAdmin, async (req, res) => {
  try {
    const { username } = req.params;

    if (username === process.env.REACT_APP_ADMIN_USERNAME || username === req.user.username) {
      return res.status(400).json({ message: 'Cannot delete superadmin accounts' });
    }

    const user = await User.findOneAndDelete({ username, role: 'admin' });

    if (!user) {
      return res.status(404).json({ message: 'User not found or is not a standard admin' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;