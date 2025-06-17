import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import http from 'http';
import { connectDB } from './lib/db.js';
import userRouter from './routes/userRoutes.js';
import messageRouter from './routes/messageRoutes.js';
import { Server } from 'socket.io';
// Create express app and HTTP server
const app = express();
const server = http.createServer(app);

//initialize sockerio server
export const io = new Server(server,{
    cors:{origin:"*"}
})
//store online users
export const userSocketMap = {};//{userId:socketId}

//socket.io connection handler
io.on("connection",(socket)=>{
    console.log("Connected: " + socket.id);
    const userId= socket.handshake.query.userId;
    console.log("user connected",userId);
    if(userId) userSocketMap[userId]=socket.id;
    // emit online users to all connected client
    io.emit("getOnlineUsers",Object.keys(userSocketMap));
    socket.on("disconnect",()=>{
        console.log("User Disconected",userId);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers",Object.keys(userSocketMap))
    })
})

// Middleware setup
app.use(express.json({ limit: '4mb' }));
app.use(cors());
// router setup
app.use('/api/status', (req, res) => res.send('Server is live'));
app.use("/api/auth",userRouter)
app.use("/api/messages",messageRouter)
//connect db
await connectDB();
// Use a different port to avoid permission issues
if(process.env.NODE_ENV !== "production")
{
    const PORT = process.env.PORT || 3000; // Changed from 5000 to 3000
    server.listen(PORT, () => console.log(`Server is running on port: ${PORT}`));
}
//exoirt server for vercel
export default server;
