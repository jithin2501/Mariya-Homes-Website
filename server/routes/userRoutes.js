const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  loginUser,
  getAllUsers,
  createUser,
  updateLastLogin,
  toggleUserStatus,
  deleteUser,
} = require('../controllers/userController');

const checkSuperAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'superadmin') {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied. Superadmin rights required.' });
  }
};

router.post('/login', loginUser);

router.get('/users',                              auth, checkSuperAdmin, getAllUsers);
router.post('/users',                             auth, checkSuperAdmin, createUser);
router.patch('/users/:username/last-login',       auth,                  updateLastLogin);
router.patch('/users/:username/toggle-status',    auth, checkSuperAdmin, toggleUserStatus);
router.delete('/users/:username',                 auth, checkSuperAdmin, deleteUser);

module.exports = router;