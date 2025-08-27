

// module.exports = { register, login };
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Session = require('../models/Session');
const { generateToken } = require('../utils/jwt');

/**
 * @desc Register a new user
 * @route POST /api/auth/register
 */
const register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      auth_type: 'manual',
    });

    // Generate JWT token
    const token = generateToken(user);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        is_blocked: user.is_blocked,
      },
    });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * @desc Login user with email & password
 * @route POST /api/auth/login
 */
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if user is blocked
    if (user.is_blocked === true) {
      return res.status(403).json({ message: 'You are blocked for policy violations.' });
    }

    // Compare password
    if (!user.password) {
      return res.status(400).json({ message: 'Invalid credentials or account created via social login' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = generateToken(user);

    // Create session
    await Session.create({ user_id: user.id, token });

    res.status(200).json({
      message: 'Logged in successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        is_blocked: user.is_blocked,
      },
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



/**
 * @desc Update user profile
 * @route PUT /api/auth/update
 */
const updateProfile = async (req, res) => {
  const { fullname, email, password, phone, location } = req.body;
  const userId = req.user.id; // Assuming user ID is available from authentication middleware

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updateFields = {};
    if (fullname) updateFields.username = fullname;
    if (email) {
      const existingUser = await User.findByEmail(email);
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      updateFields.email = email;
    }
    if (password) {
      updateFields.password = await bcrypt.hash(password, 10);
    }
    if (phone) updateFields.phone = phone;
    if (location) updateFields.location = location;

    const updatedUser = await User.update(userId, updateFields);

    res.status(200).json({ message: 'Profile updated successfully', user: { id: updatedUser.id, username: updatedUser.username, email: updatedUser.email, role: updatedUser.role, is_blocked: updatedUser.is_blocked, phone: updatedUser.phone, location: updatedUser.location } });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * @desc Delete user account
 * @route DELETE /api/auth/delete
 */
const deleteAccount = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.delete(); // Assuming a delete method exists on the User model

    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * @desc Logout user
 * @route POST /api/auth/logout
 */
const logout = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]; // Assuming token is sent in Authorization header

  try {
    if (token) {
      await Session.deleteByToken(token); // Assuming a method to delete session by token
    }
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * @desc Fetch user profile
 * @route GET /api/auth/profile
 */
const fetchProfile = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'User profile fetched successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        is_blocked: user.is_blocked,
        phone: user.phone,
        location: user.location,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { register, login, updateProfile, deleteAccount, logout, fetchProfile };
