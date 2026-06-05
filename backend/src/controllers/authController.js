import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getUserByEmail, createUser, getUserById } from '../services/dbService.js';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
  console.warn("SECURITY WARNING: JWT_SECRET environment variable is not defined in production mode. Using fallback secret!");
}
const ACTUAL_JWT_SECRET = JWT_SECRET || 'spotify_clone_secret_token_123';

// Generate Token
const createToken = (id, role) => {
  return jwt.sign({ id, role }, ACTUAL_JWT_SECRET, { expiresIn: '7d' });
};

// Register User
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all details.' });
    }

    // Password Strength Validations
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long.' });
    }
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    if (!hasLetter || !hasNumber) {
      return res.status(400).json({ success: false, message: 'Password must contain at least one letter and one number.' });
    }

    const emailExists = await getUserByEmail(email);
    if (emailExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email.' });
    }


    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // If email contains "admin@", make them admin
    const role = email.toLowerCase().includes('admin@') ? 'admin' : 'user';

    const newUser = await createUser({
      name,
      email,
      password: hashedPassword,
      role
    });

    const token = createToken(newUser._id, newUser.role);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ success: false, message: 'Internal server error during registration.' });
  }
};

// Login User
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials. User does not exist.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials. Password mismatch.' });
    }

    const token = createToken(user._id, user.role);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(550).json({ success: false, message: 'Internal server error during login.' });
  }
};

// User Authorization Middleware
export const userAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Not authorized, token missing.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, ACTUAL_JWT_SECRET);
    
    // Convert object id to standard check
    const user = await getUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found, auth failed.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("User auth error:", error);
    res.status(401).json({ success: false, message: 'Not authorized, invalid token.' });
  }
};

// Admin Authorization Middleware
export const adminAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Not authorized, token missing.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, ACTUAL_JWT_SECRET);
    
    if (decoded.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Administrator privileges required.' });
    }

    const user = await getUserById(decoded.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Administrator privileges required.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Admin auth error:", error);
    res.status(401).json({ success: false, message: 'Not authorized, invalid token.' });
  }
};
