import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  userId: string;
}

// Extend Express Request to include userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
):void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
     res.status(401).json({ success: false, message: 'Access token missing' });
     return ;
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET not defined');
    }

    const payload = jwt.verify(token, secret) as JwtPayload;
    req.userId = payload.userId;
    next();
  } catch (error) {
     res.status(401).json({ success: false, message: 'Invalid or expired token' });
     return ; 
  }
};
