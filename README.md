# Books Management API

A RESTful API built with Express, TypeScript, and MongoDB for managing books, authors, and categories in a digital library system.

## Features

- Full CRUD operations for Books, Authors, and Categories
- MongoDB with Mongoose for data persistence
- TypeScript for type safety
- File upload support for book cover images (Multer)
- Advanced filtering for books (by author, categories, title)
- Soft delete functionality for books
- Automatic timestamps (createdAt, updatedAt) on all models
- Request logging with Morgan
- CORS support
- Custom error handling

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or remote instance)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Books-Management-API-Coded
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/books-management
NODE_ENV=development
```

4. Start MongoDB (if running locally)

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

### Type Checking
```bash
npm run type-check
```

The server will start on `http://localhost:3000` (or the port specified in `.env`).

## API Endpoints

### Base URL
```
http://localhost:3000/api
```

### Authors

- `GET /api/authors` - Get all authors (with populated books)
- `GET /api/authors/:id` - Get author by ID
- `POST /api/authors` - Create new author
- `PUT /api/authors/:id` - Update author
- `DELETE /api/authors/:id` - Delete author

**Create Author Example:**
```json
{
  "name": "J.K. Rowling",
  "country": "United Kingdom"
}
```

### Categories

- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create new category
- `PUT /api/categories/:id` - Update category name
- `DELETE /api/categories/:id` - Delete category

**Create Category Example:**
```json
{
  "name": "Fantasy"
}
```

### Books

- `GET /api/books` - Get all books (with filtering options)
- `GET /api/books/:id` - Get book by ID
- `POST /api/books` - Create new book (with optional cover image)
- `PUT /api/books/:id` - Update book (with optional cover image)
- `DELETE /api/books/:id` - Soft delete book

**Create Book Example (JSON):**
```json
{
  "title": "Harry Potter and the Philosopher's Stone",
  "author": "author_id_here",
  "categories": ["category_id1", "category_id2"]
}
```

**Create Book with Cover Image:**
Use `multipart/form-data` with:
- `title` (text)
- `author` (text - author ID)
- `categories` (text - JSON array string)
- `coverImage` (file - image file)

### Book Filtering

The `GET /api/books` endpoint supports query parameters:

- `?author=<authorId>` - Filter by author ID
- `?categories=<categoryId>` - Filter by single category ID
- `?categories=<id1,id2,id3>` - Filter by multiple categories (comma-separated)
- `?title=<partialTitle>` - Case-insensitive title search
- `?includeDeleted=true` - Include soft-deleted books

**Examples:**
```
GET /api/books?author=123
GET /api/books?categories=456,789
GET /api/books?title=harry
GET /api/books?author=123&title=harry&categories=456,789
GET /api/books?includeDeleted=true
```

## Data Models

### Author
- `name` (string, required)
- `country` (string, required)
- `books` (array of ObjectId references)
- `createdAt` (Date, automatic)
- `updatedAt` (Date, automatic)

### Category
- `name` (string, required, unique)
- `books` (array of ObjectId references)
- `createdAt` (Date, automatic)
- `updatedAt` (Date, automatic)

### Book
- `title` (string, required)
- `author` (ObjectId reference to Author, required)
- `categories` (array of ObjectId references to Category)
- `coverImage` (string, optional - filename)
- `deleted` (boolean, default: false)
- `createdAt` (Date, automatic)
- `updatedAt` (Date, automatic)

## File Uploads

Book cover images can be uploaded when creating or updating books:
- Supported formats: JPEG, JPG, PNG, GIF
- Maximum file size: 5MB
- Files are stored in the `uploads/` directory
- Access uploaded images via: `http://localhost:3000/uploads/filename.jpg`

## Soft Delete

Books support soft delete functionality:
- When a book is deleted, the `deleted` field is set to `true`
- Soft-deleted books are excluded from GET queries by default
- Use `?includeDeleted=true` to include soft-deleted books in results
- The document is not removed from the database

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "error": "Error message here"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

## Postman Collection

A Postman collection is included: `Books-Management-API.postman_collection.json`

Import this file into Postman to test all endpoints with example requests.

## Project Structure

```
Books-Management-API-Coded/
├── src/
│   ├── config/
│   │   └── database.ts
│   ├── controllers/
│   │   ├── authorController.ts
│   │   ├── categoryController.ts
│   │   └── bookController.ts
│   ├── middlewares/
│   │   ├── errorHandler.ts
│   │   ├── notFoundHandler.ts
│   │   └── upload.ts
│   ├── models/
│   │   ├── Author.ts
│   │   ├── Category.ts
│   │   └── Book.ts
│   ├── routes/
│   │   ├── authorRoutes.ts
│   │   ├── categoryRoutes.ts
│   │   ├── bookRoutes.ts
│   │   └── index.ts
│   ├── app.ts
│   └── server.ts
├── uploads/
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## Technologies Used

- **Express** - Web framework
- **TypeScript** - Type-safe JavaScript
- **MongoDB** - Database
- **Mongoose** - MongoDB ODM
- **Morgan** - HTTP request logger
- **CORS** - Cross-origin resource sharing
- **Multer** - File upload handling
- **dotenv** - Environment variable management

## License

ISC

