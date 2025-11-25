import mongoose, { Schema, Document } from 'mongoose';

export interface IAuthor extends Document {
  name: string;
  country: string;
  books: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const AuthorSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Author name is required'],
      trim: true,
    },
    country: {
      type: String,
      required: [true, 'Author country is required'],
      trim: true,
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
AuthorSchema.virtual('populatedBooks', {
  ref: 'Book',
  localField: 'books',
  foreignField: '_id',
});

export default mongoose.model<IAuthor>('Author', AuthorSchema);

