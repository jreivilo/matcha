const fastify = require('fastify')();
const WebSocket = require('ws');
const userConnections = new Map();

fastify.get('/ws', { websocket: true }, async (connection, req) => {
  const userId = req.cookies.userId;
  if (userId) {
    userConnections.set(userId, connection);
    try {
      const unreadNotifications = await db.query('SELECT * FROM notifications WHERE user_id = ? AND read_status = 0', [userId]);
      connection.socket.send(JSON.stringify({
        type: 'NOTIFICATIONS',
        notifications: unreadNotifications
      }));
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
    }
    connection.socket.on('close', () => {
      userConnections.delete(userId);
    });
  }
});

fastify.post('/notifications', async (request, reply) => {
  const { type, authorId, targetId, content } = request.body;
  try {
    const result = await db.query(
      'INSERT INTO notifications (type, author_id, target_id, content, timestamp, read_status) VALUES (?, ?, ?, ?, NOW(), 0)',
      [type, authorId, targetId, content]
    );
    const newNotificationId = result.insertId;
    
    const userIds = type === 'MATCH' ? [authorId, targetId] : [targetId];
    
    for (const userId of userIds) {
      const userConnection = userConnections.get(userId);
      if (userConnection) {
        userConnection.socket.send(JSON.stringify({
          type: 'NEW_NOTIFICATION',
          notification: {
            id: newNotificationId,
            type,
            author: { id: authorId },
            target: { id: targetId },
            content,
            timestamp: new Date(),
            read_status: 0
          }
        }));
      }
    }
    
    return { success: true, id: newNotificationId };
  } catch (error) {
    console.error('Error creating notification:', error);
    reply.status(500).send({ success: false, error: 'Internal Server Error' });
  }
});

fastify.put('/notifications/read', async (request, reply) => {
  const { userId, notificationIds } = request.body;
  const splitIds = notificationIds.split(',');
  try {
    await db.query(
      'UPDATE notifications SET read_status = 1 WHERE id IN (?) AND user_id = ?',
      [splitIds, userId]
    );
    return { success: true };
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    reply.status(500).send({ success: false, error: 'Internal Server Error' });
  }
});

fastify.get('/notifications/history', async (request, reply) => {
  const { userId } = request.query;
  try {
    const notifications = await db.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY timestamp DESC',
      [userId]
    );
    return notifications;
  } catch (error) {
    console.error('Error fetching notification history:', error);
    reply.status(500).send({ success: false, error: 'Internal Server Error' });
  }
});