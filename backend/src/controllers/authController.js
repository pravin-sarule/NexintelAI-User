

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



module.exports = { register, login};
