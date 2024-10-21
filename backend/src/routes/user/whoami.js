const fastifyPlugin = require('fastify-plugin');
const crypto = require('crypto');

module.exports = fastifyPlugin(async function (fastify, opts) {
    // Register JWT plugin
    fastify.register(require('fastify-jwt'), {
        secret: 'super secret key', // Secret used to sign the JWT
    });

    // The new /user/whoami route
    fastify.route({
        url: '/whoami',
        method: ['GET'],
        schema: {
            summary: 'Get username from JWT',
            description: 'Returns the username from the provided JWT token',
            tags: ['User'],
            response: {
                200: {
                    description: 'Username fetched successfully',
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        username: { type: 'string' }
                    }
                },
                401: {
                    description: 'Unauthorized',
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        message: { type: 'string' }
                    }
                },
                500: {
                    description: 'Internal server error',
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        message: { type: 'string' }
                    }
                }
            }
        },
        handler: async (request, reply) => {
            try {
                // Verify and decode JWT
                const token = request.headers.authorization?.split(' ')[1]; // Assuming Bearer Token format
                if (!token) {
                    reply.code(401).send({
                        success: false,
                        message: 'Missing or invalid token'
                    });
                    return;
                }

                const decoded = fastify.jwt.verify(token);
                const username = decoded.sub; // `sub` is the username in the JWT

                reply.code(200).send({
                    success: true,
                    username
                });
            } catch (err) {
                console.error('Error decoding JWT', err);
                reply.code(401).send({
                    success: false,
                    message: 'Invalid token or expired token'
                });
            }
        }
    });
});
