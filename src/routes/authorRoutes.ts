import { Router } from 'express';
import {
  getAllAuthors,
  getAuthorById,
  createAuthor,
  updateAuthor,
  deleteAuthor,
} from '../controllers/authorController';
import asyncHandler from '../middlewares/asyncHandler';

const router = Router();

router.get('/', asyncHandler(getAllAuthors));
router.get('/:id', asyncHandler(getAuthorById));
router.post('/', asyncHandler(createAuthor));
router.put('/:id', asyncHandler(updateAuthor));
router.delete('/:id', asyncHandler(deleteAuthor));

export default router;

