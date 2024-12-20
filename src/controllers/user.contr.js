import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/User.model.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/apiResponse.js';
import jwt from 'jsonwebtoken';

// Register a new user
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if ([name, email, password].some((field) => !field || field.trim() === '')) {
    throw new ApiError(400, 'All fields are required');
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, 'User already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
  }).select('-password')

  const accessToken = user.generateToken();

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });

  res.status(201).json(new ApiResponse(201, user, 'User registered successfully'));
});

// Login user
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }
  
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(401, 'Invalid credentials');
  }
  
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid credentials');
  }
  
  const accessToken = user.generateToken();
  
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });
  
  res.status(200).json(new ApiResponse(200, user, 'Login successful'));
});

// Logout user
export const logout = asyncHandler(async (req, res) => {
  console.log("logout")
  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });

  res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'));
});

// Authentication
export const authentication = asyncHandler(async (req, res) => {
  const accessToken = req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ', '');
  if (!accessToken) {
    throw new ApiError(401, 'Unauthorized request');
  }

  const decodedToken = jwt.verify(accessToken, process.env.JWT_SECRET);
  const user = await User.findById(decodedToken?._id).select('-password');
  if (!user) {
    throw new ApiError(401, 'Unauthorized request');
  }
  res.status(200).json(new ApiResponse(200, user, 'User authenticated successfully'));
});
