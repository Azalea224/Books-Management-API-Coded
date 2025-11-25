import { Request, Response } from "express";
import Book from "../models/Book";
import Author from "../models/Author";
import Category from "../models/Category";
import mongoose from "mongoose";

// GET /books - List all books with filtering
export const getAllBooks = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { author, categories, title, includeDeleted } = req.query;

    // Build query
    const query: any = {};

    // Exclude soft-deleted books by default
    if (includeDeleted !== "true") {
      query.deleted = false;
    }

    // Filter by author
    if (author) {
      if (!mongoose.Types.ObjectId.isValid(author as string)) {
        res.status(400).json({
          success: false,
          error: "Invalid author ID",
        });
        return;
      }
      query.author = author;
    }

    // Filter by categories (supports comma-separated IDs)
    if (categories) {
      const categoryIds = (categories as string)
        .split(",")
        .map((id) => id.trim());

      // Validate all IDs
      const invalidIds = categoryIds.filter(
        (id) => !mongoose.Types.ObjectId.isValid(id)
      );
      if (invalidIds.length > 0) {
        res.status(400).json({
          success: false,
          error: "Invalid category ID(s)",
        });
        return;
      }

      query.categories = { $in: categoryIds };
    }

    // Filter by title (case-insensitive partial match)
    if (title) {
      query.title = { $regex: title as string, $options: "i" };
    }

    const books = await Book.find(query)
      .populate("author", "name country")
      .populate("categories", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: books.length,
      data: books,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch books",
    });
  }
};

// GET /books/:id - Get single book by ID with populated author and categories
export const getBookById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { includeDeleted } = req.query;
    const query: any = { _id: req.params.id };

    // Exclude soft-deleted books by default
    if (includeDeleted !== "true") {
      query.deleted = false;
    }

    const book = await Book.findOne(query)
      .populate("author", "name country")
      .populate("categories", "name");

    if (!book) {
      res.status(404).json({
        success: false,
        error: "Book not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: book,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch book",
    });
  }
};

// POST /books - Create new book
export const createBook = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Extract and parse form-data fields
    // Multer parses multipart/form-data and puts text fields in req.body as strings
    let { title, author, categories } = req.body;
    // Ensure title and author are strings (trim whitespace)
    title = typeof title === "string" ? title.trim() : title;
    author = typeof author === "string" ? author.trim() : author;

    if (!title || !author) {
      res.status(400).json({
        success: false,
        error: "Title and author are required",
      });
      return;
    }

    // Parse categories if it's a string (from form-data)
    // Handles both JSON array string and comma-separated values
    if (categories !== undefined && categories !== null) {
      if (typeof categories === "string") {
        const trimmed = categories.trim();
        // Try to parse as JSON first
        if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
          try {
            categories = JSON.parse(trimmed);
          } catch (e) {
            // If JSON parsing fails, try comma-separated values
            if (trimmed.includes(",")) {
              categories = trimmed
                .split(",")
                .map((id: string) => id.trim())
                .filter((id: string) => id.length > 0);
            } else if (trimmed.length > 0) {
              // Single value
              categories = [trimmed];
            } else {
              categories = [];
            }
          }
        } else if (trimmed.includes(",")) {
          // Comma-separated values
          categories = trimmed
            .split(",")
            .map((id: string) => id.trim())
            .filter((id: string) => id.length > 0);
        } else if (trimmed.length > 0) {
          // Single value
          categories = [trimmed];
        } else {
          categories = [];
        }
      }
      // Ensure categories is an array
      if (!Array.isArray(categories)) {
        categories = [];
      }
    } else {
      categories = [];
    }

    // Validate author exists
    const authorExists = await Author.findById(author);
    if (!authorExists) {
      res.status(400).json({
        success: false,
        error: "Author not found",
      });
      return;
    }

    // Validate categories exist (if provided)
    if (categories && Array.isArray(categories) && categories.length > 0) {
      const categoryIds = categories.map(
        (id: string) => new mongoose.Types.ObjectId(id)
      );
      const categoriesExist = await Category.find({
        _id: { $in: categoryIds },
      });

      if (categoriesExist.length !== categoryIds.length) {
        res.status(400).json({
          success: false,
          error: "One or more categories not found",
        });
        return;
      }
    }

    // Handle file upload - upload.any() returns req.files as an array
    const coverImage =
      req.files && Array.isArray(req.files) && req.files.length > 0
        ? (req.files[0] as Express.Multer.File).filename
        : undefined;

    const bookData: any = {
      title,
      author,
      categories: categories || [],
      deleted: false,
    };

    if (coverImage) {
      bookData.coverImage = coverImage;
    }

    const bookResult = await Book.create(bookData);
    const book = Array.isArray(bookResult) ? bookResult[0] : bookResult;
    const bookId = book._id;

    // Update author's books array
    await Author.findByIdAndUpdate(author, {
      $addToSet: { books: bookId },
    });

    // Update categories' books arrays
    if (categories && Array.isArray(categories) && categories.length > 0) {
      await Category.updateMany(
        { _id: { $in: categories } },
        { $addToSet: { books: bookId } }
      );
    }

    const populatedBook = await Book.findById(bookId)
      .populate("author", "name country")
      .populate("categories", "name");

    if (!populatedBook) {
      console.error(
        "Error 500 in createBook: Failed to retrieve created book",
        {
          bookId,
          bookData,
        }
      );
      res.status(500).json({
        success: false,
        error: "Failed to retrieve created book",
      });
      return;
    }

    res.status(201).json({
      success: true,
      data: populatedBook,
    });
  } catch (error: any) {
    if (error.name === "ValidationError") {
      res.status(400).json({
        success: false,
        error: error.message,
      });
      return;
    }
    console.error("Error 500 in createBook:", {
      message: error.message,
      stack: error.stack,
      error: error,
      body: req.body,
      file:
        req.files && Array.isArray(req.files) && req.files.length > 0
          ? {
              filename: (req.files[0] as Express.Multer.File).filename,
              originalname: (req.files[0] as Express.Multer.File).originalname,
            }
          : null,
    });
    res.status(500).json({
      success: false,
      error: "Failed to create book",
    });
  }
};

