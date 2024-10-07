'use strict';

module.exports = async function (fastify, opts) {
  fastify.route({
    url: '/ws',
    method: 'GET',
    websocket: true,
    handler: async (connection, request) => {
      const userId = req.cookies.userId;
      if (userId) {
        fastify.userConnections.set(userId, connection);
  
        try {
          const unreadNotifications = await db.query(
            'SELECT * FROM notifications WHERE user_id = ? AND read_status = 0', 
            [userId]
          );
          connection.socket.send(JSON.stringify({
            type: 'NOTIFICATIONS',
            notifications: unreadNotifications
          }));
        } catch (error) {
          fastify.log.error('Error fetching unread notifications:', error);
        }
  
        connection.socket.on('close', () => {
          fastify.userConnections.delete(userId);
        });
      }
    }
  })
};
