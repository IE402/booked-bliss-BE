const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

// Tạo ứng dụng Express
const app = express();

// Cấu hình CORS cho phép frontend của bạn kết nối (nếu bạn sử dụng * thì sẽ cho phép tất cả)
app.use(cors({
  origin: 'http://localhost:5173', // Thay đổi thành domain của frontend của bạn
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

// Tạo server HTTP từ ứng dụng Express
const server = http.createServer(app);

// Cấu hình Socket.IO và CORS
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:5173', // Thêm CORS cho Socket.IO
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  },
});

// Khi có kết nối
io.on('connection', (socket) => {
  console.log('A user connected');
  
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Đặt server lắng nghe trên cổng 4000
server.listen(4000, () => {
  console.log('Server running on http://localhost:4000');
});
