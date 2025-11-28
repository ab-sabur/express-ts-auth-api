import mongoose, { Document, Schema, Types } from 'mongoose';

// Define the interface for the Product document
export interface IProduct extends Document {
  user: Types.ObjectId; // The user who created this product
  name: string;
  description: string;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema<IProduct> = new Schema<IProduct>({
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User', // Reference to the User model
  },
  name: {
    type: String,
    required: [true, 'Please add a product name'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please add a product description'],
  },
  price: {
    type: Number,
    required: [true, 'Please add a product price'],
    min: [0, 'Price cannot be negative'],
  },
}, {
  timestamps: true,
});

const ProductModel = mongoose.model<IProduct>('Product', ProductSchema);

export default ProductModel;