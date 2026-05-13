# MoodLift - Frontend & Backend Connected

## Quick Setup Guide

### 1. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file in backend folder:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/moodlift
PORT=5000
NODE_ENV=development
JWT_SECRET=your_super_secret_key_here
```

Start backend:
```bash
npm start
```

Backend runs on: `http://localhost:5000`

### 2. Frontend Setup

The frontend is already connected to the backend. The API client is configured to:
- Android Emulator: `http://10.0.2.2:5000/api`
- iOS Simulator: `http://localhost:5000/api`
- Physical Device: Update `src/utils/api.js` with your machine IP

### 3. Key Integration Points

#### HomeScreen
- Loads recovery stories from backend on mount
- Displays latest 5 stories
- Refreshes when screen comes into focus
- Shows loading state while fetching

#### ShareConditionScreen
- Post new recovery stories to backend
- Loads public feed from backend
- Supports anonymous posting
- Condition types: Anxiety, Depression, Burnout, Stress, Sleep Issues, PTSD, OCD, Panic Disorder, Other

#### StoryDetailsScreen
- Fetches full story details (increments view count)
- Loads comments from backend
- Allows posting comments
- Like/unlike stories

### 4. Running the App

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend (Expo):**
```bash
npx expo start
```

Then:
- Press `a` for Android emulator
- Press `i` for iOS simulator
- Press `w` for web
- Scan QR code with Expo Go app for physical device

### 5. API Endpoints Used

**Stories:**
- `GET /api/stories` - List stories
- `POST /api/stories` - Create story
- `GET /api/stories/:id` - Get story detail
- `PATCH /api/stories/:id/like` - Like story

**Comments:**
- `GET /api/stories/:storyId/comments` - List comments
- `POST /api/stories/:storyId/comments` - Create comment
- `DELETE /api/stories/:storyId/comments/:commentId` - Delete comment

### 6. Features Working

✅ Create recovery stories (anonymous or named)  
✅ List all recovery stories with pagination  
✅ View story details with auto-incrementing views  
✅ Like stories  
✅ Post comments on stories  
✅ Anonymous commenting  
✅ Filter stories by condition  
✅ Search stories  
✅ Real-time loading states  
✅ Error handling with alerts  

### 7. Troubleshooting

**"Cannot connect to backend"**
- Check if backend is running: `npm start` in backend folder
- Verify MongoDB URI in `.env`
- Check API URL in `src/utils/api.js`

**"Connection refused on emulator"**
- Android emulator uses `10.0.2.2` instead of `localhost`
- Update `src/utils/api.js` if needed

**"MongoDB connection failed"**
- Verify MongoDB URI format
- Check network whitelist in MongoDB Atlas
- Ensure database name matches

**Stories not loading**
- Check browser console for errors
- Verify backend is responding: `http://localhost:5000/api/health`

### 8. Environment Variables

**Backend (.env):**
```
MONGODB_URI=your_mongodb_uri
PORT=5000
NODE_ENV=development
JWT_SECRET=secret_key
```

**Frontend (src/utils/api.js):**
- Currently hardcoded for development
- Update API_BASE_URL for production

### 9. Next Steps

1. Deploy MongoDB Atlas
2. Deploy backend (Heroku, Railway, Render, etc.)
3. Update frontend API URL for production
4. Deploy frontend to Expo Go or build APK/IPA
5. Add authentication (optional)
6. Add image uploads for stories (optional)
7. Add user profiles (optional)

### 10. Database Schema

**Story Collection:**
- title, condition, story, author, anonymous
- likes, views, status, tags
- createdAt, updatedAt

**Comment Collection:**
- storyId, author, text, anonymous
- likes, isApproved
- createdAt, updatedAt

---

**The frontend and backend are now fully connected!** 🎉
