const { Server } = require('socket.io');
const logger = require('./logger');

let io;
const userSockets = new Map(); // userId -> socketId

const socketUtil = {
    init: (server) => {
        io = new Server(server, {
            cors: {
                origin: '*', // In production, restrict this to your frontend URL
                methods: ['GET', 'POST']
            }
        });

        io.on('connection', (socket) => {
            logger.info('New client connected', { socketId: socket.id });

            socket.on('join', (userId) => {
                if (userId) {
                    userSockets.set(userId.toString(), socket.id);
                    socket.join(userId.toString());
                    logger.info(`User ${userId} joined their private room`, { socketId: socket.id });
                }
            });

            socket.on('disconnect', () => {
                logger.info('Client disconnected', { socketId: socket.id });
                // Clean up userSockets map
                for (const [userId, socketId] of userSockets.entries()) {
                    if (socketId === socket.id) {
                        userSockets.delete(userId);
                        break;
                    }
                }
            });
        });

        return io;
    },

    getIO: () => {
        if (!io) {
            throw new Error('Socket.io not initialized');
        }
        return io;
    },

    emitToUser: (userId, event, data) => {
        if (io) {
            io.to(userId.toString()).emit(event, data);
            logger.debug(`Emitted ${event} to user ${userId}`, { data });
        }
    }
};

module.exports = socketUtil;
