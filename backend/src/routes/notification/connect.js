'use strict';

const { verifyToken } = require('../../utils');

module.exports = async function (fastify, opts) {
  fastify.route({
    url: '/ws',
    method: 'GET',
    websocket: true,
    handler: async (socket, request) => {
      const token = request.cookies.jwt;

      if (!token) {
        socket.send(JSON.stringify({
          type: 'ERROR',
          error: 'Unauthorized'
        }));
        socket.close();
        return;
      }

      try {
        const decodedPayload = verifyToken(token, 'your-secret-key');
        const database = await fastify.mysql.getConnection();
        
        const username = decodedPayload.sub;
        fastify.userConnections.set(username, socket);

        try {
          const [unreadNotifications] = await database.query(
            'SELECT * FROM notifications WHERE target = ? AND read_status = false',
            [username]
          );
          if (unreadNotifications && unreadNotifications.length > 0) {
            socket.send(JSON.stringify({
              type: 'NOTIFICATIONS',
              notifications: unreadNotifications
            }));
          } else {
            socket.send(JSON.stringify({
              type: 'PONG',
              message: 'Pong'
            }));
          }
        } catch (error) {
          fastify.log.error('Error fetching unread notifications:', error.message);
        }
      } catch (error) {
        console.log('Other error', error)
        socket.send(JSON.stringify({
          type: 'ERROR',
          error: 'Authentication Error'
        }));
        return () => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.close();
          }
        };    
      }
    },
    onClose: (socket) => {
      const username = socket.username;
      fastify.userConnections[username] = null;
    }
  });
}
