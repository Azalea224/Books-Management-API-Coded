import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  books: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      unique: true,
    },
    books: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Book',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Virtual for populating books
CategorySchema.virtual('populatedBooks', {
  ref: 'Book',
  localField: 'books',
  foreignField: '_id',
});

export default mongoose.model<ICategory>('Category', CategorySchema);

