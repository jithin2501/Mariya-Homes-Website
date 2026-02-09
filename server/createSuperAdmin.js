const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const createSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Check if superadmin already exists
    const existingSuperAdmin = await User.findOne({ 
      username: process.env.REACT_APP_ADMIN_USERNAME 
    });
    
    if (existingSuperAdmin) {
      console.log('Superadmin already exists');
      process.exit(0);
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(process.env.REACT_APP_ADMIN_PASSWORD, salt);
    
    // Create superadmin
    const superAdmin = new User({
      username: process.env.REACT_APP_ADMIN_USERNAME,
      password: hashedPassword,
      role: 'superadmin',
      createdBy: 'system'
    });
    
    await superAdmin.save();
    console.log('Superadmin created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating superadmin:', error);
    process.exit(1);
  }
};

createSuperAdmin();