// PUT /books/:id - Update book details
export const updateBook = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    let { title, author, categories } = req.body;
    const updateData: any = {};

    // Parse categories if it's a string (from form-data)
    if (categories !== undefined && typeof categories === "string") {
      try {
        categories = JSON.parse(categories);
      } catch (e) {
        res.status(400).json({
          success: false,
          error: "Invalid categories format. Expected JSON array.",
        });
        return;
      }
    }

    if (title) updateData.title = title;
    if (author) {
      // Validate author exists
      const authorExists = await Author.findById(author);
      if (!authorExists) {
        res.status(400).json({
          success: false,
          error: "Author not found",
        });
        return;
      }
      updateData.author = author;
    }
    if (categories !== undefined) {
      if (Array.isArray(categories) && categories.length > 0) {
        // Validate categories exist
        const categoryIds = categories.map(
          (id: string) => new mongoose.Types.ObjectId(id)
        );
        const categoriesExist = await Category.find({
          _id: { $in: categoryIds },
        });

        if (categoriesExist.length !== categoryIds.length) {
          res.status(400).json({
            success: false,
            error: "One or more categories not found",
          });
          return;
        }
      }
      updateData.categories = categories;
    }

    // Handle file upload - upload.any() returns req.files as an array
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      updateData.coverImage = (req.files[0] as Express.Multer.File).filename;
    }

    const book = await Book.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("author", "name country")
      .populate("categories", "name");

    if (!book) {
      res.status(404).json({
        success: false,
        error: "Book not found",
      });
      return;
    }

    // Update author's books array if author changed
    if (author) {
      const oldBook = await Book.findById(req.params.id);
      if (oldBook && oldBook.author.toString() !== author) {
        // Remove from old author
        await Author.findByIdAndUpdate(oldBook.author, {
          $pull: { books: req.params.id },
        });
        // Add to new author
        await Author.findByIdAndUpdate(author, {
          $addToSet: { books: req.params.id },
        });
      }
    }

    // Update categories' books arrays if categories changed
    if (categories !== undefined) {
      const oldBook = await Book.findById(req.params.id);
      if (oldBook) {
        // Remove from old categories
        await Category.updateMany(
          { _id: { $in: oldBook.categories } },
          { $pull: { books: req.params.id } }
        );
        // Add to new categories
        if (Array.isArray(categories) && categories.length > 0) {
          await Category.updateMany(
            { _id: { $in: categories } },
            { $addToSet: { books: req.params.id } }
          );
        }
      }
    }

    res.status(200).json({
      success: true,
      data: book,
    });
  } catch (error: any) {
    if (error.name === "ValidationError") {
      res.status(400).json({
        success: false,
        error: error.message,
      });
      return;
    }
    res.status(500).json({
      success: false,
      error: "Failed to update book",
    });
  }
};

// DELETE /books/:id - Soft delete book
export const deleteBook = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { deleted: true },
      { new: true }
    );

    if (!book) {
      res.status(404).json({
        success: false,
        error: "Book not found",
      });
      return;
    }

    // Remove book from author's books array
    await Author.findByIdAndUpdate(book.author, {
      $pull: { books: req.params.id },
    });

    // Remove book from categories' books arrays
    if (book.categories && book.categories.length > 0) {
      await Category.updateMany(
        { _id: { $in: book.categories } },
        { $pull: { books: req.params.id } }
      );
    }

    res.status(200).json({
      success: true,
      message: "Book deleted successfully",
      data: book,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to delete book",
    });
  }
};
