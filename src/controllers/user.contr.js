import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/User.model.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/apiResponse.js';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

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

// Add passport Google strategy configuration
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/v1/auth/google/callback',
    },
    async (accessToken, _, profile, done) => {
      try {
        let user = await User.findOne({ email: profile.emails[0].value });

        if (!user) {
          user = await User.create({
            name: profile.displayName,
            email: profile.emails[0].value,
            password: `google_${profile.id}`,
            googleId: profile.id,
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    },
  ),
);

// Google authentication routes
export const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email'],
});

export const googleAuthCallback = asyncHandler(async (req, res, next) => {
  passport.authenticate('google', { session: false }, async (err, user) => {
    if (err || !user) {
      throw new ApiError(401, 'Google authentication failed');
    }

    const accessToken = user.generateToken();

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });

    res.redirect(process.env.CLIENT_URL);
  })(req, res, next);
});