'use strict'

const { notificationTransaction } = require("../../notification");

module.exports = async function (fastify, opts) {
    fastify.post('/notifications/create', async (request, reply) => {
      const { author, target, type, message } = request.body;
  
      if (!author || !target || !message) {
        return reply.status(400).send({
          type: 'ERROR',
          message: 'Missing required fields: author, target, message'
        });
      }
  
      try {
        // const database = await fastify.mysql.getConnection();
        
        notificationTransaction({ author, target, message })
        // await database.query(
        //   'INSERT INTO notifications (author, target, message) VALUES (?, ?, ?)',
        //   [author, target, message]
        // );
  
        // const targetSocket = fastify.userConnections.get(target);
        // if (targetSocket && targetSocket.readyState === WebSocket.OPEN) {
        //   targetSocket.send(JSON.stringify({
        //     type: 'NEW',
        //     notification: { author, target, type, message }
        //   }));
        // }
  
        reply.send({
          type: 'SUCCESS',
          message: 'Notification created successfully'
        });
      } catch (error) {
        fastify.log.error('Error creating notification:', error.message);
        reply.status(500).send({
          type: 'ERROR',
          message: 'Internal server error'
        });
      }
    });
  };
  