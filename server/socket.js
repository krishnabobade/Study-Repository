const socketIo = require('socket.io');

let io;

module.exports = {
  init: (httpServer) => {
    io = socketIo(httpServer, {
      cors: { origin: '*', methods: ['GET', 'POST'] }
    });
    
    io.on('connection', (socket) => {
      console.log('New client connected via WebSockets');
      
      socket.on('join_user_channel', (userId) => {
        socket.join(`user_${userId}`);
      });
      
      socket.on('disconnect', () => {
        console.log('Client disconnected');
      });
    });
    return io;
  },
  getIo: () => {
    if (!io) throw new Error('Socket.io not initialized');
    return io;
  }
};
