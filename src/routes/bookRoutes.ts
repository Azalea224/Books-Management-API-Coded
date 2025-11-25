import { Router } from "express";
import {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
} from "../controllers/bookController";
import { uploadAnySingle } from "../middlewares/upload";
import asyncHandler from "../middlewares/asyncHandler";

const router = Router();

router.get("/", asyncHandler(getAllBooks));
router.get("/:id", asyncHandler(getBookById));
// Accept any file field name (coverImage, image, file, etc.)
router.post("/", uploadAnySingle, asyncHandler(createBook));
router.put("/:id", uploadAnySingle, asyncHandler(updateBook));
router.delete("/:id", asyncHandler(deleteBook));

export default router;
