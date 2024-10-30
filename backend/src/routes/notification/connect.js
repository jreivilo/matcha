'use strict';

const { verifyToken } = require('../../jwt');

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
        console.log("token missing")
        socket.close();
        return;
      }

      try {
        const decodedPayload = verifyToken(token, 'your-secret-key');

        const username = decodedPayload.sub;
        fastify.userConnections.set(username, socket);
        socket.username = username;

        socket.send(JSON.stringify({
            type: 'PONG',
            message: 'Pong'
        }));

        socket.on('message', (msg) => {
          const data = JSON.parse(msg);
          if (data.type === 'PING') {
            socket.send(JSON.stringify({ type: 'PONG', message: 'Pong' }));
          }
          else {
            socket.send(JSON.stringify({ type: 'PONG', message: "what?"}))
          }
        });

      } catch (error) {
        console.log('Other error', error)
        socket.send(JSON.stringify({
          type: 'ERROR',
          error: 'Authentication Error'
        }));
        // socket.close();
        return () => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.close();
          }
        };
      }
    },
    onClose: (socket) => {
      const username = socket.username;
      fastify.userConnections.delete(username);
      console.log('Socket closed:', fastify.userConnections);
    }
  });
}

