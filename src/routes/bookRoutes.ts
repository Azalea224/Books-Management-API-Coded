import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
} from '../controllers/bookController';
import upload from '../middlewares/upload';
import asyncHandler from '../middlewares/asyncHandler';

const router = Router();

// Multer error handler middleware
const handleMulterError = (err: any, _req: Request, res: Response, next: NextFunction): void => {
  if (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        res.status(400).json({
          success: false,
          error: 'File too large. Maximum size is 5MB.',
        });
        return;
      }
      res.status(400).json({
        success: false,
        error: err.message,
      });
      return;
    }
    // Other multer errors (like file type validation)
    res.status(400).json({
      success: false,
      error: err.message || 'File upload error',
    });
    return;
  }
  next();
};

// Wrapper to handle multer errors
const uploadSingle = (fieldName: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    upload.single(fieldName)(req, res, (err: any) => {
      if (err) {
        handleMulterError(err, req, res, next);
        return;
      }
      next();
    });
  };
};

router.get('/', asyncHandler(getAllBooks));
router.get('/:id', asyncHandler(getBookById));
router.post('/', uploadSingle('coverImage'), asyncHandler(createBook));
router.put('/:id', uploadSingle('coverImage'), asyncHandler(updateBook));
router.delete('/:id', asyncHandler(deleteBook));

export default router;

