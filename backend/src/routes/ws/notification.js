const fastify = require('fastify')();
const WebSocket = require('ws');

const wss = new WebSocket.Server({ server: fastify.server });
const userConnections = {};

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (message) => {
    console.log(`Received message: ${message}`);
    const { type, userId } = JSON.parse(message);
    if (type === 'IDENTIFY') {
      userConnections[userId] = ws;
      ws.userId = userId
    } else {
      
    }
  });

  ws.on('error', (error) => {
    console.log(`Error occurred: ${error}`);
  });

  ws.on('close', () => {
    Object.keys(userConnections).forEach((userId) => {
      if (userConnections[userId] === ws) {
        delete userConnections[userId];
      }
    });
    console.log('Client disconnected');
  });
});

const sendNotifications = (recipient, notifications) => {
  recipient.send(JSON.stringify({ type: 'NOTIFICATIONS', notifications }));
};

fastify.get('/notifications', async (request, reply) => {
  const notifications = await db.query('SELECT * FROM notifications WHERE read_status = 0');
  return notifications;
});

fastify.post('/notifications', async (request, reply) => {
  const { notification } = request.body;
  await db.query(`INSERT INTO notifications (content, timestamp, read_status) VALUES (?, ?, 0)`, [notification.content, notification.timestamp]);
  // Send a notification to all connected clients
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'NEW_NOTIFICATION', notification }));
    }
  });
  return { message: 'Notification created successfully' };
});

fastify.put('/notifications/:id', async (request, reply) => {
  const { id } = request.params;
  const { read_status } = request.body;
  await db.query(`UPDATE notifications SET read_status = ? WHERE id = ?`, [read_status, id]);
  // Send a notification to all connected clients
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'UPDATE_NOTIFICATION', id, read_status }));
    }
  });
  return { message: 'Notification updated successfully' };
});