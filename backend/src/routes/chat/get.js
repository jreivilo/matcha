'use strict';

const { verifyJWT } = require('../../jwt');

module.exports = async function (fastify, opts) {
  fastify.route({
    url: '/messages',
    method: ['POST'],
    schema: {
      summary: 'Get messages between users',
      description: 'Retrieve all messages exchanged between a sender and a receiver',
      tags: ['Chat'],
      querystring: {
        type: 'object',
        required: ['sender', 'receiver'],
        properties: {
          sender: { type: 'string', description: 'Sender username' },
          receiver: { type: 'string', description: 'Receiver username' }
        }
      },
      response: {
        200: {
          description: 'Messages retrieved successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            messages: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  message_id: { type: 'integer' },
                  sender_username: { type: 'string' },
                  receiver_username: { type: 'string' },
                  text: { type: 'string' },
                  timestamp: { type: 'string' }
                }
              }
            }
          }
        },
        400: {
          description: 'Invalid input or user not found',
          type: 'object',
          properties: {
            code: { type: 'string' },
            message: { type: 'string' }
          }
        },
        500: {
          description: 'Internal Server Error',
          type: 'object',
          properties: {
            code: { type: 'string' },
            message: { type: 'string' },
            error: { type: 'string' }
          }
        }
      }
    },
    preHandler: verifyJWT,
    handler: async (request, reply) => {
      const { sender, receiver } = request.query;
      const connection = await fastify.mysql.getConnection();

      try {
        // Begin transaction
        await connection.beginTransaction();

        // Find user IDs based on the usernames
        const [senderRows] = await connection.query(
          `SELECT id FROM user WHERE username = ?`,
          [sender]
        );

        const [receiverRows] = await connection.query(
          `SELECT id FROM user WHERE username = ?`,
          [receiver]
        );

        if (senderRows.length === 0 || receiverRows.length === 0) {
          reply.code(400).send({
            code: 'INVALID_USER',
            message: 'Sender or receiver does not exist'
          });
          return;
        }

        const senderId = senderRows[0].id;
        const receiverId = receiverRows[0].id;

        // Retrieve messages between sender and receiver
        const [messages] = await connection.query(
          `SELECT message, date
		   FROM chat
		   WHERE (sender = ? AND receiver = ?) OR (sender = ? AND receiver = ?)
		   ORDER BY date ASC`,
		  [senderId, receiverId, receiverId, senderId]
		);

        const formattedMessages = messages.map((message) => {
			return {
				message_id: message.id,
				sender_username: sender,
				receiver_username: receiver,
				text: message.message,
				timestamp: message.date
			};
		});


        // Commit transaction
        await connection.commit();

        reply.code(200).send({
          success: true,
          messages: formattedMessages
        });
      } catch (error) {
        // Rollback transaction in case of error
        await connection.rollback();

        reply.code(500).send({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An error occurred while retrieving messages',
          error: error.message
        });
      } finally {
        connection.release();
      }
    }
  });
}
