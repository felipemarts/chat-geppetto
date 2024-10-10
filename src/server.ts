
import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

// Import routes
import chatRoutes from './routes/chats';
import createChatRoutes from './routes/createChat';
import historyRoutes from './routes/history';
import postMessageRoutes from './routes/postMessage';
import postCommandRoutes from './routes/postCommand';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, '../public')));
app.use(bodyParser.json({ limit: '10mb' }));

// Use imported routes
app.use(chatRoutes);
app.use(createChatRoutes);
app.use(historyRoutes);
app.use(postMessageRoutes);
app.use(postCommandRoutes);

// Start the server on the specified port
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
