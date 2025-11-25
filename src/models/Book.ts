import mongoose, { Schema, Document } from 'mongoose';

export interface IBook extends Document {
  title: string;
  author: mongoose.Types.ObjectId;
  categories: mongoose.Types.ObjectId[];
  coverImage?: string;
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BookSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Book title is required'],
      trim: true,
      index: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'Author',
      required: [true, 'Author is required'],
      index: true,
    },
    categories: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Category',
      },
    ],
    coverImage: {
      type: String,
      trim: true,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IBook>('Book', BookSchema);

