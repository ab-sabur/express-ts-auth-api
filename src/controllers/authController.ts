import { Request, Response } from "express";
import jwt, { SignOptions } from "jsonwebtoken";
import { Types } from "mongoose";
import UserModel from "../models/userModel";
import dotenv from "dotenv";

dotenv.config();

// Helper function to generate a JWT
const generateToken = (id: Types.ObjectId): string => {
  const secret = process.env.JWT_SECRET;

  // 1. Get expiration value. Default to '1d'.
  const expiresInString = process.env.JWT_EXPIRES_IN || "1d";

  if (!secret) {
    throw new Error("JWT_SECRET not defined in environment variables.");
  }

  // 2. Define the options object.
  // 🔑 SOLUTION: Cast expiresInString to 'any' to bypass the non-exported type check.
  // This is the common workaround for this specific JWT types issue.
  const options: SignOptions = {
    expiresIn: expiresInString as any, // Cast to 'any' to satisfy the compiler
  };

  // 3. Call jwt.sign
  return jwt.sign({ id }, secret, options);
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/signup
 * @access  Public
 */
export const signUp = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  try {
    // 1. Check if user already exists
    let user = await UserModel.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 2. Create new user (password hashing happens in the model's pre-save hook)
    user = await UserModel.create({
      username,
      email,
      password,
    });

    // 3. Respond with token and user details
    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: "Server error", error: error.message });
    } else {
      res.status(500).json({ message: "An unknown server error occurred" });
    }
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const logIn = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // 1. Check for user by email (we need to explicitly select the password here)
    const user = await UserModel.findOne({ email }).select("+password");

    if (user && (await user.matchPassword(password))) {
      // 2. Passwords match, return token
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      // 3. User not found or password incorrect
      res
        .status(401)
        .json({ message: "Invalid credentials (email or password)" });
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: "Server error", error: error.message });
    } else {
      res.status(500).json({ message: "An unknown server error occurred" });
    }
  }
};
