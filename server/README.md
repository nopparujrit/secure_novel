# Novel Reader Backend Server

This is the backend server for the Secure Novel Reader application. It connects to MongoDB to fetch novel data.

## Setup

1. Make sure MongoDB is installed and running
2. Create a database named "novels"
3. Create a collection named "chapters" with documents in this format:
   ```
   { "chapter": 1, "content": "Novel content here..." }
   ```

## Environment Variables

Create a `.env` file in the server directory with:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/novels
```

## Running the Server

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Start the server
node index.js
```

The server will run on port 5000 by default.