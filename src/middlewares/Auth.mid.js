import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized request',
      });
    }
    
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decodedToken?.id).select('-password -refreshToken');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Access Token',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error?.message || 'Invalid access token',
    });
  }
};

export default authMiddleware;
