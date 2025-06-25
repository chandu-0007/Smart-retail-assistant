import express from 'express';
import connectDB from './config/db';
import dotenv from 'dotenv';
import { IUser, UserModel } from './models/models';
import {z} from "zod"
import { Request, Response } from 'express';
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

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
    const data : IUser = req.body;
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


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
