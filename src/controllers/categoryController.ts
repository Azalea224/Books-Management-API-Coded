import { Request, Response } from 'express';
import Category from '../models/Category';
import Book from '../models/Book';

// GET /categories - List all categories
export const getAllCategories = async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = await Category.find();
    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories',
    });
  }
};

// GET /categories/:id - Get single category by ID
export const getCategoryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      res.status(404).json({
        success: false,
        error: 'Category not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch category',
    });
  }
};

// POST /categories - Create new category
export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.body;

    if (!name) {
      res.status(400).json({
        success: false,
        error: 'Category name is required',
      });
      return;
    }

    const category = await Category.create({ name });
    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      res.status(400).json({
        success: false,
        error: error.message,
      });
      return;
    }
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        error: 'Category name already exists',
      });
      return;
    }
    res.status(500).json({
      success: false,
      error: 'Failed to create category',
    });
  }
};

// PUT /categories/:id - Update category name
export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.body;

    if (!name) {
      res.status(400).json({
        success: false,
        error: 'Category name is required',
      });
      return;
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true, runValidators: true }
    );

    if (!category) {
      res.status(404).json({
        success: false,
        error: 'Category not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      res.status(400).json({
        success: false,
        error: error.message,
      });
      return;
    }
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        error: 'Category name already exists',
      });
      return;
    }
    res.status(500).json({
      success: false,
      error: 'Failed to update category',
    });
  }
};

// DELETE /categories/:id - Delete category
export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      res.status(404).json({
        success: false,
        error: 'Category not found',
      });
      return;
    }

    // Remove category reference from books
    await Book.updateMany(
      { categories: req.params.id },
      { $pull: { categories: req.params.id } }
    );

    await Category.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete category',
    });
  }
};

