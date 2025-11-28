import { Router } from 'express';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from '../controllers/productController';
import protect from '../middleware/authMiddleware';

const router = Router();

// Public routes (Read operations)
router.get('/', getProducts);
router.get('/:id', getProductById);

// Private routes (Create, Update, Delete operations)
// The 'protect' middleware ensures a valid JWT is present before hitting the controller
router.post('/', protect, createProduct);
router.put('/:id', protect, updateProduct);
router.delete('/:id', protect, deleteProduct);

export default router;