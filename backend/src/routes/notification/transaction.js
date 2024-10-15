const WebSocket = require('ws');

async function notificationTransaction({ author, target, message }, fastify) {
  try {
    const database = await fastify.mysql.getConnection();
  
    await database.query(
      'INSERT INTO notifications (author, target, message) VALUES (?, ?, ?)',
      [author, target, message]
    );

    const [id] = await database.query(
      'SELECT id FROM notifications WHERE author = ? AND target = ? ORDER BY created_at DESC LIMIT 1',
      [author, target]
    );
  
    if (fastify.userConnections) {
      console.log('beep bop.. sending notification to ', target)
      const targetSocket = fastify.userConnections.get(target);
      if (targetSocket && targetSocket.readyState === WebSocket.OPEN) {
        targetSocket.send(JSON.stringify({
          id: id[0],
          author,
          type: 'NEW',
          message,
          read_status: false
        }));
      }
    }
  
    database.release();
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

module.exports = {
    notificationTransaction
};