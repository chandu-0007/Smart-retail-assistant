import express from 'express';
import connectDB from './config/db';
import dotenv from 'dotenv';
import { CartModel , ProductModel, UserModel } from './models/models';
import {z} from "zod"
import { Request, Response } from 'express';
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { authenticateToken } from './MiddleWare/auth';


dotenv.config();
const app = express();
app.use(express.json());

connectDB();

 const registerSchema = z.object({
  name: z.string().max(30),
  email: z.string().email(),
  password: z.string().min(6),
  address: z.string().optional()
});
// type userR = z.infer<typeof registerSchema>
 const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});



app.post('/users/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const data  = req.body;
    const parsed = registerSchema.safeParse(data);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors ,
        message: "Invalid input data",
        status : false
       });
      return;
    }

    const { name, email, password, address } = parsed.data;
    const existing = await UserModel.findOne({ email });
    if (existing) {
      res.status(400).json({ message: "User already exists" ,
        status:false,
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await UserModel.create({ name, email, passwordHash: hashedPassword, address });
    res.status(200).json({
      message:"User registered successfully",
      status:true
    })
  } catch (error) {
    res.status(500).json({ message: "Server error" ,
      status:false
    });
  }
});

// Login
app.post('/users/login', async (req: Request, res: Response):Promise<void> => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
       res.status(400).json({
        success: false,
        message: "Invalid input data",
        errors: parsed.error.errors
      });
      return;
    }

    const { email, password } = parsed.data;
    const user = await UserModel.findOne({ email });
    if (!user) {
       res.status(401).json({ success: false, message: "Invalid credentials" });
       return;
    }

    const match = await bcrypt.compare(password, user.passwordHash as string);
    if (!match) {
       res.status(401).json({ success: false, message: "Invalid credentials" });
        return;
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!);
    res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          name: user.name,
          email: user.email
        }
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});



const router = express.Router();

// Zod Schema for Product validation
const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  brand: z.string().min(1),
  category: z.string().min(1),
  price: z.number().nonnegative(),
  stock: z.number().int().nonnegative(),
  color: z.string().min(1),
  size: z.string().min(1),
  imageUrl: z.string().url(),
  tags: z.array(z.string()).optional()
});

// Route: POST /products

// added the middleware to protect the router and verfiy the token 
app.use(authenticateToken)
router.post('/product', async (req: Request, res: Response): Promise<void> => {
  const parsed = productSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      status: false,
      message: 'Invalid product data',
      errors: parsed.error.errors,
    });
    return;
  }

  try {
    const product = await ProductModel.create(parsed.data);
    res.status(201).json({
      status: true,
      message: 'Product added successfully',
      data: product,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: false,
      message: 'Server error while adding product',
    });
  }
});

// delete the product 
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  const parsed = productSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      status: false,
      message: 'Invalid product data',
      errors: parsed.error.errors,
    });
    return;
  }

  try {
    const product = await ProductModel.create(parsed.data);
    res.status(201).json({
      status: true,
      message: 'Product added successfully',
      data: product,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: false,
      message: 'Server error while adding product',
    });
  }
});

// Delete product by id - protected route
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const deleted = await ProductModel.findByIdAndDelete(id);
    if (!deleted) {
      res.status(404).json({ status: false, message: 'Product not found' });
      return;
    }

    res.status(200).json({ status: true, message: 'Product deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Server error while deleting product' });
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
