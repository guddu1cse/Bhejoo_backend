const User = require('../models/mysql/User.model');
const { hashPassword, comparePassword } = require('../utils/password.util');
const { generateToken } = require('../utils/jwt.util');
const logger = require('../utils/logger');

class AuthService {
  static async register(userData) {
    const { name, email, password, role, mapped_restaurant } = userData;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      logger.warn('Register attempted with existing email', { email });
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const userId = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'user',
      status: 'active',
      mapped_restaurant: mapped_restaurant || null
    });

    const user = await User.findById(userId);
    logger.info('User registered', { userId: user.id, email: user.email, role: user.role });
    const token = generateToken({ userId: user.id, email: user.email, role: user.role });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        mapped_restaurant: user.mapped_restaurant
      },
      token
    };
  }

  static async login(email, password) {
    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      logger.warn('Login failed - user not found', { email });
      throw new Error('Invalid email or password');
    }

    // Check password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      logger.warn('Login failed - wrong password', { userId: user.id, email: user.email });
      throw new Error('Invalid email or password');
    }

    // Check if user is active
    if (user.status !== 'active') {
      logger.warn('Login failed - inactive user', { userId: user.id, status: user.status });
      throw new Error('Account is inactive or suspended');
    }

    // Generate token
    const token = generateToken({ userId: user.id, email: user.email, role: user.role });

    logger.info('User logged in', { userId: user.id, email: user.email, role: user.role });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        mapped_restaurant: user.mapped_restaurant
      },
      token
    };
  }
}

module.exports = AuthService;
