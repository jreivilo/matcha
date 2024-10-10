async function notificationTransaction({ author, target, message }, fastify) {
  try {
    const database = await fastify.mysql.getConnection();
  
    await database.query(
      'INSERT INTO notifications (author, target, message) VALUES (?, ?, ?)',
      [author, target, message]
    );
  
    const targetSocket = fastify.userConnections.get(target);
    if (targetSocket && targetSocket.readyState === WebSocket.OPEN) {
      targetSocket.send(JSON.stringify({
        author,
        type: 'NEW',
        message,
      }));
    }
  
    database.release();
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

module.exports = {
    notificationTransaction
};