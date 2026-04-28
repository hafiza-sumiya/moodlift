# MoodLift Backend - Recovery Stories API

Complete backend for MoodLift Recovery Stories feature with MongoDB and Express.

## Setup

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Add your MongoDB URI: `MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/moodlift`
   - Set PORT (default: 5000)
   - Set JWT_SECRET for authentication

3. **Start the server:**
   ```bash
   npm start       # production
   npm run dev     # development with nodemon
   ```

## API Endpoints

### Stories

- **GET** `/api/stories` - List all stories (paginated, filterable, searchable)
  - Query params: `page`, `limit`, `condition`, `sort`, `search`
  
- **GET** `/api/stories/:id` - Get single story (increments views)
  
- **POST** `/api/stories` - Create new story
  - Body: `title`, `condition`, `story`, `author`, `email`, `anonymous`, `tags`
  
- **PATCH** `/api/stories/:id` - Update story
  - Body: `title`, `condition`, `story`, `author`, `tags`
  
- **DELETE** `/api/stories/:id` - Delete story (and all comments)
  
- **PATCH** `/api/stories/:id/like` - Increment likes

### Comments

- **GET** `/api/stories/:storyId/comments` - List story comments (paginated)
  - Query params: `page`, `limit`, `sort`
  
- **POST** `/api/stories/:storyId/comments` - Create comment
  - Body: `author`, `text`, `email`, `anonymous`
  
- **PATCH** `/api/stories/:storyId/comments/:commentId/like` - Increment likes
  
- **DELETE** `/api/stories/:storyId/comments/:commentId` - Delete comment

## Features

✅ Full CRUD operations for stories  
✅ Comments system with likes  
✅ Input validation and error handling  
✅ Pagination and filtering  
✅ Text search functionality  
✅ Anonymous posting option  
✅ View counter on stories  
✅ Automatic comment deletion when story is deleted  
✅ MongoDB indexing for performance  

## MongoDB Schemas

### Story
- title, condition, story, author, email, anonymous
- likes, views, status, tags
- timestamps (createdAt, updatedAt)

### Comment
- storyId (reference to Story), author, text, email, anonymous
- likes, isApproved
- timestamps (createdAt, updatedAt)

## Response Format

All responses follow a consistent format:

```json
{
  "success": true/false,
  "message": "descriptive message",
  "data": {} or [],
  "error": "error details (if failed)"
}
```
