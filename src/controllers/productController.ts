import { Request, Response } from 'express';
import ProductModel, { IProduct } from '../models/productModel';
import { Types } from 'mongoose';

// The Request interface is extended in src/types/express.d.ts to include userId

/**
 * @desc    Create a new product
 * @route   POST /api/products
 * @access  Private
 */
export const createProduct = async (req: Request, res: Response) => {
  const { name, description, price } = req.body;
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  if (!name || !description || price === undefined) {
    return res.status(400).json({ message: 'Please include all required fields: name, description, and price' });
  }

  try {
    const product: IProduct = await ProductModel.create({
      user: userId,
      name,
      description,
      price,
    });

    res.status(201).json(product);
  } catch (error) {
    if (error instanceof Error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    } else {
        res.status(500).json({ message: 'An unknown server error occurred' });
    }
  }
};

/**
 * @desc    Get all products
 * @route   GET /api/products
 * @access  Public
 */
export const getProducts = async (req: Request, res: Response) => {
  try {
    // Anyone can read products
    const products = await ProductModel.find().populate('user', 'username email');
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Get a single product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await ProductModel.findById(req.params.id).populate('user', 'username email');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (error) {
    if (error instanceof Error && error.name === 'CastError') {
        return res.status(400).json({ message: 'Invalid product ID format' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Update a product
 * @route   PUT /api/products/:id
 * @access  Private
 */
export const updateProduct = async (req: Request, res: Response) => {
  const userId = req.userId; // User making the request

  try {
    let product = await ProductModel.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // 🔑 Authorization check: Only the owner can update the product
    if (product.user.toString() !== userId?.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this product' });
    }

    const updatedProduct = await ProductModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true } // Return the new document, run schema validators
    ).populate('user', 'username email');

    res.status(200).json(updatedProduct);
  } catch (error) {
    if (error instanceof Error && error.name === 'CastError') {
        return res.status(400).json({ message: 'Invalid product ID format' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Delete a product
 * @route   DELETE /api/products/:id
 * @access  Private
 */
export const deleteProduct = async (req: Request, res: Response) => {
  const userId = req.userId;

  try {
    const product = await ProductModel.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // 🔑 Authorization check: Only the owner can delete the product
    if (product.user.toString() !== userId?.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }

    // A simpler way to delete in Mongoose v8+
    await ProductModel.deleteOne({ _id: req.params.id });

    res.status(200).json({ message: 'Product removed' });
  } catch (error) {
    if (error instanceof Error && error.name === 'CastError') {
        return res.status(400).json({ message: 'Invalid product ID format' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};