const socketIo = require('socket.io');

let io;

module.exports = {
  init: (httpServer) => {
    io = socketIo(httpServer, {
      cors: { origin: '*', methods: ['GET', 'POST'] }
    });

    
    io.on('connection', (socket) => {
      
      socket.on('join_user_channel', (userId) => {
        socket.join(`user_${userId}`);
      });
      
      socket.on('join_room', (roomId) => {
        socket.join(`room_${roomId}`);
      });

      socket.on('leave_room', (roomId) => {
        socket.leave(`room_${roomId}`);
      });

      socket.on('send_room_message', async ({ roomId, senderId, content }) => {
        try {
          const Message = require('./models/Message');
          const message = await Message.create({
            room: roomId,
            sender: senderId,
            content
          });
          const populated = await message.populate('sender', 'name email avatar role');
          io.to(`room_${roomId}`).emit('new_room_message', populated);
        } catch (err) {
          console.error('Error handling send_room_message:', err);
        }
      });

      socket.on('disconnect', () => {
      });
    });
    return io;
  },
  getIo: () => {
    if (!io) throw new Error('Socket.io not initialized');
    return io;
  }
};
