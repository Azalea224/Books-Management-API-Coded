import { Router } from 'express';
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController';
import asyncHandler from '../middlewares/asyncHandler';

const router = Router();

router.get('/', asyncHandler(getAllCategories));
router.get('/:id', asyncHandler(getCategoryById));
router.post('/', asyncHandler(createCategory));
router.put('/:id', asyncHandler(updateCategory));
router.delete('/:id', asyncHandler(deleteCategory));

export default router;

