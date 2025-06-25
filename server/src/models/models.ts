import mongoose, { Schema, Document, Types } from 'mongoose';

/* ====== User ====== */
export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  address?: string;
}

const UserSchema = new Schema<IUser>({
  name: String,
  email: { type: String, unique: true },
  passwordHash: String,
  address: String,
}, { timestamps: true });

export const UserModel = mongoose.model<IUser>('User', UserSchema);


/* ====== Product ====== */
export interface IProduct extends Document {
  name: string;
  description: string;
  brand: string;
  category: string;
  price: number;
  stock: number;
  color: string;
  size: string;
  imageUrl: string;
  tags: string[];
}

const ProductSchema = new Schema<IProduct>({
  name: String,
  description: String,
  brand: String,
  category: String,
  price: Number,
  stock: Number,
  color: String,
  size: String,
  imageUrl: String,
  tags: [String],
}, { timestamps: true });

export const ProductModel = mongoose.model<IProduct>('Product', ProductSchema);


/* ====== Cart ====== */
export interface ICartItem {
  productId: Types.ObjectId;
  quantity: number;
}

export interface ICart extends Document {
  userId: Types.ObjectId;
  items: ICartItem[];
}

const CartSchema = new Schema<ICart>({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  items: [
    {
      productId: { type: Schema.Types.ObjectId, ref: 'Product' },
      quantity: Number,
    },
  ],
}, { timestamps: true });

export const CartModel = mongoose.model<ICart>('Cart', CartSchema);


/* ====== CommandLog ====== */
export interface ICommandLog extends Document {
  userId: Types.ObjectId;
  inputText: string;
  matchedIntent: string;
  extractedData: Record<string, any>;
  resultIds: Types.ObjectId[];
}

const CommandLogSchema = new Schema<ICommandLog>({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  inputText: String,
  matchedIntent: String,
  extractedData: Schema.Types.Mixed,
  resultIds: [Schema.Types.ObjectId],
}, { timestamps: true });

export const CommandLogModel = mongoose.model<ICommandLog>('CommandLog', CommandLogSchema);

