import { Request, Response } from 'express';
import Author from '../models/Author';
import Book from '../models/Book';

// GET /authors - List all authors with populated books
export const getAllAuthors = async (_req: Request, res: Response): Promise<void> => {
  try {
    const authors = await Author.find().populate('books', 'title coverImage');
    res.status(200).json({
      success: true,
      count: authors.length,
      data: authors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch authors',
    });
  }
};

// GET /authors/:id - Get single author by ID with populated books
export const getAuthorById = async (req: Request, res: Response): Promise<void> => {
  try {
    const author = await Author.findById(req.params.id).populate('books', 'title coverImage');

    if (!author) {
      res.status(404).json({
        success: false,
        error: 'Author not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: author,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch author',
    });
  }
};

// POST /authors - Create new author
export const createAuthor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, country } = req.body;

    if (!name || !country) {
      res.status(400).json({
        success: false,
        error: 'Name and country are required',
      });
      return;
    }

    const author = await Author.create({ name, country });
    res.status(201).json({
      success: true,
      data: author,
    });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      res.status(400).json({
        success: false,
        error: error.message,
      });
      return;
    }
    res.status(500).json({
      success: false,
      error: 'Failed to create author',
    });
  }
};

// PUT /authors/:id - Update author's name
export const updateAuthor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, country } = req.body;
    const updateData: any = {};

    if (name) updateData.name = name;
    if (country) updateData.country = country;

    const author = await Author.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!author) {
      res.status(404).json({
        success: false,
        error: 'Author not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: author,
    });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      res.status(400).json({
        success: false,
        error: error.message,
      });
      return;
    }
    res.status(500).json({
      success: false,
      error: 'Failed to update author',
    });
  }
};

// DELETE /authors/:id - Delete author
export const deleteAuthor = async (req: Request, res: Response): Promise<void> => {
  try {
    const author = await Author.findById(req.params.id);

    if (!author) {
      res.status(404).json({
        success: false,
        error: 'Author not found',
      });
      return;
    }

    // Remove author reference from books
    await Book.updateMany(
      { author: req.params.id },
      { $unset: { author: '' } }
    );

    await Author.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Author deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete author',
    });
  }
};

